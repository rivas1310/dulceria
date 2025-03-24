import { prisma } from "@/src/lib/prisma";
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: {
      status: false,
    },
    include: {
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const orderData = await request.json();

  try {
    const newOrder = await prisma.order.create({
      data: {
        name: orderData.name,
        
        phoneNumber: orderData.phone,
        total: orderData.total,
        status: false,
        orderProducts: {
          create: orderData.items.map((item: { quantity: number; id: string }) => ({
            quantity: item.quantity,
            product: {
              connect: { id: item.id }
            }
          }))
        }
      },
      include: {
        orderProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, error: "Error creating order" }, { status: 500 });
  }
}