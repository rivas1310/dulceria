import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { z } from 'zod';

// Schema específico para la API que espera números
const ApiProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  categoryId: z.number().positive("La categoría es requerida"),
  subcategoryId: z.number().nullable(),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  image: z.string().min(1, "La imagen es requerida"),
  claveSAT: z.string().default("01010101")
});

export async function POST(request: Request) {
  console.log('Iniciando creación de producto');
  
  try {
    if (request.headers.get("content-type") !== "application/json") {
      return NextResponse.json(
        { error: 'Content-Type debe ser application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos en el servidor:', body);

    // Validar los datos con el schema de la API
    const result = ApiProductSchema.safeParse(body);
    if (!result.success) {
      console.error('Errores de validación:', result.error.issues);
      return NextResponse.json(
        { error: 'Datos inválidos', issues: result.error.issues },
        { status: 400 }
      );
    }

    const validatedData = result.data;
    console.log('Datos validados:', validatedData);

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'La categoría especificada no existe' },
        { status: 400 }
      );
    }

    // Si hay subcategoría, verificar que existe
    if (validatedData.subcategoryId) {
      const subcategory = await prisma.subcategory.findUnique({
        where: { id: validatedData.subcategoryId }
      });

      if (!subcategory) {
        return NextResponse.json(
          { error: 'La subcategoría especificada no existe' },
          { status: 400 }
        );
      }
    }

    try {
      // Crear el producto con solo los campos necesarios
      const product = await prisma.product.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          categoryId: validatedData.categoryId,
          subcategoryId: validatedData.subcategoryId,
          stock: validatedData.stock,
          image: validatedData.image,
          claveSAT: validatedData.claveSAT,
          isActive: true
        },
        // Especificar exactamente qué campos queremos que devuelva
        select: {
          id: true,
          name: true,
          price: true,
          categoryId: true,
          subcategoryId: true,
          stock: true,
          image: true,
          claveSAT: true,
          isActive: true
        }
      });

      console.log('Producto creado exitosamente:', product);
      return NextResponse.json(product, { status: 201 });
    } catch (dbError: any) {
      console.error('Error detallado de Prisma:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      });
      
      // Manejar errores específicos de Prisma
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un producto con ese nombre' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Error al crear el producto en la base de datos',
          details: dbError.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 