"use server";

import { prisma } from "../src/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderIdSchema } from "../src/schema";
import twilio from "twilio";

const accountSid = process.env.SID_SMS;
const authToken = process.env.SD_SMS;
const client = twilio(accountSid, authToken);

function formatPhoneNumber(phone: string): string {
  const numericPhone = phone.replace(/\D/g, "");
  return numericPhone.startsWith("52")
    ? `+${numericPhone}`
    : `+52${numericPhone}`;
}

export async function completeOrder(formData: FormData) {
  console.log("Iniciando completeOrder");
  const orderId = formData.get("order_id");
  const phoneNumber = formData.get("phone_number");

  console.log("Datos recibidos en completeOrder:", { orderId, phoneNumber });

  if (!orderId || typeof orderId !== "string") {
    console.error("ID de orden inválido o no proporcionado");
    return { success: false, error: "ID de orden inválido o no proporcionado" };
  }

  if (!phoneNumber || typeof phoneNumber !== "string") {
    console.error("Número de teléfono inválido o no proporcionado");
    return {
      success: false,
      error: "Número de teléfono inválido o no proporcionado",
    };
  }

  const data = { orderId, phoneNumber };
  const result = OrderIdSchema.safeParse(data);

  if (!result.success) {
    console.error("Datos de pedido inválidos:", result.error);
    return { success: false, error: "Datos de pedido inválidos" };
  }

  try {
    console.log("Actualizando orden en la base de datos");
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId as string) },
    });

    if (!order) {
      return { success: false, error: "Orden no encontrada" };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: result.data.orderId },
      data: { status: true, orderReadyAt: new Date() },
    });

    console.log("Orden actualizada:", updatedOrder);

    // Obtener los productos del pedido
    const orderProducts = await prisma.orderProducts.findMany({
      where: { orderId: updatedOrder.id },
      include: { product: true },
    });

    // Verificar stock antes de completar la orden
    for (const orderProduct of orderProducts) {
      if (
        !orderProduct.product ||
        orderProduct.product.stock < orderProduct.quantity
      ) {
        throw new Error(
          `Stock insuficiente para ${
            orderProduct.product?.name || "un producto"
          }`
        );
      }
    }

    // Actualizar stock y estado del producto
    await Promise.all(
      orderProducts.map(async (orderProduct) => {
        const currentProduct = orderProduct.product;
        if (!currentProduct) return;

        return await prisma.product.update({
          where: { id: orderProduct.productId },
          data: {
            stock: {
              decrement: orderProduct.quantity,
            },
            isActive: {
              set: currentProduct.stock - orderProduct.quantity > 0,
            },
          },
        });
      })
    );

    const formattedPhone = formatPhoneNumber(phoneNumber as string);
    if (formattedPhone) {
      try {
        console.log("Enviando SMS a:", formattedPhone);
        await client.messages.create({
          body: `Hola ${order.name}, tu pedido está listo para recoger. ¡Gracias por comprar en cafeteria unisite!`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log("SMS enviado exitosamente");
      } catch (twilioError: any) {
        console.error("Error al enviar SMS:", twilioError);
      }
    } else {
      console.warn("No se pudo formatear el número de teléfono:", phoneNumber);
    }

    console.log("Revalidando ruta");
    revalidatePath("/admin/orders");

    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Error al completar la orden:", error);
    return { success: false, error: "Error al completar el pedido" };
  }
}
