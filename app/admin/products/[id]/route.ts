import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Obtener un producto específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

// Actualizar un producto
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        categoryId: data.categoryId,
        image: data.image,
        stock: data.stock,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

// Actualizar solo el stock
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const newStock = parseInt(data.stock);

    const product = await prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        isActive: newStock > 0 ? data.isActive : false,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
} 