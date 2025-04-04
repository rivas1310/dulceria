import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import { notFound } from "next/navigation";

async function getProductsBySubcategory(category: string, subcategory: string) {
  // Primero verificamos que exista la categoría y subcategoría
  const subcategoryData = await prisma.subcategory.findFirst({
    where: {
      slug: subcategory,
      category: {
        slug: category
      }
    },
    include: {
      category: true
    }
  });

  if (!subcategoryData) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: subcategoryData.categoryId,
      subcategoryId: subcategoryData.id
    },
    include: {
      category: true,
      subcategory: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return {
    products,
    subcategory: subcategoryData
  };
}

export default async function SubcategoryPage({
  params,
}: {
  params: { category: string; subcategory: string };
}) {
  const { products, subcategory } = await getProductsBySubcategory(
    params.category,
    params.subcategory
  );

  return (
    <>
      <Heading>{subcategory.name}</Heading>
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-3 items-start">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-center col-span-full text-lg text-gray-600">
            No hay productos disponibles en esta subcategoría
          </p>
        )}
      </div>
    </>
  );
} 