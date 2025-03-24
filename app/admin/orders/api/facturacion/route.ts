// api/facturacion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = new PrismaClient();

// GET - Obtener todas las facturas
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener facturas con información básica
    const facturas = await prisma.factura.findMany({
      select: {
        id: true,
        numero: true,
        fecha: true,
        estado: true,
        total: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return NextResponse.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 });
  }
}

// POST - Crear nueva factura
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();

    // Validar datos requeridos
    if (!data.clienteId || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Generar número de factura
    const ultimaFactura = await prisma.factura.findFirst({
      orderBy: {
        numero: 'desc',
      },
    });

    let numeroFactura = 'FAC-0001';
    if (ultimaFactura && ultimaFactura.numero) {
      const ultimoNumero = parseInt(ultimaFactura.numero.split('-')[1]);
      numeroFactura = `FAC-${String(ultimoNumero + 1).padStart(4, '0')}`;
    }

    // Crear la factura con sus items
    const nuevaFactura = await prisma.factura.create({
      data: {
        numero: numeroFactura,
        fecha: new Date(),
        estado: 'PENDIENTE',
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
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(nuevaFactura, { status: 201 });
  } catch (error) {
    console.error('Error al crear factura:', error);
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 });
  }
}