import { prisma } from "./prisma";

export async function getSalesData() {
  try {
    const orderProducts = await prisma.orderProducts.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        order: {
          select: {
            status: true,
          },
        },
      },
      where: {
        order: {
          status: true,
        },
      },
    });

    const groupedSales = orderProducts.reduce((acc: any[], curr) => {
      const existingProduct = acc.find(
        (item) => item.productId === curr.productId
      );

      const total = curr.quantity * Number(curr.product.price);

      if (existingProduct) {
        existingProduct._sum.quantity += curr.quantity;
        existingProduct._sum.total += total;
      } else {
        acc.push({
          productId: curr.productId,
          product: {
            id: curr.product.id,
            name: curr.product.name,
          },
          _sum: {
            quantity: curr.quantity || 0,
            total: total,
          },
        });
      }
      return acc;
    }, []);

    return groupedSales.sort((a, b) => b._sum.quantity - a._sum.quantity);
  } catch (error) {
    console.error("Error al obtener datos de ventas:", error);
    throw error;
  }
}
