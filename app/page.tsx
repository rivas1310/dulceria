import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

export default async function Home() {
  // Buscar la primera categoría activa
  const category = await prisma.category.findFirst({
    where: {
      isActive: true
    },
    select: {
      slug: true
    }
  });

  // Si no hay categoría, mostrar un mensaje
  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">No hay categorías disponibles</p>
      </div>
    );
  }

  // Redirigir a la primera categoría encontrada
  redirect(`/order/${category.slug}`);
}