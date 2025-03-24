"use server";

import { prisma } from "../lib/prisma";
import { OrderSchema } from "../schema";
import { Twilio } from "twilio";

interface OrderData {
  name: string;
  order: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    ingredients?: string;
  }[];
  phoneNumber: string;
  total: number;
}

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function completeOrder(orderData: OrderData) {
  try {
    const { name, order, phoneNumber } = orderData;

    const result = OrderSchema.safeParse({ 
      orderId: order[0]?.id,
      phoneNumber 
    });

    if (!result.success) {
      return { success: false, errors: result.error.errors };
    }

    const formattedPhone = `+52${phoneNumber}`;

    await prisma.order.update({
      where: {
        id: order[0]?.id,
      },
      data: {
        status: true,
      },
    });

    await client.messages.create({
      body: `¡Hola! Tu pedido ${name} está listo para recoger. ¡Gracias por comprar en cafetería Unisite!`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return { success: true };
  } catch (error) {
    console.error("Error en completeOrder:", error);
    return { success: false, error: "Error al completar la orden" };
  }
}
