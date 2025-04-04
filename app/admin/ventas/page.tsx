'use client';

import { useState, useEffect } from 'react';

// Interfaces para tipado
interface ProductoVenta {
  id: number;
  nombre: string;
  cantidad: number;
  total: number;
}

interface VentaHora {
  hora: number;
  cantidad: number;
  total: number;
}

interface ResumenVentas {
  fechaInicio: string;
  fechaFin: string;
  resumen: {
    totalVentas: number;
    cantidadOrdenes: number;
    promedioVenta: number;
  };
  ventasPorProducto: ProductoVenta[];
  ventasPorHora: VentaHora[];
}

export default function VentasDiariasPage() {
  const [fecha, setFecha] = useState(new Date());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datosVentas, setDatosVentas] = useState<ResumenVentas | null>(null);
  const [tipoVista, setTipoVista] = useState<'productos' | 'horas'>('productos');
  const [fechaStr, setFechaStr] = useState(formatoFechaInput(new Date()));

  // Cargar datos al cambiar la fecha
  useEffect(() => {
    cargarDatosVentas(fecha);
  }, [fecha]);

  // Función para formatear fecha en formato yyyy-MM-dd para el input
  function formatoFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Función para formatear fecha en formato dd/MM/yyyy para mostrar
  function formatoFechaVisual(fecha: Date): string {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Manejar cambio de fecha desde el input
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFechaStr = e.target.value;
    setFechaStr(nuevaFechaStr);
    
    try {
      const nuevaFecha = new Date(nuevaFechaStr);
      setFecha(nuevaFecha);
    } catch (err) {
      console.error('Fecha inválida:', err);
    }
  };

  // Función para cargar datos de ventas
  const cargarDatosVentas = async (fecha: Date) => {
    setCargando(true);
    setError(null);
    
    try {
      const fechaFormateada = formatoFechaInput(fecha);
      const response = await fetch(`/api/ventas?fecha=${fechaFormateada}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.statusText}`);
      }
      
      const datos = await response.json();
      setDatosVentas(datos);
    } catch (err) {
      console.error('Error al cargar datos de ventas:', err);
      setError('No se pudieron cargar los datos de ventas. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Generar y descargar PDF de corte de caja
  const generarPDF = async () => {
    setCargando(true);
    try {
      const fechaFormateada = formatoFechaInput(fecha);
      const response = await fetch('/api/ventas/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: fechaFormateada,
          incluirDetalleProductos: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }
      
      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `corte-caja-${fechaFormateada}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('No se pudo generar el PDF. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Generar corte de caja en JSON
  const generarCorteCaja = async () => {
    setCargando(true);
    try {
      const fechaFormateada = formatoFechaInput(fecha);
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: fechaFormateada,
          incluirDetalles: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el corte de caja');
      }
      
      const resultado = await response.json();
      alert(`Corte de caja generado exitosamente.\nTotal de ventas: $${resultado.resumen.totalVentas.toFixed(2)}\nÓrdenes completadas: ${resultado.resumen.ordenesCompletadas}`);
    } catch (err) {
      console.error('Error al generar corte de caja:', err);
      setError('No se pudo generar el corte de caja. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ventas Diarias</h1>
      
      <div className="flex flex-wrap -mx-3">
        {/* Panel de filtros y acciones */}
        <div className="w-full md:w-1/3 px-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={fechaStr}
                onChange={handleFechaChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Acciones</h2>
              
              <div className="space-y-3">
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={generarPDF}
                  disabled={cargando}
                >
                  Descargar PDF
                </button>
                
                <button 
                  className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 disabled:opacity-50"
                  onClick={generarCorteCaja}
                  disabled={cargando}
                >
                  Generar Corte de Caja
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Panel de resumen */}
        <div className="w-full md:w-2/3 px-3">
          {error && (
            <div className="text-red-600 mb-4">
              {error}
            </div>
          )}
          
          {cargando ? (
            <div>Cargando datos...</div>
          ) : datosVentas ? (
            <>
              <div className="bg-white rounded-lg shadow mb-6 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Resumen de Ventas - {formatoFechaVisual(fecha)}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(datosVentas.resumen.totalVentas)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Órdenes</p>
                    <p className="text-2xl font-bold">
                      {datosVentas.resumen.cantidadOrdenes}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Promedio</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(datosVentas.resumen.promedioVenta)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Selector de vista */}
              <div className="flex justify-end mb-4">
                <select
                  value={tipoVista}
                  onChange={(e) => setTipoVista(e.target.value as 'productos' | 'horas')}
                  className="border border-gray-300 rounded-md p-2"
                >
                  <option value="productos">Por Producto</option>
                  <option value="horas">Por Hora</option>
                </select>
              </div>
              
              {/* Tabla de datos */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {tipoVista === 'productos' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datosVentas.ventasPorProducto.map((producto) => (
                        <tr key={producto.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{producto.cantidad}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(producto.total)}</td>
                        </tr>
                      ))}
                      {datosVentas.ventasPorProducto.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center">
                            No hay ventas en esta fecha
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                
                {tipoVista === 'horas' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Órdenes</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datosVentas.ventasPorHora.map((venta) => (
                        <tr key={venta.hora}>
                          <td className="px-6 py-4 whitespace-nowrap">{`${venta.hora}:00 - ${venta.hora}:59`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{venta.cantidad}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(venta.total)}</td>
                        </tr>
                      ))}
                      {datosVentas.ventasPorHora.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center">
                            No hay ventas en esta fecha
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div>
              Seleccione una fecha para ver el resumen de ventas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 