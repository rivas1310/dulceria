import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import jsPDF from 'jspdf';

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

export async function POST(request: NextRequest) {
  try {
    const { fecha, incluirDetalleProductos } = await request.json();
    
    let startDate: Date;
    let endDate: Date;
    
    // Si no se proporciona fecha, usar la fecha actual
    if (!fecha) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(fecha);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(fecha);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Consultar órdenes en el período especificado
    const ordenes = await prisma.order.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        },
        facturas: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Calcular totales
    const ordenesCompletadas = ordenes.filter(o => o.status);
    const ordenesPendientes = ordenes.filter(o => !o.status);
    
    // Calcular ventas por forma de pago
    const ventasPorFormaPago = {
      EFECTIVO: 0,
      TRANSFERENCIA: 0,
      TARJETA_CREDITO: 0,
      TARJETA_DEBITO: 0,
      SIN_FACTURAR: 0
    };
    
    // Para ordenes con factura, sumar según forma de pago
    ordenes.forEach(orden => {
      if (orden.facturas) {
        ventasPorFormaPago[orden.facturas.formaPago] += orden.total;
      } else if (orden.status) {
        // Para órdenes completadas sin factura, sumar como SIN_FACTURAR
        ventasPorFormaPago.SIN_FACTURAR += orden.total;
      }
    });
    
    // Calcular totales generales
    const totalVentas = ordenesCompletadas.reduce((acc, orden) => acc + orden.total, 0);
    const ventaPromedio = ordenesCompletadas.length > 0 
      ? totalVentas / ordenesCompletadas.length 
      : 0;
    
    // Calcular ventas por producto
    const ventasPorProducto: ProductoVenta[] = [];
    const productosMap = new Map<number, ProductoVenta>();
    
    ordenesCompletadas.forEach(orden => {
      orden.orderProducts.forEach(op => {
        const productoId = op.product.id;
        
        if (!productosMap.has(productoId)) {
          productosMap.set(productoId, {
            id: productoId,
            nombre: op.product.name,
            cantidad: 0,
            total: 0
          });
        }
        
        const productoActual = productosMap.get(productoId);
        if (productoActual) {
          productoActual.cantidad += op.quantity;
          productoActual.total += op.quantity * op.product.price;
          
          productosMap.set(productoId, productoActual);
        }
      });
    });
    
    // Convertir Map a Array para el resultado final
    productosMap.forEach(producto => {
      ventasPorProducto.push(producto);
    });
    
    // Ordenar por total de ventas (de mayor a menor)
    ventasPorProducto.sort((a, b) => b.total - a.total);
    
    // Generar PDF
    const pdfBuffer = await generarPDF({
      fecha: startDate,
      totalVentas,
      ventaPromedio,
      ordenesCompletadas: ordenesCompletadas.length,
      ordenesPendientes: ordenesPendientes.length,
      ventasPorFormaPago,
      ventasPorProducto,
      incluirDetalleProductos
    });
    
    // Formatear fecha para el nombre del archivo
    const fechaFormateada = formatoFechaArchivo(startDate);
    
    // Devolver el PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="corte-caja-${fechaFormateada}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar PDF de corte de caja:", error);
    return NextResponse.json(
      { error: "Error al generar PDF de corte de caja", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Función para formatear fecha como YYYY-MM-DD
function formatoFechaArchivo(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para formatear fecha en formato visual dd/mm/yyyy
function formatoFechaVisual(fecha: Date): string {
  try {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Fecha no válida";
  }
}

// Función para generar el PDF
async function generarPDF(datos: {
  fecha: Date;
  totalVentas: number;
  ventaPromedio: number;
  ordenesCompletadas: number;
  ordenesPendientes: number;
  ventasPorFormaPago: Record<string, number>;
  ventasPorProducto: ProductoVenta[];
  incluirDetalleProductos?: boolean;
}): Promise<ArrayBuffer> {
  // Funciones auxiliares
  const formatCurrency = (valor: number): string => {
    return `$${valor.toFixed(2)}`;
  };
  
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configuración de estilo
  const margenX = 20;
  let yPos = 20;
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("CORTE DE CAJA", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${formatoFechaVisual(datos.fecha)}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 20;
  
  // Resumen de ventas
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0); // Color rojo
  doc.text("RESUMEN DE VENTAS", margenX, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de ventas: ${formatCurrency(datos.totalVentas)}`, margenX, yPos);
  yPos += 7;
  
  doc.text(`Órdenes completadas: ${datos.ordenesCompletadas}`, margenX, yPos);
  yPos += 7;
  
  doc.text(`Órdenes pendientes: ${datos.ordenesPendientes}`, margenX, yPos);
  yPos += 7;
  
  doc.text(`Venta promedio: ${formatCurrency(datos.ventaPromedio)}`, margenX, yPos);
  yPos += 15;
  
  // Ventas por forma de pago
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0); // Color rojo
  doc.text("VENTAS POR FORMA DE PAGO", margenX, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Mostrar cada forma de pago y su total
  for (const [formaPago, total] of Object.entries(datos.ventasPorFormaPago)) {
    if (total > 0) {
      const formateado = formaPago.replace('_', ' ');
      doc.text(`${formateado}: ${formatCurrency(total)}`, margenX, yPos);
      yPos += 7;
    }
  }
  
  yPos += 10;
  
  // Ventas por producto (si se solicita)
  if (datos.incluirDetalleProductos && datos.ventasPorProducto.length > 0) {
    // Nueva página si estamos cerca del final
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(200, 0, 0); // Color rojo
    doc.text("PRODUCTOS VENDIDOS", margenX, yPos);
    yPos += 10;
    
    // Cabecera de la tabla
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Producto", margenX, yPos);
    doc.text("Cantidad", margenX + 100, yPos);
    doc.text("Total", margenX + 140, yPos);
    yPos += 5;
    
    // Línea separadora
    doc.line(margenX, yPos, margenX + 170, yPos);
    yPos += 7;
    
    // Mostrar los productos vendidos (Top 20 si hay muchos)
    const productosAMostrar = datos.ventasPorProducto.slice(0, 20);
    
    for (const producto of productosAMostrar) {
      // Ajustar espacio para nombre largo
      const nombreProducto = producto.nombre.length > 40 
        ? producto.nombre.substring(0, 37) + '...' 
        : producto.nombre;
      
      doc.text(nombreProducto, margenX, yPos);
      doc.text(producto.cantidad.toString(), margenX + 100, yPos);
      doc.text(formatCurrency(producto.total), margenX + 140, yPos);
      
      yPos += 7;
      
      // Nueva página si es necesario
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    }
    
    // Si hay más productos que no se mostraron
    if (datos.ventasPorProducto.length > 20) {
      yPos += 5;
      doc.setFontStyle('italic');
      doc.text(`... y ${datos.ventasPorProducto.length - 20} productos más`, margenX, yPos);
      doc.setFontStyle('normal');
    }
  }
  
  // Pie de página
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    
    // Fecha y hora de generación
    const fechaGeneracion = new Date().toLocaleString('es-MX');
    doc.text(
      `Generado: ${fechaGeneracion}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
  
  // Convertir a ArrayBuffer
  return doc.output('arraybuffer');
} 