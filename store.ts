import { create } from "zustand";
import { OrderItem } from "./types";
import { Product } from "@prisma/client";
import { toast } from "react-toastify";

interface Store {
  order: OrderItem[];
  addToOrder: (product: Product) => void;
  increaseQuantity: (id: Product["id"]) => void;
  decreaseQuantity: (id: Product["id"]) => void;
  removeItem: (id: Product["id"]) => void;
  clearOrder: () => void;
}

export const useStore = create<Store>((set, get) => ({
  order: [],

  addToOrder: async (product) => {
    try {
      const response = await fetch(`/admin/products/${product.id}`);

      if (!response.ok) {
        throw new Error("Error al verificar disponibilidad del producto");
      }

      const currentProduct = await response.json();

      if (!currentProduct || !currentProduct.isActive) {
        toast.error("Este producto no está disponible");
        return;
      }

      const { categoryId, image, ...data } = product;
      const currentOrder = get().order;
      const existingItem = currentOrder.find((item) => item.id === product.id);

      // Verificar si hay suficiente stock
      const currentQuantity = existingItem?.quantity || 0;
      if (currentQuantity >= currentProduct.stock) {
        toast.error(`Solo hay ${currentProduct.stock} unidades disponibles`);
        return;
      }

      let order: OrderItem[] = [];
      if (existingItem) {
        order = currentOrder.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: item.price * (item.quantity + 1),
              }
            : item
        );
      } else {
        order = [
          ...currentOrder,
          {
            ...data,
            quantity: 1,
            subtotal: data.price,
          },
        ];
      }

      set({ order });
    } catch (error) {
      console.error("Error al verificar stock:", error);
      toast.error("Error al agregar el producto");
    }
  },

  increaseQuantity: async (id) => {
    try {
      const response = await fetch(`/admin/products/${id}`);

      if (!response.ok) {
        throw new Error("Error al verificar disponibilidad del producto");
      }

      const currentProduct = await response.json();

      const currentOrder = get().order;
      const item = currentOrder.find((item) => item.id === id);

      if (!item) return;

      if (item.quantity >= currentProduct.stock) {
        toast.error(`No hay más unidades disponibles`);
        return;
      }

      set((state) => ({
        order: state.order.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: item.price * (item.quantity + 1),
              }
            : item
        ),
      }));
    } catch (error) {
      console.error("Error al verificar stock:", error);
      toast.error("Error al actualizar cantidad");
    }
  },

  decreaseQuantity: (id) => {
    const currentOrder = get().order;
    const item = currentOrder.find((item) => item.id === id);

    if (!item || item.quantity <= 1) return;

    set((state) => ({
      order: state.order.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
              subtotal: item.price * (item.quantity - 1),
            }
          : item
      ),
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      order: state.order.filter((item) => item.id !== id),
    }));
  },

  clearOrder: () => {
    set({ order: [] });
  },
}));
