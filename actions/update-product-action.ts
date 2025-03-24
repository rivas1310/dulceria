"use server";

import { prisma } from "@/src/lib/prisma";
import { ProductSchema } from "@/src/schema";
import { revalidatePath } from "next/cache";

export async function updateProduct(data: unknown, id: number) {
  const result = ProductSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: result.error.issues,
    };
  }

  try {
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: result.data.name,
        price: Number(result.data.price),
        categoryId: Number(result.data.categoryId),
        image: result.data.image,
        stock: Number(result.data.stock),
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return {
      errors: [{ message: "Error al actualizar el producto" }],
    };
  }
}
