import { OrderWithProducts } from "@/src/types"


type LatestOrderItemProps={
    order: OrderWithProducts
}
export default function LatestOrderItem({order}: LatestOrderItemProps) {
  return (
    <div className="bg-white shadow p-5 space-y-5 rounded-lg">

    <p className=" font-bold text-2xl text-black">
        Cliente: {order.name}
        
    </p>
         <ul 
         className="divide-y text-black divide-gray-200 border-t border-gray-200 text-sm font-medium"
         role="list">
          {order.orderProducts.map(product => (
            <li
            key={product.id}
            className="flex py-6 text-lg"
            >
              <p>
                <span className="font-bold">
                  ({product.quantity}) {''}
                </span>
                {product.product.name}
              </p>


            </li>

          ))}
          
         </ul>
    </div>
  )
}
