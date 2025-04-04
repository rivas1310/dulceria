"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

interface ProductData {
  name: string;
  price: number;
  categoryId: number;
  subcategoryId?: number;
  image: string;
  stock: number;
}

export async function updateProduct(data: ProductData, id: number) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        image: data.image,
        stock: data.stock,
      },
    });

    revalidatePath('/admin/products');
    return { success: true, product };
  } catch (error) {
    console.error('Error al actualizar:', error);
    return {
      errors: [{
        message: 'Error al actualizar el producto'
      }]
    };
  }
}
