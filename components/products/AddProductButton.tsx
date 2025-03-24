"use client";
import { Product } from "@prisma/client";
import { useStore } from "@/src/store";
import { toast } from "react-toastify";
import React from "react";

type AddProductButtonProps = {
  product: Product;
};

export default function AddProductButton({ product }: AddProductButtonProps) {
  const { order, addToOrder } = useStore();

  const currentOrderQuantity =
    order.find((item) => item.id === product.id)?.quantity || 0;
  const remainingStock = product.stock - currentOrderQuantity;

  const handleClick = () => {
    if (remainingStock <= 0) {
      toast.error("No hay más stock disponible de este producto");
      return;
    }
    addToOrder(product);
  };

  return (
    <button
      type="button"
      className={`w-full mt-5 p-3 uppercase font-bold ${
        remainingStock <= 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-black hover:bg-customBlue2 text-white"
      }`}
      onClick={handleClick}
      disabled={remainingStock <= 0}
    >
      {remainingStock <= 0 ? "No Disponible" : "Agregar"}
    </button>
  );
}
