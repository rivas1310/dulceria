import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || isNaN(parseInt(params.id))) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);
    const data = await request.json();
    console.log('Actualizando icono:', { id, data });

    if (!data.name || !data.path) {
      return NextResponse.json(
        { error: 'Nombre e icono son requeridos' },
        { status: 400 }
      );
    }

    // IMPORTANTE: Verificar el tipo de entidad antes de actualizar
    if (!data.type) {
      return NextResponse.json(
        { error: 'Tipo de entidad (category/subcategory) requerido' },
        { status: 400 }
      );
    }

    // Actualizar según el tipo especificado en los datos
    if (data.type === 'category') {
      // Verificar si la categoría existe
      const category = await prisma.category.findUnique({
        where: { id }
      });

      if (!category) {
        return NextResponse.json(
          { error: `No se encontró categoría con id ${id}` },
          { status: 404 }
        );
      }

      console.log(`Actualizando categoría ${id} con nuevo icono:`, data.path);
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          iconPath: data.path,
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Categoría actualizada correctamente',
        category: updatedCategory
      });
    } 
    else if (data.type === 'subcategory') {
      // Verificar si la subcategoría existe
      const subcategory = await prisma.subcategory.findUnique({
        where: { id }
      });

      if (!subcategory) {
        return NextResponse.json(
          { error: `No se encontró subcategoría con id ${id}` },
          { status: 404 }
        );
      }

      console.log(`Actualizando subcategoría ${id} con nuevo icono:`, data.path);
      const updatedSubcategory = await prisma.subcategory.update({
        where: { id },
        data: {
          name: data.name,
          iconPath: data.path,
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subcategoría actualizada correctamente',
        subcategory: updatedSubcategory
      });
    } 
    else {
      return NextResponse.json(
        { error: `Tipo de entidad '${data.type}' no válido` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar el icono', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}