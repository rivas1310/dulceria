// api/facturacion/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Obtener factura por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = params.id;
    
    const factura = await prisma.factura.findUnique({
      where: { id },
      include: {
        cliente: true,
        orden: true,
        items: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    return NextResponse.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    return NextResponse.json({ error: 'Error al obtener factura' }, { status: 500 });
  }
}

// PUT - Actualizar factura
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = params.id;
    const data = await req.json();

    // Validar datos requeridos
    if (!data.clienteId || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar que la factura existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!facturaExistente) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Si la factura está pagada o cancelada, no permitir actualizaciones
    if (facturaExistente.estado === 'PAGADA' || facturaExistente.estado === 'CANCELADA') {
      return NextResponse.json(
        { error: 'No se puede modificar una factura pagada o cancelada' }, 
        { status: 400 }
      );
    }

    // Actualizar la factura en una transacción
    const facturaActualizada = await prisma.$transaction(async (tx) => {
      // Eliminar items existentes
      await tx.facturaItem.deleteMany({
        where: { facturaId: id }
      });
      
      // Actualizar factura
      return await tx.factura.update({
        where: { id },
        data: {
          clienteId: data.clienteId,
          ordenId: data.ordenId || null,
          subtotal: data.subtotal,
          impuesto: data.impuesto,
          total: data.total,
          notas: data.notas || '',
          items: {
            create: data.items.map((item: any) => ({
              productoId: item.productoId,
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              importe: item.importe,
            })),
          },
          updatedAt: new Date()
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(facturaActualizada);
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 });
  }
}

// DELETE - Eliminar factura
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = params.id;
    
    // Verificar que la factura existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { id }
    });

    if (!facturaExistente) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Si la factura está pagada, no permitir eliminación
    if (facturaExistente.estado === 'PAGADA') {
      return NextResponse.json(
        { error: 'No se puede eliminar una factura pagada' }, 
        { status: 400 }
      );
    }

    // Eliminar la factura (Prisma eliminará automáticamente los items gracias a la relación onDelete: Cascade)
    await prisma.factura.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 });
  }
}