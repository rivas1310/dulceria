import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    // Obtener todos los iconos únicos de categorías y subcategorías
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        iconPath: true,
      },
      where: {
        iconPath: {
          not: null
        }
      }
    });

    const subcategories = await prisma.subcategory.findMany({
      select: {
        id: true,
        name: true,
        iconPath: true,
      },
      where: {
        iconPath: {
          not: null
        }
      }
    });

    // Generar un ID único para cada icono combinando su tipo y ID original
    const icons = [
      ...categories.map(c => ({
        id: c.id,
        originalId: c.id,
        path: c.iconPath!,
        name: c.name,
        type: 'category' as const,
        uniqueKey: `category-${c.id}`
      })),
      ...subcategories.map(s => ({
        id: s.id,
        originalId: s.id,
        path: s.iconPath!,
        name: s.name,
        type: 'subcategory' as const,
        uniqueKey: `subcategory-${s.id}`
      }))
    ];

    return NextResponse.json(icons);
  } catch (error) {
    console.error('Error al cargar iconos:', error);
    return NextResponse.json(
      { error: 'Error al cargar los iconos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Aquí implementarías la lógica para guardar el archivo
    // y crear el registro en la base de datos
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el icono' },
      { status: 500 }
    );
  }
}