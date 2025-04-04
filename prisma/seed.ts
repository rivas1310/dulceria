import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Crear categorías con sus subcategorías
  const categorias = [
    {
      name: 'Bebidas',
      slug: 'bebidas',
      iconPath: '/icons/categories/bebidas.svg',
      subcategorias: [
        { name: 'Café Caliente', slug: 'cafe-caliente', iconPath: '/icons/subcategories/cafe-caliente.svg' },
        { name: 'Café Frío', slug: 'cafe-frio', iconPath: '/icons/subcategories/cafe-frio.svg' }
      ]
    },
    {
      name: 'Rosa',
      slug: 'rosa',
      iconPath: '/icons/categories/rosa.svg',
      subcategorias: [
        { name: 'Pasteles', slug: 'pasteles', iconPath: '/icons/subcategories/pasteles.svg' },
        { name: 'Galletas', slug: 'galletas', iconPath: '/icons/subcategories/galletas.svg' }
      ]
    }
  ];

  for (const cat of categorias) {
    const categoria = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        iconPath: cat.iconPath,
        isActive: true
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        iconPath: cat.iconPath,
        isActive: true
      }
    });

    // Crear subcategorías
    for (const sub of cat.subcategorias) {
      await prisma.subcategory.upsert({
        where: {
          slug_categoryId: {
            slug: sub.slug,
            categoryId: categoria.id
          }
        },
        update: {
          name: sub.name,
          iconPath: sub.iconPath,
          isActive: true
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          iconPath: sub.iconPath,
          isActive: true,
          categoryId: categoria.id
        }
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
