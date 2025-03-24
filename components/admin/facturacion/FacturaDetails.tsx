// components/admin/facturacion/FacturaDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/src/lib/utils';

interface FacturaItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  producto?: {
    id: string;
    nombre: string;
  } | null;
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
  orden?: {
    id: string;
    numero: string;
  } | null;
  items: FacturaItem[];
}

export default function FacturaDetails({ id }: { id: string }) {
  const router = useRouter();
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [cambioEstado, setCambioEstado] = useState(false);

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

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!factura) return;
    
    try {
      setCambioEstado(true);
      
      const response = await fetch(`/api/facturacion/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar el estado');
      }

      const facturaActualizada = await response.json();
      setFactura(facturaActualizada);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cambiar el estado de la factura');
    } finally {
      setCambioEstado(false);
    }
  };

  const eliminarFactura = async () => {
    if (!window.confirm('¿Está seguro de eliminar esta factura? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setEliminando(true);
      
      const response = await fetch(`/api/facturacion/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la factura');
      }

      router.push('/admin/facturacion');
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar la factura');
      setEliminando(false);
    }
  };

  if (loading) return <div>Cargando factura...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!factura) return <div>Factura no encontrada</div>;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Factura: {factura.numero}</h2>
            <div className="text-gray-600 mt-1">
              Fecha: {formatDate(factura.fecha)}
            </div>
            {factura.fechaVencimiento && (
              <div className="text-gray-600">
                Vencimiento: {formatDate(factura.fechaVencimiento)}
              </div>
            )}
          </div>
          <div className={`px-3 py-1 rounded text-white ${getEstadoColor(factura.estado)}`}>
            {factura.estado}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            {factura.cliente ? (
              <div>
                <div className="font-medium">{factura.cliente.nombre}</div>
                {factura.cliente.email && <div>{factura.cliente.email}</div>}
                {factura.cliente.telefono && <div>{factura.cliente.telefono}</div>}
                {factura.cliente.direccion && <div>{factura.cliente.direccion}</div>}
              </div>
            ) : (
              <div className="text-gray-500">Cliente no especificado</div>
            )}
          </div>
          
          {factura.orden && (
            <div>
              <h3 className="font-semibold mb-2">Orden relacionada</h3>
              <div>
                Orden #{factura.orden.numero}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 border-b">
        <h3 className="font-semibold mb-3">Productos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Descripción</th>
                <th className="py-3 px-4 text-right">Cantidad</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {factura.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4">{item.descripcion}</td>
                  <td className="py-3 px-4 text-right">{item.cantidad}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.precioUnitario)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t">
              <span>Subtotal:</span>
              <span>{formatCurrency(factura.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>IVA (16%):</span>
              <span>{formatCurrency(factura.impuesto)}</span>
            </div>
            <div className="flex justify-between py-2 border-t font-bold">
              <span>Total:</span>
              <span>{formatCurrency(factura.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {factura.notas && (
        <div className="p-6 border-b">
          <h3 className="font-semibold mb-2">Notas</h3>
          <p className="text-gray-700 whitespace-pre-line">{factura.notas}</p>
        </div>
      )}
      
      <div className="p-6 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          {/* Botones para cambiar estado */}
          {factura.estado !== 'PAGADA' && (
            <button
              onClick={() => cambiarEstado('PAGADA')}
              disabled={cambioEstado}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              Marcar como Pagada
            </button>
          )}
          
          {factura.estado !== 'CANCELADA' && (
            <button
              onClick={() => cambiarEstado('CANCELADA')}
              disabled={cambioEstado}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
            >
              Cancelar Factura
            </button>
          )}
          
          {factura.estado === 'CANCELADA' && (
            <button
              onClick={() => cambiarEstado('PENDIENTE')}
              disabled={cambioEstado}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
            >
              Reactivar
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Acciones de edición/eliminación */}
          {factura.estado !== 'PAGADA' && factura.estado !== 'CANCELADA' && (
            <button
              onClick={() => router.push(`/admin/facturacion/editar/${id}`)}
              className="px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            >
              Editar
            </button>
          )}
          
          {factura.estado !== 'PAGADA' && (
            <button
              onClick={eliminarFactura}
              disabled={eliminando}
              className="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-500';
    case 'PAGADA':
      return 'bg-green-500';
    case 'VENCIDA':
      return 'bg-red-500';
    case 'CANCELADA':
      return 'bg-gray-500';
    case 'BORRADOR':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}