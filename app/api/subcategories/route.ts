import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, iconPath, categoryId } = body;

    console.log('Creando subcategoría:', body);

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la subcategoría es requerido' },
        { status: 400 }
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { error: 'El slug de la subcategoría es requerido' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'La categoría padre es requerida' },
        { status: 400 }
      );
    }

    // Verificar si la categoría padre existe
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'La categoría padre no existe' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una subcategoría con el mismo slug en la misma categoría
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        slug,
        categoryId: Number(categoryId)
      }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'Ya existe una subcategoría con este slug en la misma categoría' },
        { status: 400 }
      );
    }

    // Crear la subcategoría
    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        iconPath: iconPath || '/icons/default-subcategory.svg',
        isActive: true,
        categoryId: Number(categoryId)
      },
    });

    console.log('Subcategoría creada exitosamente:', subcategory);
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error('Error detallado al crear subcategoría:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear la subcategoría',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}