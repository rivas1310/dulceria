// components/admin/facturacion/FacturasList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/src/lib/utils';

interface Factura {
  id: string;
  numero: string;
  fecha: string;
  cliente: { nombre: string } | null;
  total: number;
  estado: string;
}

export default function FacturasList() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const response = await fetch('/api/facturacion');
        if (!response.ok) {
          throw new Error('Error al cargar las facturas');
        }
        const data = await response.json();
        setFacturas(data);
      } catch (err) {
        setError('No se pudieron cargar las facturas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, []);

  if (loading) return <div>Cargando facturas...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (facturas.length === 0) return <div>No hay facturas registradas</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Número</th>
            <th className="py-3 px-4 text-left">Fecha</th>
            <th className="py-3 px-4 text-left">Cliente</th>
            <th className="py-3 px-4 text-right">Total</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr key={factura.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{factura.numero}</td>
              <td className="py-3 px-4">{formatDate(factura.fecha)}</td>
              <td className="py-3 px-4">{factura.cliente?.nombre || 'Cliente no especificado'}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(factura.total)}</td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-1 rounded text-xs ${getEstadoColor(factura.estado)}`}>
                  {factura.estado}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center space-x-2">
                  <Link 
                    href={`/admin/facturacion/${factura.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Ver
                  </Link>
                  <Link 
                    href={`/admin/facturacion/imprimir/${factura.id}`}
                    className="text-green-500 hover:text-green-700"
                    target="_blank"
                  >
                    Imprimir
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAGADA':
      return 'bg-green-100 text-green-800';
    case 'VENCIDA':
      return 'bg-red-100 text-red-800';
    case 'CANCELADA':
      return 'bg-gray-100 text-gray-800';
    case 'BORRADOR':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}