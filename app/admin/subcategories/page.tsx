import { prisma } from "@/src/lib/prisma";
import SubcategoriesList from "@/components/admin/subcategories/SubcategoriesList";
import Heading from "@/components/ui/Heading";

export default async function SubcategoriesPage() {
  const subcategories = await prisma.subcategory.findMany({
    include: {
      category: true,
    },
  });

  return (
    <div className="p-8">
      <Heading>Gestión de Subcategorías</Heading>
      <SubcategoriesList subcategories={subcategories} />
    </div>
  );
}