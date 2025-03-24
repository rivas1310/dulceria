import { prisma } from "@/src/lib/prisma";
import twilio from "twilio";
import { revalidatePath } from "next/cache";

const accountSid = process.env.SID_SMS;
const authToken = process.env.SD_SMS;
const client = twilio(accountSid, authToken);

export type CompleteOrderResponse = {
  success: boolean;
  order?: any; // Cambia 'any' por el tipo específico de tu orden si lo tienes
  error?: string;
};

export async function completeOrder(
  orderId: string,
  phoneNumber: string
): Promise<CompleteOrderResponse> {
  try {
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      throw new Error("Invalid order ID");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderIdNumber },
      data: {
        status: true,
        orderReadyAt: new Date(),
      },
    });

    if (phoneNumber) {
      await client.messages.create({
        body: `Tu pedido ${orderId} está listo para recoger.`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Error al completar el pedido:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al completar el pedido",
    };
  }
}
