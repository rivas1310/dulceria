import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";

async function getProducts(category: string) {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category,
      },
    },
  });
  return products;
}

export default async function Orderpage({
  params,
}: {
  params: { category: string };
}) {
  const products = await getProducts(params.category);
  if (!products) return <div>Error loading products</div>;

  return (
    <>
      <Heading>Elige tu pedido</Heading>
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-5 gap-4 items-start">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}