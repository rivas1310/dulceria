import { prisma } from "@/src/lib/prisma";
import EditProductForm from "@/components/products/EditProductForm";
import ProductForm from "@/components/products/ProductForm";
import { notFound } from "next/navigation";

async function getProductAndCategories(id: number) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true
      }
    }),
    prisma.category.findMany({
      include: {
        subcategories: true
      }
    })
  ]);

  if (!product) {
    notFound();
  }

  return { product, categories };
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, categories } = await getProductAndCategories(+params.id);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Editar Producto: {product.name}</h1>

      <EditProductForm>
        <ProductForm 
          product={product} 
          categories={categories}
        />
      </EditProductForm>
    </>
  );
}
