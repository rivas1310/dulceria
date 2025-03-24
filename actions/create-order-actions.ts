"use server";
import { prisma } from "@/src/lib/prisma";
import { OrderSchema } from "@/src/schema";

export async function createOrder(data: unknown) {
  console.log("Received data in createOrder:", data);

  const result = OrderSchema.safeParse(data);

  if (!result.success) {
    console.error("Validation error:", result.error.issues);
    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  try {
    console.log("Validated data:", result.data);

    // Asegúrate de que los campos sean correctos y compatibles con tu esquema de base de datos
    const orderData = {
      name: result.data.name,
      total: result.data.total,
      phoneNumber: result.data.phoneNumber,
      ingredients: result.data.order
        .map((product) => product.ingredients)
        .filter(Boolean)
        .join(", "),

      orderProducts: {
        create: result.data.order.map((product) => ({
          productId: product.id,
          quantity: product.quantity,
        })),
      },
    };

    console.log("Order data prepared:", orderData);

    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderProducts: true,
      },
    });

    console.log("Order created successfully:", order);

    return { success: true, order };
  } catch (error) {
    console.error("Detailed error when creating order in database:", error);
    return {
      success: false,
      errors: [
        {
          path: "database",
          message:
            "Error creating order in database: " +
            (error instanceof Error ? error.message : String(error)),
        },
      ],
    };
  }
}
