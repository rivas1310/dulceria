"use client";

import { prisma } from "../../src/lib/prisma";

export async function getSalesData() {
  const salesData = await prisma.orderProducts.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 10, // Obtener los 10 productos más vendidos
  });

  // Obtener los nombres de los productos
  const productIds = salesData.map((sale) => sale.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Combinar los datos de ventas con los nombres de los productos
  const combinedData = salesData.map((sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return {
      productId: sale.productId,
      product: product || { name: "Desconocido" }, // Manejo de productos no encontrados
      _sum: sale._sum,
    };
  });

  return combinedData;
}
