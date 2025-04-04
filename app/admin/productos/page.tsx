import Link from 'next/link';
import { prisma } from '@/src/lib/prisma';
import ProductsTable from '@/components/products/ProductsTable';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      subcategory: true
    }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link 
          href="/admin/productos/new" 
          className="bg-black hover:bg-customCyan text-white px-4 py-2 rounded-md"
        >
          Crear Nuevo Producto
        </Link>
      </div>
      <ProductsTable initialProducts={products} />
    </div>
  );
}