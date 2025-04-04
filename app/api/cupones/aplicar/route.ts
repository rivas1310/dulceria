import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Endpoint para aplicar un cupón a una orden
export async function POST(request: NextRequest) {
  try {
    const { codigo, orderId } = await request.json();
    
    // Validar datos requeridos
    if (!codigo || !orderId) {
      return NextResponse.json(
        { error: "Se requieren el código del cupón y el ID de la orden" },
        { status: 400 }
      );
    }
    
    // Buscar orden
    const orden = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar si la orden ya tiene un cupón aplicado
    if (orden.cuponId) {
      return NextResponse.json(
        { error: "La orden ya tiene un cupón aplicado" },
        { status: 400 }
      );
    }
    
    // Buscar el cupón
    const cupon = await prisma.cupon.findUnique({
      where: { codigo }
    });
    
    // Verificar si el cupón existe
    if (!cupon) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar validez del cupón
    if (!cupon.activo) {
      return NextResponse.json(
        { error: "Cupón inactivo" },
        { status: 400 }
      );
    }
    
    if (cupon.fechaExpiracion && new Date() > cupon.fechaExpiracion) {
      return NextResponse.json(
        { error: "Cupón expirado" },
        { status: 400 }
      );
    }
    
    if (new Date() < cupon.fechaInicio) {
      return NextResponse.json(
        { error: "Cupón aún no válido" },
        { status: 400 }
      );
    }
    
    if (cupon.usoMaximo !== null && cupon.usosActuales >= cupon.usoMaximo) {
      return NextResponse.json(
        { error: "Cupón ha alcanzado su límite de uso" },
        { status: 400 }
      );
    }
    
    // Verificar monto mínimo
    if (cupon.montoMinimo && orden.total < Number(cupon.montoMinimo)) {
      return NextResponse.json(
        { 
          error: `El monto mínimo para este cupón es de $${Number(cupon.montoMinimo).toFixed(2)}` 
        },
        { status: 400 }
      );
    }
    
    // Calcular el descuento
    let descuento = 0;
    
    if (cupon.montoDesc) {
      // Descuento de monto fijo
      descuento = Number(cupon.montoDesc);
      if (descuento > orden.total) {
        descuento = orden.total; // El descuento no puede ser mayor que el total
      }
    } else if (cupon.porcentajeDesc) {
      // Descuento porcentual
      descuento = (Number(cupon.porcentajeDesc) / 100) * orden.total;
    }
    
    const subtotal = orden.total;
    const nuevoTotal = subtotal - descuento;
    
    // Actualizar la orden con el cupón y los nuevos montos
    const ordenActualizada = await prisma.$transaction(async (tx) => {
      // Actualizar la orden
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          cuponId: cupon.id,
          subtotal: subtotal,
          descuento: descuento,
          total: nuevoTotal
        }
      });
      
      // Incrementar el contador de usos del cupón
      await tx.cupon.update({
        where: { id: cupon.id },
        data: {
          usosActuales: {
            increment: 1
          }
        }
      });
      
      return updatedOrder;
    });
    
    // Devolver la orden actualizada
    return NextResponse.json({
      success: true,
      orden: ordenActualizada,
      mensaje: `Cupón aplicado: Se ha aplicado un descuento de $${descuento.toFixed(2)}`
    });
    
  } catch (error) {
    console.error("Error al aplicar cupón:", error);
    return NextResponse.json(
      { error: "Error al aplicar cupón", details: (error as Error).message },
      { status: 500 }
    );
  }
} 