import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Función para obtener todos los cupones o filtrar por código
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');
    
    // Si se proporciona un código, buscar ese cupón específico
    if (codigo) {
      const cupon = await prisma.cupon.findUnique({
        where: { codigo }
      });
      
      if (!cupon) {
        return NextResponse.json(
          { error: "Cupón no encontrado" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(cupon);
    }
    
    // Si no hay código, devolver todos los cupones
    const cupones = await prisma.cupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(cupones);
  } catch (error) {
    console.error("Error al obtener cupones:", error);
    return NextResponse.json(
      { error: "Error al obtener cupones", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Función para crear un nuevo cupón
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.codigo || (!data.porcentajeDesc && !data.montoDesc)) {
      return NextResponse.json(
        { error: "Se requiere código y al menos un tipo de descuento (porcentaje o monto)" },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe un cupón con ese código
    const existingCupon = await prisma.cupon.findUnique({
      where: { codigo: data.codigo }
    });
    
    if (existingCupon) {
      return NextResponse.json(
        { error: "Ya existe un cupón con ese código" },
        { status: 400 }
      );
    }
    
    // Crear el nuevo cupón
    const nuevoCupon = await prisma.cupon.create({
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        porcentajeDesc: data.porcentajeDesc || 0,
        montoDesc: data.montoDesc || null,
        montoMinimo: data.montoMinimo || null,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : null,
        usoMaximo: data.usoMaximo || null,
        activo: data.activo !== undefined ? data.activo : true
      }
    });
    
    return NextResponse.json(nuevoCupon, { status: 201 });
  } catch (error) {
    console.error("Error al crear cupón:", error);
    return NextResponse.json(
      { error: "Error al crear cupón", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Función para actualizar un cupón existente
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: "Se requiere el ID del cupón" },
        { status: 400 }
      );
    }
    
    // Verificar si el cupón existe
    const existingCupon = await prisma.cupon.findUnique({
      where: { id: data.id }
    });
    
    if (!existingCupon) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }
    
    // Actualizar el cupón
    const cuponActualizado = await prisma.cupon.update({
      where: { id: data.id },
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        porcentajeDesc: data.porcentajeDesc !== undefined ? data.porcentajeDesc : existingCupon.porcentajeDesc,
        montoDesc: data.montoDesc !== undefined ? data.montoDesc : existingCupon.montoDesc,
        montoMinimo: data.montoMinimo !== undefined ? data.montoMinimo : existingCupon.montoMinimo,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : existingCupon.fechaInicio,
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : existingCupon.fechaExpiracion,
        usoMaximo: data.usoMaximo !== undefined ? data.usoMaximo : existingCupon.usoMaximo,
        usosActuales: data.usosActuales !== undefined ? data.usosActuales : existingCupon.usosActuales,
        activo: data.activo !== undefined ? data.activo : existingCupon.activo
      }
    });
    
    return NextResponse.json(cuponActualizado);
  } catch (error) {
    console.error("Error al actualizar cupón:", error);
    return NextResponse.json(
      { error: "Error al actualizar cupón", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Función para eliminar un cupón
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Se requiere un ID válido" },
        { status: 400 }
      );
    }
    
    // Verificar si el cupón existe
    const existingCupon = await prisma.cupon.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingCupon) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }
    
    // Eliminar el cupón
    await prisma.cupon.delete({
      where: { id: Number(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar cupón:", error);
    return NextResponse.json(
      { error: "Error al eliminar cupón", details: (error as Error).message },
      { status: 500 }
    );
  }
} 