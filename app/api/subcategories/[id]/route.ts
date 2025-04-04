import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || isNaN(parseInt(params.id))) {
      return NextResponse.json(
        { error: 'ID de subcategoría inválido' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);
    const data = await request.json();
    
    console.log('Actualizando subcategoría:', { id, data });

    // Validar los campos requeridos
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la subcategoría es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la subcategoría existe
    const subcategory = await prisma.subcategory.findUnique({
      where: { id }
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: `No se encontró la subcategoría con id ${id}` },
        { status: 404 }
      );
    }

    // Si se proporciona categoryId, verificar que la categoría existe
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(data.categoryId) }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'La categoría padre no existe' },
          { status: 400 }
        );
      }
    }

    // Preparar los datos para la actualización
    const updateData = {
      name: data.name,
      ...(data.slug && { slug: data.slug }),
      ...(data.categoryId && { categoryId: Number(data.categoryId) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.iconPath && { iconPath: data.iconPath }),
    };

    // Actualizar la subcategoría
    console.log(`Actualizando subcategoría ${id}:`, updateData);
    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: updateData,
    });

    console.log('Subcategoría actualizada:', updatedSubcategory);
    return NextResponse.json({
      success: true,
      message: 'Subcategoría actualizada correctamente',
      subcategory: updatedSubcategory
    });
  } catch (error) {
    console.error('Error al actualizar subcategoría:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar la subcategoría',
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || isNaN(parseInt(params.id))) {
      return NextResponse.json(
        { error: 'ID de subcategoría inválido' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);

    // Verificar que la subcategoría existe
    const subcategory = await prisma.subcategory.findUnique({
      where: { id }
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: `No se encontró la subcategoría con id ${id}` },
        { status: 404 }
      );
    }

    // Eliminar (o desactivar) la subcategoría
    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Subcategoría desactivada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar subcategoría:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la subcategoría' },
      { status: 500 }
    );
  }
} 