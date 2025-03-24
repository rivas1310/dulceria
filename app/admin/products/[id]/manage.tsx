"use client";

import { useRouter } from "next/router";
import { useState } from "react";

const ManageProduct = () => {
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState<string | null>(null);
<h1>holis</h1>
  const handleProductAction = async (action: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Product updated:", data);
      // Manejar la respuesta según sea necesario
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Error updating product");
      // Manejar errores de solicitud aquí
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionar Producto</h1>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="space-y-4">
        <button
          onClick={() => handleProductAction("disable")}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Deshabilitar Producto
        </button>
        <button
          onClick={() => handleProductAction("enable")}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Habilitar Producto
        </button>
      </div>
    </div>
  );
};



export default ManageProduct;