// components/admin/facturacion/FacturaPrint.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/src/lib/utils';

interface FacturaItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

interface Factura {
  id: string;
  numero: string;
  fecha: string;
  fechaVencimiento?: string;
  estado: string;
  subtotal: number;
  impuesto: number;
  total: number;
  notas?: string;
  cliente: {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  } | null;
  items: FacturaItem[];
}

// Función para determinar la clase CSS según el estado de la factura
const getEstadoClass = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'pagada':
      return 'bg-green-100 text-green-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'cancelada':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function FacturaPrint({ id }: { id: string }) {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const response = await fetch(`/api/facturacion/${id}`);
        if (!response.ok) {
          throw new Error('Error al cargar la factura');
        }
        const data = await response.json();
        setFactura(data);
      } catch (err) {
        console.error('Error:', err);
        setError('No se pudo cargar la factura');
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id]);

  useEffect(() => {
    // Efecto para la impresión automática
    if (factura && !loading && !error) {
      // Pequeña espera para asegurar que el documento está renderizado
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [factura, loading, error]);

  if (loading) return <div>Cargando factura...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!factura) return <div>Factura no encontrada</div>;

  return (
    <div className="p-8 print:p-4">
      {/* Encabezado */}
      <div className="flex justify-between mb-8">
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Unisite Cafetería" 
            width={80} 
            height={80} 
            className="mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">Unisite Cafetería</h1>
            <p>Dirección de la cafetería</p>
            <p>Ciudad, Estado, CP</p>
            <p>Tel: (123) 456-7890</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-blue-600">FACTURA</h2>
          <p className="font-medium">N° {factura.numero}</p>
          <p>Fecha: {formatDate(factura.fecha)}</p>
          {factura.fechaVencimiento && (
            <p>Vencimiento: {formatDate(factura.fechaVencimiento)}</p>
          )}
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoClass(factura.estado)}`}>
              {factura.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="mb-8 p-4 border border-gray-200 rounded">
        <h3 className="font-bold text-gray-700 mb-2">CLIENTE</h3>
        {factura.cliente ? (
          <>
            <p className="font-medium">{factura.cliente.nombre}</p>
            {factura.cliente.email && <p>Email: {factura.cliente.email}</p>}
            {factura.cliente.telefono && <p>Tel: {factura.cliente.telefono}</p>}
            {factura.cliente.direccion && <p>Dirección: {factura.cliente.direccion}</p>}
          </>
        ) : (
          <p className="text-gray-500">Cliente no especificado</p>
        )}
      </div>

      {/* Tabla de productos */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-2 text-left border border-gray-200">Descripción</th>
            <th className="p-2 text-right border border-gray-200">Cantidad</th>
            <th className="p-2 text-right border border-gray-200">Precio Unit.</th>
            <th className="p-2 text-right border border-gray-200">Importe</th>
          </tr>
        </thead>
        <tbody>
          {factura.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 border border-gray-200">{item.descripcion}</td>
              <td className="p-2 text-right border border-gray-200">{item.cantidad}</td>
              <td className="p-2 text-right border border-gray-200">{formatCurrency(item.precioUnitario)}</td>
              <td className="p-2 text-right border border-gray-200">{formatCurrency(item.importe)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumen y totales */}
      <div className="flex justify-end mb-8">
        <div className="w-72">
          <div className="flex justify-between p-2 border-b">
            <span>Subtotal:</span>
            <span>{formatCurrency(factura.subtotal)}</span>
          </div>
          <div className="flex justify-between p-2 border-b">
            <span>IVA (16%):</span>
            <span>{formatCurrency(factura.impuesto)}</span>
          </div>
          <div className="flex justify-between p-2 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(factura.total)}</span>
          </div>
        </div>
      </div>

      {/* Notas y condiciones */}
      <div className="mb-8">
        {factura.notas && (
          <div className="mb-4">
            <h3 className="font-bold mb-1">Notas:</h3>
            <p className="text-gray-700 whitespace-pre-line">{factura.notas}</p>
          </div>
        )}

        <div>
          <h3 className="font-bold mb-1">Términos y condiciones:</h3>
          <ul className="text-sm text-gray-700">
            <li>Pago en efectivo o transferencia bancaria.</li>
            <li>La factura se considera pagada una vez que se recibe el pago completo.</li>
            <li>Para cualquier consulta, contacte al número telefónico indicado.</li>
          </ul>
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-center text-sm text-gray-500 mt-12 pt-4 border-t">
        <p>Gracias por su preferencia</p>
        <p>© {new Date().getFullYear()} Unisite Cafetería - Todos los derechos reservados</p>
      </div>

      {/* Botón para imprimir (solo visible en pantalla, no en impresión) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Imprimir Factura
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded ml-4"
        >
          Volver
        </button>
      </div>
    </div>
  );
}