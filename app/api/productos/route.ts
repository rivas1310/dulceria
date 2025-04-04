// app/api/productos/route.ts
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
  image: z.string().min(1, "La imagen es requerida")
  // No incluir claveSAT en la validación
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

    try {
      // Crear el producto, similar a como se hace en la ruta PUT pero incluyendo claveSAT
      const product = await prisma.product.create({
        data: {
          name: validatedData.name,
          price: validatedData.price,
          categoryId: validatedData.categoryId,
          subcategoryId: validatedData.subcategoryId,
          stock: validatedData.stock,
          image: validatedData.image,
          isActive: true,
         // Agregar valor por defecto
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