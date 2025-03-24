"use server";

import { completeOrder } from "@/app/admin/orders/api/orders/order-completion"; // Mueve la lógica a otro archivo

export async function POST(request: Request) {
  const { orderId, phoneNumber } = await request.json();

  try {
    const result = await completeOrder(orderId, phoneNumber);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }), // Type assertion added
      { status: 500 }
    );
  }
}
