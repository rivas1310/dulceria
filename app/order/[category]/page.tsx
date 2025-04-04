import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  console.log("Slug de categoría:", params.category); // Para debugging

  const category = await prisma.category.findFirst({
    where: {
      slug: params.category,
      isActive: true,
    },
    include: {
      subcategories: {
        where: {
          isActive: true,
        },
      },
    },
  });

  console.log("Categoría encontrada:", category); // Para debugging

  if (!category) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      
      {/* Mostrar subcategorías */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {category.subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className="p-4 border rounded-lg shadow hover:shadow-md"
          >
            {subcategory.iconPath && (
              <img
                src={subcategory.iconPath}
                alt={subcategory.name}
                className="w-12 h-12 mb-2"
              />
            )}
            <h2 className="font-semibold">{subcategory.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}