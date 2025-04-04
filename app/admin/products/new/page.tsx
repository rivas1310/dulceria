import AddProductForm from "@/components/products/AddProductForm";
import ProductForm from "@/components/products/ProductForm";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";

// Obtenemos las categorías y subcategorías del servidor
async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true
    },
    include: {
      subcategories: {
        where: {
          isActive: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  return categories;
}

export default async function CreateProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <Heading>Nuevo Producto</Heading>
        <p className="text-gray-600 mt-2">
          Completa los campos para crear un nuevo producto
        </p>
      </div>

      <AddProductForm>
        <ProductForm 
          categories={categories}
          product={null}
        />
      </AddProductForm>
    </div>
  );
}