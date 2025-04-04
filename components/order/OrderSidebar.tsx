import { prisma } from '@/src/lib/prisma'
import CategoryIcon from '../ui/CategoryIcon'
import Logo from '../ui/Logo'

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      subcategories: {
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function OrderSidebar() {
  const categories = await getCategories()

  return (
    <aside className="md:w-71 md:h-screen bg-customBlue">
      <Logo/>
        
      <nav className='mt-9 text-black'>
        {categories.map((category) => (
          <CategoryIcon
            key={category.id}
            category={category}
          />
        ))}
      </nav>
    </aside>
  )
}