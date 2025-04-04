import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import jsPDF from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Primero obtenemos las tablas disponibles
    const tablesResult = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Tablas disponibles:", tablesResult);
    
    // Buscar tablas por nombres posibles
    const tableNames = tablesResult as { table_name: string }[];
    const facturaTableName = findTableName(tableNames, ["facturas", "factura"]);
    const conceptoTableName = findTableName(tableNames, ["conceptos", "concepto", "conceptosfactura", "conceptofactura"]);
    
    console.log(`Usando tabla de facturas: ${facturaTableName}, tabla de conceptos: ${conceptoTableName}`);
    
    if (!facturaTableName) {
      return NextResponse.json(
        { error: "No se encontró la tabla de facturas" },
        { status: 404 }
      );
    }

    // Obtener la factura
    const facturaQuery = `
      SELECT * FROM "${facturaTableName}" WHERE id = $1::integer
    `;
    const facturas = await prisma.$queryRawUnsafe(facturaQuery, parseInt(id));
    
    if (!facturas || (facturas as any[]).length === 0) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }
    
    const factura = (facturas as any[])[0];
    console.log("Datos de factura:", JSON.stringify(factura, null, 2));
    
    // Obtener los conceptos si la tabla existe
    let conceptos: any[] = [];
    if (conceptoTableName) {
      const conceptosQuery = `
        SELECT * FROM "${conceptoTableName}" WHERE "facturaId" = $1::integer
      `;
      conceptos = await prisma.$queryRawUnsafe(conceptosQuery, parseInt(id)) as any[];
      console.log(`Encontrados ${conceptos.length} conceptos`);
    } else {
      console.log("No se encontró tabla de conceptos, comprobando si los conceptos están en la factura");
      // Verificar si los conceptos están en la factura (como JSON)
      if (factura.conceptos) {
        try {
          if (typeof factura.conceptos === 'string') {
            conceptos = JSON.parse(factura.conceptos);
          } else if (Array.isArray(factura.conceptos)) {
            conceptos = factura.conceptos;
          }
          console.log(`Extraídos ${conceptos.length} conceptos del campo JSON`);
        } catch (error) {
          console.error("Error al parsear conceptos de la factura:", error);
        }
      }
    }
    
    // Generar PDF
    const pdfBuffer = await generarPDF(factura, conceptos);
    
    // Devolver el PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Función para encontrar el nombre de la tabla
function findTableName(tables: { table_name: string }[], possibleNames: string[]): string | undefined {
  for (const name of possibleNames) {
    const found = tables.find((t) => t.table_name.toLowerCase() === name.toLowerCase());
    if (found) return found.table_name;
  }
  return undefined;
}

// Función para generar el PDF
async function generarPDF(factura: any, conceptos: any[]): Promise<ArrayBuffer> {
  // Funciones auxiliares
  const formatNumero = (valor: any): number => {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      // Eliminar cualquier carácter que no sea dígito, punto o signo
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

  const formatCurrency = (valor: any): string => {
    return `$${formatNumero(valor).toFixed(2)}`;
  };
  
  const formatFecha = (fecha: any): string => {
    if (!fecha) return "Fecha no disponible";
    
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) return "Fecha no válida";
      
      return fechaObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error, fecha);
      return "Fecha no válida";
    }
  };
  
  // Calcular totales basados en conceptos
  let subtotalCalculado = 0;
  if (conceptos && conceptos.length > 0) {
    subtotalCalculado = conceptos.reduce((acc, concepto) => {
      const cantidad = formatNumero(concepto.cantidad);
      const valorUnitario = formatNumero(concepto.valorUnitario);
      const importe = formatNumero(concepto.importe) || (cantidad * valorUnitario);
      return acc + importe;
    }, 0);
  }
  
  // Usar valores calculados si los originales no son válidos
  const subtotal = formatNumero(factura.subtotal) || subtotalCalculado;
  const iva = formatNumero(factura.iva) || (subtotal * 0.16);
  const total = formatNumero(factura.total) || (subtotal + iva);
  
  const fechaEmision = formatFecha(factura.fechaEmision);
  
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configuración de estilo
  const margenX = 20;
  let yPos = 20;
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`FACTURA #${factura.folio || factura.id}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // Fecha de emisión
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaEmision}`, margenX, yPos);
  yPos += 10;
  
  // Estado
  doc.setFontSize(10);
  doc.text(`Estado: ${factura.estado || 'PENDIENTE'}`, margenX, yPos);
  yPos += 15;
  
  // Datos del emisor
  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0); // Color rojo
  doc.text("DATOS DEL EMISOR", margenX, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`RFC: ${factura.emisorRFC || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`Nombre: ${factura.emisorNombre || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`CP: ${factura.emisorCP || 'N/A'}`, margenX, yPos);
  yPos += 15;
  
  // Datos del receptor
  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0); // Color rojo
  doc.text("DATOS DEL RECEPTOR", margenX, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`RFC: ${factura.receptorRFC || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`Nombre: ${factura.receptorNombre || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`CP: ${factura.receptorCP || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`Régimen Fiscal: ${factura.regimenFiscal || 'N/A'}`, margenX, yPos);
  yPos += 5;
  doc.text(`Uso CFDI: ${factura.usoCFDI || 'N/A'}`, margenX, yPos);
  yPos += 15;
  
  // Conceptos
  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0); // Color rojo
  doc.text("CONCEPTOS", margenX, yPos);
  yPos += 10;
  
  // Cabecera de la tabla
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Descripción", margenX, yPos);
  doc.text("Cantidad", margenX + 100, yPos);
  doc.text("Valor Unitario", margenX + 130, yPos);
  doc.text("Importe", margenX + 160, yPos);
  yPos += 5;
  
  // Línea separadora
  doc.line(margenX, yPos, margenX + 170, yPos);
  yPos += 7;
  
  // Contenido de la tabla
  if (conceptos && conceptos.length > 0) {
    for (const concepto of conceptos) {
      const cantidad = formatNumero(concepto.cantidad);
      const valorUnitario = formatNumero(concepto.valorUnitario);
      const importe = formatNumero(concepto.importe) || (cantidad * valorUnitario);
      
      // Ajustar ancho de la descripción
      const descripcion = concepto.descripcion || 'N/A';
      doc.text(descripcion.substring(0, 50), margenX, yPos);
      doc.text(cantidad.toString(), margenX + 100, yPos);
      doc.text(formatCurrency(valorUnitario), margenX + 130, yPos);
      doc.text(formatCurrency(importe), margenX + 160, yPos);
      
      yPos += 7;
      
      // Nueva página si es necesario
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    }
  } else {
    doc.text("No hay conceptos disponibles para esta factura", margenX, yPos);
    yPos += 10;
  }
  
  yPos += 10;
  
  // Totales
  doc.line(margenX + 100, yPos, margenX + 170, yPos);
  yPos += 7;
  
  doc.text("Subtotal:", margenX + 100, yPos);
  doc.text(formatCurrency(subtotal), margenX + 160, yPos);
  yPos += 7;
  
  doc.text("IVA (16%):", margenX + 100, yPos);
  doc.text(formatCurrency(iva), margenX + 160, yPos);
  yPos += 7;
  
  doc.setFontSize(12);
  doc.text("Total:", margenX + 100, yPos);
  doc.text(formatCurrency(total), margenX + 160, yPos);
  
  // Convertir a ArrayBuffer
  return doc.output('arraybuffer');
}

