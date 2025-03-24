import CategoryGrid from "@/components/products/category-grid"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestras Categorías</h1>
      <CategoryGrid />
    </main>
  )
}

