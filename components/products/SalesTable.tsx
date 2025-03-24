"use client";

import React from "react";
import { Product } from "@prisma/client";

interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
}

interface SaleWithProduct extends Sale {
  product: Product;
}

interface SalesTableProps {
  sales: SaleWithProduct[];
}

const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio Unitario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {sale.product.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{sale.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${sale.unitPrice.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ${(sale.quantity * sale.unitPrice).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(sale.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
