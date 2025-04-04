import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Definir interfaces para tipados
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

// Función para obtener ventas por día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros para filtrar por fecha
    const fecha = searchParams.get('fecha');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    
    let startDate: Date;
    let endDate: Date;
    
    // Si no se proporciona fecha, usar la fecha actual
    if (!fecha && !fechaInicio && !fechaFin) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } 
    // Si solo se proporciona una fecha específica
    else if (fecha) {
      startDate = new Date(fecha);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(fecha);
      endDate.setHours(23, 59, 59, 999);
    }
    // Si se proporciona un rango de fechas
    else {
      startDate = fechaInicio ? new Date(fechaInicio) : new Date();
      startDate.setHours(0, 0, 0, 0);
      
      endDate = fechaFin ? new Date(fechaFin) : new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    console.log(`Buscando ventas desde ${startDate.toISOString()} hasta ${endDate.toISOString()}`);
    
    // Consultar órdenes en el período especificado
    const ordenes = await prisma.order.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: true // Solo órdenes completadas
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Calcular totales generales
    const totalVentas = ordenes.reduce((acc, orden) => acc + orden.total, 0);
    const cantidadOrdenes = ordenes.length;
    
    // Calcular ventas por producto
    const ventasPorProducto: ProductoVenta[] = [];
    const productosMap = new Map<number, ProductoVenta>();
    
    ordenes.forEach(orden => {
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
    
    // Calcular ventas por hora
    const ventasPorHora: VentaHora[] = Array(24).fill(0).map(() => ({ 
      hora: 0, 
      cantidad: 0, 
      total: 0 
    }));
    
    ordenes.forEach(orden => {
      const hora = new Date(orden.date).getHours();
      ventasPorHora[hora].hora = hora;
      ventasPorHora[hora].cantidad += 1;
      ventasPorHora[hora].total += orden.total;
    });
    
    // Construir resultado final
    const resultado = {
      fechaInicio: startDate,
      fechaFin: endDate,
      resumen: {
        totalVentas,
        cantidadOrdenes,
        promedioVenta: cantidadOrdenes > 0 ? totalVentas / cantidadOrdenes : 0
      },
      ventasPorProducto: ventasPorProducto.sort((a, b) => b.total - a.total),
      ventasPorHora: ventasPorHora.filter(v => v.cantidad > 0)
    };
    
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener ventas diarias:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas diarias", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Endpoint para generar corte de caja
export async function POST(request: NextRequest) {
  try {
    const { fecha, incluirDetalles } = await request.json();
    
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
        orderProducts: incluirDetalles ? {
          include: {
            product: true
          }
        } : undefined,
        facturas: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Calcular totales
    const ordenesCompletadas = ordenes.filter(o => o.status);
    const ordenesPendientes = ordenes.filter(o => !o.status);
    
    // Calcular ventas por forma de pago (a partir de facturas si están disponibles)
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
    
    // Construir corte de caja
    const corteCaja = {
      fecha: startDate,
      resumen: {
        totalVentas: ordenesCompletadas.reduce((acc, orden) => acc + orden.total, 0),
        totalOrdenes: ordenes.length,
        ordenesCompletadas: ordenesCompletadas.length,
        ordenesPendientes: ordenesPendientes.length,
        ventaPromedio: ordenesCompletadas.length > 0 
          ? ordenesCompletadas.reduce((acc, orden) => acc + orden.total, 0) / ordenesCompletadas.length 
          : 0
      },
      ventasPorFormaPago,
      detalleOrdenes: incluirDetalles ? ordenes : undefined
    };
    
    // Guardar el corte de caja en la base de datos si se requiere en el futuro
    // Esto podría implementarse si se necesita mantener un historial de cortes
    
    return NextResponse.json(corteCaja);
  } catch (error) {
    console.error("Error al generar corte de caja:", error);
    return NextResponse.json(
      { error: "Error al generar corte de caja", details: (error as Error).message },
      { status: 500 }
    );
  }
} 