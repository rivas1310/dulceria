"use client";
import { format } from 'date-fns';

interface FacturaRaw {
  id: number;
  folio: string | null;
  fechaEmision: string | Date;
  receptorNombre: string;
  total: number | string;
  estado: string;
}

interface ListaFacturasProps {
  facturas: FacturaRaw[];
}

export default function ListaFacturas({ facturas }: ListaFacturasProps) {
  // Función auxiliar para formatear fechas en español
  const formatearFecha = (fecha: string | Date) => {
    try {
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      // Usamos el API nativo de JavaScript en lugar de date-fns con locale
      return fechaObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      // Fallback a un formato simple
      return typeof fecha === 'string' ? fecha : format(fecha, 'dd/MM/yyyy');
    }
  };

  // Función para convertir el total a número y formatearlo
  const formatearTotal = (total: number | string) => {
    try {
      const numeroTotal = typeof total === 'string' ? parseFloat(total) : total;
      return `$${numeroTotal.toFixed(2)}`;
    } catch (error) {
      return `$${total}`;
    }
  };

  return (
    <div className="mt-6 overflow-x-auto">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a 
                    href={`/admin/facturacion/${factura.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Ver
                  </a>
                  <button 
                    onClick={() => window.open(`/api/facturacion/${factura.id}/pdf`, '_blank')}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    PDF
                  </button>
                  <button 
                    onClick={() => window.open(`/api/facturacion/${factura.id}/xml`, '_blank')}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    XML
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center">
                No hay facturas disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}