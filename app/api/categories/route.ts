import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        subcategories: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validaciones básicas
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    if (!data.slug || !data.slug.trim()) {
      return NextResponse.json(
        { error: 'El slug de la categoría es requerido' },
        { status: 400 }
      );
    }

    console.log('Creando categoría:', data);
    
    // Verificar si ya existe una categoría con el mismo slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: data.slug
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este slug' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        iconPath: data.iconPath || '/icons/default-category.svg',
        isActive: true
      }
    });
    
    console.log('Categoría creada exitosamente:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error detallado al crear categoría:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear la categoría',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}