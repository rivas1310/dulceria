import { categories } from "./data/categories";
import { products } from "./data/products";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.category.createMany({
      data: categories,
    });
    await prisma.product.createMany({
      data: products,
    });
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect(); // Corregido para llamar la función disconnect
  }
}

main().catch(async (e) => {
  console.log(e);
  await prisma.$disconnect(); // Corregido para llamar la función disconnect
  process.exit(1);
});
