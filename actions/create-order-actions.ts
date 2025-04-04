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

    // Verificar stock antes de crear la orden
    for (const item of result.data.order) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      });
      
      if (!product || product.stock < item.quantity) {
        return {
          success: false,
          errors: [{
            path: "stock",
            message: `Stock insuficiente para ${item.name}`
          }]
        };
      }
    }

    // Crear la orden
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

    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderProducts: true,
      },
    });

    // Actualizar stock y estado de productos
    await Promise.all(
      result.data.order.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.id }
        });
        
        if (product) {
          const newStock = product.stock - item.quantity;
          await prisma.product.update({
            where: { id: item.id },
            data: {
              stock: newStock,
              isActive: newStock > 0
            }
          });
        }
      })
    );

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
