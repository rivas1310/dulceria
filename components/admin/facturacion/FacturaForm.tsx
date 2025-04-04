// components/admin/facturacion/FacturaForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ReceptorForm from './ReceptorForm';
import ConceptosForm from './ConceptosForm';
import ResumenFactura from './ResumenFactura';

// Definir interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  productoSAT: {
    claveSAT: string;
  } | null;
}

interface FacturaFormProps {
  productos: Product[];
}

export default function FacturaForm({ productos }: FacturaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [session, setSession] = useState(null);
  const [paso, setPaso] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [datosReceptor, setDatosReceptor] = useState({
    rfc: '',
    nombre: '',
    codigoPostal: '',
    regimenFiscal: '',
    usoCFDI: 'G03'
  });
  const [conceptos, setConceptos] = useState<Array<{
    productoId: number;
    cantidad: number;
    valorUnitario: number;
    descripcion: string;
    claveSAT: string;
  }>>([]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentSession = await getServerSession(authOptions as any);
        if (currentSession) {
          setSession(currentSession as any);
        }
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
        setSession(null);
      }
    };
    loadSession();
  }, []);

  if (!session) {
    return <div>Cargando...</div>;
  }

  // Verificar que productos existe y tiene datos
  if (!productos || productos.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">
          No hay productos disponibles para facturar.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      toast.loading('Generando factura...');
      
      // Validar que haya conceptos
      if (conceptos.length === 0) {
        toast.error('Debe agregar al menos un concepto a la factura');
        setIsLoading(false);
        return;
      }
      
      // Validar datos del receptor
      if (!datosReceptor.rfc || !datosReceptor.nombre || !datosReceptor.codigoPostal || !datosReceptor.regimenFiscal) {
        toast.error('Debe completar todos los datos del receptor');
        setIsLoading(false);
        return;
      }
      
      const dataToSend = {
        receptor: datosReceptor,
        conceptos: conceptos,
      };
      
      console.log('Enviando datos:', dataToSend);
      
      const response = await fetch('/api/facturacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error al generar la factura');
      }

      toast.dismiss();
      toast.success('Factura generada correctamente');
      router.push(`/admin/facturacion/${data.facturaId}`);
    } catch (error) {
      toast.dismiss();
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al generar la factura');
    } finally {
      setIsLoading(false);
    }
  };

  // Transformar productos para incluir claveSAT directamente
  const productosTransformados = productos.map(p => ({
    ...p,
    claveSAT: p.productoSAT?.claveSAT || ''
  }));

  return (
    <div className="max-w-4xl mx-auto text-red-500 bg-white rounded-lg shadow-lg p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {paso === 1 ? 'Datos del Receptor' : 
             paso === 2 ? 'Conceptos' : 
             'Resumen de Factura'}
          </h2>
          <div className="text-sm text-gray-500">
            Paso {paso} de 3
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(paso / 3) * 100}%` }}
          />
        </div>
      </div>

      {paso === 1 && (
        <ReceptorForm 
          datos={datosReceptor} 
          onChange={setDatosReceptor}
          onNext={() => setPaso(2)}
        />
      )}
      
      {paso === 2 && (
        <ConceptosForm
          productos={productosTransformados}
          conceptos={conceptos}
          onChange={setConceptos}
          onBack={() => setPaso(1)}
          onNext={() => setPaso(3)}
        />
      )}
      
      {paso === 3 && (
        <ResumenFactura
          datosReceptor={datosReceptor}
          conceptos={conceptos}
          onBack={() => setPaso(2)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}