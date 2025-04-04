import ProductSearchForm from "@/components/products/ProductSearchForm";
import ProductTable from "@/components/products/ProductsTable";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

async function searchProducts(searchTerm: string) {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    include: {
      category: true
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  return products;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { search: string };
}) {
  const products = await searchProducts(searchParams.search || "");

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading>Busqueda: {searchParams.search}</Heading>
        <Link 
          href="/admin/productos/new" 
          className="bg-black hover:bg-customCyan text-white px-4 py-2 rounded-md"
        >
          Crear Nuevo Producto
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-end gap-5">
        <ProductSearchForm />
      </div>
      {products.length ? (
        <ProductTable initialProducts={products} />
      ) : (
        <p className="text-center text-black text-lg">No hay resultados</p>
      )}
    </>
  );
}
