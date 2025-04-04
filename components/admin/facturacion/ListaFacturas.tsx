"use client";
import { format } from 'date-fns';

interface FacturaRaw {
  id: number;
  folio: string | null;
  fechaEmision: string | Date;
  receptorNombre: string;
  total: number | string;
  estado: string;
  conceptos?: any[];
}

interface ListaFacturasProps {
  facturas: FacturaRaw[];
}

export default function ListaFacturas({ facturas }: ListaFacturasProps) {
  // Función auxiliar para formatear fechas en español
  const formatearFecha = (fecha: string | Date) => {
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      return format(fechaObj, 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función auxiliar para formatear totales
  const formatearTotal = (total: number | string) => {
    try {
      const valor = typeof total === 'string' ? parseFloat(total) : total;
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(valor);
    } catch (error) {
      return 'Monto inválido';
    }
  };

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Folio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facturas && facturas.length > 0 ? (
              facturas.map((factura) => (
                <tr key={factura.id}>
                  <td className="px-6 text-red-500 py-4 whitespace-nowrap">
                    {factura.folio || 'Sin folio'}
                  </td>
                  <td className="px-6 text-red-500 py-4 whitespace-nowrap">
                    {formatearFecha(factura.fechaEmision)}
                  </td>
                  <td className="px-6 text-red-500 py-4 whitespace-nowrap">
                    {factura.receptorNombre}
                  </td>
                  <td className="px-6 text-red-500 py-4 whitespace-nowrap">
                    {formatearTotal(factura.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${factura.estado === 'TIMBRADA' ? 'bg-green-100 text-green-800' : 
                        factura.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/admin/facturacion/${factura.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Ver
                    </a>
                    <a
                      href={`/api/facturacion/${factura.id}/pdf`}
                      className="text-green-600 hover:text-green-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay facturas disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}