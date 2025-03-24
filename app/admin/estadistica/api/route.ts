import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtenemos los productos con sus ventas totales
    const products = await prisma.product.findMany({
      include: {
        category: true,
        orderItems: true // Ahora usando orderItems que es la relación correcta
      },
      where: {
        isActive: true
      }
    });

    // Calculamos las ventas totales para cada producto
    const productsWithSales = products.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      stock: product.stock,
      isActive: product.isActive,
      category: product.category,
      price: product.price,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    }));

    // Ordenamos por ventas y tomamos los top 5
    const topProducts = productsWithSales
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos más vendidos' },
      { status: 500 }
    );
  }
}
