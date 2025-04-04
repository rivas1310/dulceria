import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { OrderSchema } from "@/src/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log("Datos recibidos para crear orden:", json);

    // Validar los datos
    const result = OrderSchema.safeParse(json);
    if (!result.success) {
      console.log("Error de validación:", result.error.errors);
      return NextResponse.json(
        { success: false, errors: result.error.errors },
        { status: 400 }
      );
    }

    // Obtener los datos validados
    const { name, phoneNumber, total, order, subtotal, descuento } = result.data;

    // Extraer productos y cantidades
    const orderItems = order.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      ingredients: item.ingredients || "",
    }));

    // Crear orden en la base de datos
    const createdOrder = await prisma.order.create({
      data: {
        name,
        phoneNumber,
        total,
        subtotal: subtotal || total, // Si no hay subtotal, usar el total
        descuento: descuento || 0,   // Si no hay descuento, usar 0
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    revalidatePath("/");
    
    console.log("Orden creada:", createdOrder);
    return NextResponse.json(
      { success: true, order: createdOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la orden" },
      { status: 500 }
    );
  }
} 