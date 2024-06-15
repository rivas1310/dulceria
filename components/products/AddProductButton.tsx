"use client"
import {Product} from "@prisma/client"
import {useStore} from "@/src/store"

type AddProductButtonProps = {
    product: Product
}
export default function AddProductButton({product}: AddProductButtonProps) {
    const addToOrder = useStore((state) => state.addToOrder)
  return (
    <button
      type="button"
      className="bg-black hover:bg-customBlue2 text-white w-full mt-5 p-3
            uppercase font-bold cursor-pointer"
            onClick={() => addToOrder(product)}
    >
      Agreagar
    </button>
  );
}
