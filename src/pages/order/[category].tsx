import { notFound } from "next/navigation"
import ProductList from "@/components/products/product-list"

// Esta función se ejecutará en el servidor para obtener los productos de la categoría
async function getProductsByCategory(category: string) {
  // Aquí puedes implementar la lógica para obtener productos de tu base de datos
  // Este es un ejemplo con datos de muestra
  const products = [
    { id: 1, name: "Producto 1", price: 25, image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Producto 2", price: 30, image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Producto 3", price: 15, image: "/placeholder.svg?height=200&width=200" },
    { id: 4, name: "Producto 4", price: 40, image: "/placeholder.svg?height=200&width=200" },
  ]

  return products
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const decodedCategory = decodeURIComponent(params.category)

  try {
    const products = await getProductsByCategory(decodedCategory)

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 capitalize">{decodedCategory}</h1>
        <ProductList products={products} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}

