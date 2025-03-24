"use client";
import { Product } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface ProductsTableProps {
  initialProducts: ProductWithCategory[];
}

export default function ProductTable({ initialProducts }: ProductsTableProps) {
  const [productList, setProductList] = useState<ProductWithCategory[]>(initialProducts || []);

  const toggleProductStatus = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/toggleStatus`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el producto");
      }

      setProductList(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );

      toast.success("Estado del producto actualizado");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado del producto");
    }
  };

  if (!productList || productList.length === 0) {
    return <p>No hay productos disponibles</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-white">
          <tr>
            <th className="py-2 px-4 border-b  text-black text-left">Nombre</th>
            <th className="py-2 px-4 border-b  text-black text-left">Precio</th>
            <th className="py-2 px-4 border-b  text-black text-left">
              Categoría
            </th>
            <th className="py-2 px-4 border-b  text-black text-left">Stock</th>
            <th className="py-2 px-4 border-b text-black text-left">Estado</th>
            <th className="py-2 px-4 border-b  text-black text-left">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {productList.map((product) => (
            <tr key={product.id}>
              <td className="py-2 px-4 text-lg font-bold text-black  border-b">{product.name}</td>
              <td className="py-2 px-4  text-black  font-bold border-b">
                ${product.price}
              </td>
              <td className="py-2 px-4  text-black font-bold  border-b">
                {product.category?.name || "Sin categoría"}
              </td>
              <td className="py-2 px-4 font-bold border-b">
                <span
                  className={`${
                    product.stock > 5
                      ? "text-green-600"
                      : product.stock > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  } font-medium`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <span
                  className={`px-2 py-1 rounded ${
                    product.isActive
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProductStatus(product.id)}
                    className={`px-3 py-1 rounded ${
                      product.isActive
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {product.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    Editar
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
