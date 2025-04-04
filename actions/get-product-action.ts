import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";

export async function getProductAndCategories(id: number) {
  try {
    const [product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
        },
      }),
    ]);

    if (!product) {
      notFound();
    }

    return {
      product,
      categories,
    };
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw new Error("Error al obtener el producto");
  }
} 