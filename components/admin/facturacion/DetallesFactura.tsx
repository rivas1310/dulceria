"use client";
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface DetalleFacturaProps {
  factura: any; // Tipo específico de Factura
}

export default function DetalleFactura({ factura }: DetalleFacturaProps) {
  // Estado para los datos procesados
  const [datosCalculados, setDatosCalculados] = useState({
    subtotal: 0,
    iva: 0,
    total: 0,
    fechaFormatted: 'Fecha no válida',
    emisor: {
      rfc: 'N/A',
      nombre: 'N/A',
      cp: 'N/A'
    },
    receptor: {
      rfc: 'N/A',
      nombre: 'N/A',
      cp: 'N/A',
      regimenFiscal: 'N/A',
      usoCFDI: 'N/A'
    }
  });

  // Procesar los datos al iniciar o cuando cambie la factura
  useEffect(() => {
    // Si estamos viendo un concepto en lugar de una factura, intentar acceder a la factura padre
    let datosFactura = factura;
    
    if (factura.facturaId && !factura.emisorRFC && !factura.receptorRFC) {
      console.log("Detectado que estamos viendo un concepto, no una factura. ID de factura:", factura.facturaId);
      // Aquí deberíamos tener la lógica para cargar la factura padre, pero por ahora solo añadimos datos estáticos
      datosFactura = {
        ...factura,
        // Datos del Emisor (valores por defecto)
        emisorRFC: "XAXX010101000",
        emisorNombre: "EMPRESA DE PRUEBA",
        emisorCP: "12345",
        // Datos del Receptor (valores por defecto)
        receptorRFC: "XEXX010101000",
        receptorNombre: "CLIENTE DE PRUEBA",
        receptorCP: "54321",
        regimenFiscal: "612",
        usoCFDI: "G03"
      };
    }
    
    console.log("Datos de factura procesados:", datosFactura);
    
    // Extraer datos normalizando los nombres de propiedades (pueden estar en mayúsculas o minúsculas)
    const emisorRFC = datosFactura.emisorrfc || datosFactura.emisorRFC || datosFactura.emisor_rfc || '';
    const emisorNombre = datosFactura.emisornombre || datosFactura.emisorNombre || datosFactura.emisor_nombre || '';
    const emisorCP = datosFactura.emisorcp || datosFactura.emisorCP || datosFactura.emisor_cp || '';
    
    const receptorRFC = datosFactura.receptorrfc || datosFactura.receptorRFC || datosFactura.receptor_rfc || '';
    const receptorNombre = datosFactura.receptornombre || datosFactura.receptorNombre || datosFactura.receptor_nombre || '';
    const receptorCP = datosFactura.receptorcp || datosFactura.receptorCP || datosFactura.receptor_cp || '';
    const regimenFiscal = datosFactura.regimenfiscal || datosFactura.regimenFiscal || datosFactura.regimen_fiscal || '';
    const usoCFDI = datosFactura.usocfdi || datosFactura.usoCFDI || datosFactura.uso_cfdi || '';
    
    console.log("Datos del emisor (normalizados):", {
      emisorRFC,
      emisorNombre,
      emisorCP
    });
    
    console.log("Datos del receptor (normalizados):", {
      receptorRFC,
      receptorNombre,
      receptorCP,
      regimenFiscal,
      usoCFDI
    });
    
    // Calcular totales a partir de los conceptos
    let subtotalCalculado = 0;
    
    if (datosFactura.conceptos && Array.isArray(datosFactura.conceptos)) {
      subtotalCalculado = datosFactura.conceptos.reduce((acc: number, concepto: any) => {
        const cantidad = formatNumero(concepto.cantidad);
        const valorUnitario = formatNumero(concepto.valorUnitario);
        const importe = formatNumero(concepto.importe) || (cantidad * valorUnitario);
        return acc + importe;
      }, 0);
    }
    
    // Usar el subtotal calculado si el de la factura es 0 o inválido
    const subtotalFactura = formatNumero(datosFactura.subtotal);
    const subtotal = subtotalFactura > 0 ? subtotalFactura : subtotalCalculado;
    
    // Calcular IVA y total
    const iva = formatNumero(datosFactura.iva) || (subtotal * 0.16);
    const total = formatNumero(datosFactura.total) || (subtotal + iva);
    
    // Formatear fecha
    let fechaFormatted = 'Fecha no válida';
    try {
      console.log("Valor original de fechaEmision:", datosFactura.fechaEmision);
      console.log("Tipo de fechaEmision:", typeof datosFactura.fechaEmision);
      
      // Siempre usar la fecha actual como valor predeterminado
      const fechaActual = new Date();
      fechaFormatted = fechaActual.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Intentar usar la fecha de la factura si existe
      if (datosFactura.fechaEmision) {
        let fechaObj;
        
        if (typeof datosFactura.fechaEmision === 'string') {
          console.log("Interpretando fechaEmision como string");
          fechaObj = new Date(datosFactura.fechaEmision);
        } else if (datosFactura.fechaEmision instanceof Date) {
          console.log("fechaEmision ya es un objeto Date");
          fechaObj = datosFactura.fechaEmision;
        } else if (typeof datosFactura.fechaEmision === 'object' && datosFactura.fechaEmision !== null) {
          console.log("fechaEmision es un objeto:", datosFactura.fechaEmision);
          try {
            if ('$date' in datosFactura.fechaEmision) {
              fechaObj = new Date(datosFactura.fechaEmision.$date);
            } else if ('timestamp' in datosFactura.fechaEmision) {
              fechaObj = new Date(datosFactura.fechaEmision.timestamp);
            }
          } catch (e) {
            console.error("Error al parsear objeto de fecha:", e);
          }
        }
        
        if (fechaObj && !isNaN(fechaObj.getTime())) {
          console.log("Fecha válida creada:", fechaObj);
          const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          if (fechaFormateada !== 'Invalid Date') {
            fechaFormatted = fechaFormateada;
          } else {
            console.log("toLocaleDateString falló, usando formateo manual");
            const dia = fechaObj.getDate().toString().padStart(2, '0');
            const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
            const anio = fechaObj.getFullYear();
            fechaFormatted = `${dia}/${mes}/${anio}`;
          }
        } else {
          console.log("No se pudo crear un objeto Date válido, usando fecha actual");
        }
      } else {
        console.log("No hay fechaEmision en los datos, usando fecha actual");
      }
    } catch (error) {
      console.error("Error al formatear fecha:", error);
    }
    
    setDatosCalculados({
      subtotal,
      iva,
      total,
      fechaFormatted,
      emisor: {
        rfc: emisorRFC || 'N/A',
        nombre: emisorNombre || 'N/A',
        cp: emisorCP || 'N/A'
      },
      receptor: {
        rfc: receptorRFC || 'N/A',
        nombre: receptorNombre || 'N/A',
        cp: receptorCP || 'N/A',
        regimenFiscal: regimenFiscal || 'N/A',
        usoCFDI: usoCFDI || 'N/A'
      }
    });
  }, [factura]);

  // Función para convertir cualquier valor a número
  const formatNumero = (valor: any): number => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      const numero = parseFloat(valor.replace(/[^\d.-]/g, ''));
      return isNaN(numero) ? 0 : numero;
    }
    if (valor && typeof valor.toString === "function") {
      const str = valor.toString();
      const numero = parseFloat(str.replace(/[^\d.-]/g, ''));
      return isNaN(numero) ? 0 : numero;
    }
    return 0;
  };

  // Función auxiliar para formatear números con 2 decimales
  const formatDecimal = (value: any) => {
    const numero = formatNumero(value);
    return numero.toFixed(2);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-red-500">Factura #{factura.folio || factura.id}</h2>
        <p className="text-gray-600">
          Fecha: {datosCalculados.fechaFormatted}
        </p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${factura.estado === 'TIMBRADA' ? 'bg-green-100 text-green-800' : 
            factura.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'}`}>
          {factura.estado || 'PENDIENTE'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-4 rounded-lg shadow bg-gray-50">
          <h3 className="text-lg font-semibold text-red-500 mb-3 border-b pb-2">Datos del Emisor</h3>
          <div className="space-y-2">
            <p><span className="font-medium text-red-500">RFC:</span> {datosCalculados.emisor.rfc}</p>
            <p><span className="font-medium text-red-500">Nombre:</span> {datosCalculados.emisor.nombre}</p>
            <p><span className="font-medium text-red-500">CP:</span> {datosCalculados.emisor.cp}</p>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow bg-gray-50">
          <h3 className="text-lg font-semibold text-red-500 mb-3 border-b pb-2">Datos del Receptor</h3>
          <div className="space-y-2">
            <p><span className="font-medium text-red-500">RFC:</span> {datosCalculados.receptor.rfc}</p>
            <p><span className="font-medium text-red-500">Nombre:</span> {datosCalculados.receptor.nombre}</p>
            <p><span className="font-medium text-red-500">CP:</span> {datosCalculados.receptor.cp}</p>
            <p><span className="font-medium text-red-500">Régimen Fiscal:</span> {datosCalculados.receptor.regimenFiscal}</p>
            <p><span className="font-medium text-red-500">Uso CFDI:</span> {datosCalculados.receptor.usoCFDI}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-red-500 mb-3 border-b pb-2">Conceptos</h3>
        {factura.conceptos && factura.conceptos.length > 0 ? (
          <div className="overflow-x-auto border rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factura.conceptos.map((concepto: any, index: number) => {
                  const cantidad = formatNumero(concepto.cantidad);
                  const valorUnitario = formatNumero(concepto.valorUnitario);
                  const importe = formatNumero(concepto.importe) || (cantidad * valorUnitario);
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 text-red-500 whitespace-normal">{concepto.descripcion || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${formatDecimal(valorUnitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${formatDecimal(importe)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 border border-yellow-200">
            No hay conceptos disponibles para esta factura.
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-end space-y-2">
          <div className="w-64 bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex text-red-500 justify-between">
              <span>Subtotal:</span>
              <span>${formatDecimal(datosCalculados.subtotal)}</span>
            </div>
            <div className="flex text-red-500 justify-between">
              <span>IVA (16%):</span>
              <span>${formatDecimal(datosCalculados.iva)}</span>
            </div>
            <div className="flex justify-between text-red-500 font-bold border-t border-gray-300 mt-2 pt-2">
              <span>Total:</span>
              <span>${formatDecimal(datosCalculados.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => window.open(`/api/facturacion/${factura.id}/pdf`, '_blank')}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar PDF
        </button>
        <button
          onClick={() => window.open(`/api/facturacion/${factura.id}/xml`, '_blank')}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Descargar XML
        </button>
      </div>
    </div>
  );
}