"use client";

import { formatCurrency, getImagePath } from "@/src/lib/utils";
import { Product } from "@prisma/client";
import Image from "next/image";
import AddProductButton from "./AddProductButton";
import { useStore } from "@/src/store";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imagePath = getImagePath(product.image);
  const order = useStore((state) => state.order);
  const currentOrderQuantity =
    order.find((item) => item.id === product.id)?.quantity || 0;
  const remainingStock = product.stock - currentOrderQuantity;

  return (
    <div className="bg-white mt-10 ml-10 shadow-xl rounded-2xl overflow-hidden">
      <div className=" aspect-square overflow-hidden">
        <Image
          width={400}
          height={400}
          src={imagePath}
          alt={`Imagen platillo ${product.name}`}
          className={`object-cover w-full h-full ${
            !product.isActive ? "opacity-75" : ""
          }`}
        />
        {!product.isActive && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
            Agotado
          </span>
        )}
      </div>

      <div className="p-5  flex flex-col justify-between h-64">
        <p className="text-2xl font-bold  text-black mb-2">{product.name}</p>
        <p className="mt-3 font-black text-2xl text-black"></p>

        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-black text-customBlue">
            {formatCurrency(product.price)}
          </p>
          {product.isActive && (
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                remainingStock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {remainingStock > 0 ? `Stock: ${remainingStock}` : "Agotado"}
            </span>
          )}
        </div>

        {product.isActive ? (
          <AddProductButton product={product} />
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-3 px-4 rounded-md font-medium cursor-not-allowed"
          >
            SIN STOCK DISPONIBLE
          </button>
        )}
      </div>
    </div>
  );
}
