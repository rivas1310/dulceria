import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Endpoint para eliminar la aplicación de un cupón a una orden
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    // Validar datos requeridos
    if (!orderId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la orden" },
        { status: 400 }
      );
    }
    
    // Buscar orden con el cupón aplicado
    const orden = await prisma.order.findUnique({
      where: { id: orderId },
      include: { cupon: true }
    });
    
    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar si la orden tiene un cupón aplicado
    if (!orden.cuponId) {
      return NextResponse.json(
        { error: "La orden no tiene ningún cupón aplicado" },
        { status: 400 }
      );
    }
    
    const cuponId = orden.cuponId;
    const nuevoTotal = orden.subtotal;
    
    // Actualizar la orden y el contador de usos del cupón
    const ordenActualizada = await prisma.$transaction(async (tx) => {
      // Actualizar la orden eliminando el cupón
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          cuponId: null,
          descuento: 0,
          total: nuevoTotal
        }
      });
      
      // Decrementar el contador de usos del cupón
      await tx.cupon.update({
        where: { id: cuponId },
        data: {
          usosActuales: {
            decrement: 1
          }
        }
      });
      
      return updatedOrder;
    });
    
    // Devolver la orden actualizada
    return NextResponse.json({
      success: true,
      orden: ordenActualizada,
      mensaje: "Cupón eliminado correctamente de la orden"
    });
    
  } catch (error) {
    console.error("Error al eliminar cupón:", error);
    return NextResponse.json(
      { error: "Error al eliminar cupón", details: (error as Error).message },
      { status: 500 }
    );
  }
} 