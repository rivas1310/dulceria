"use client";

import { useState, useEffect } from "react";
import SubcategoryForm from "./SubcategoryForm";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  categoryId: number;
  category: {
    name: string;
  };
}

export default function SubcategoriesList({ subcategories }: { subcategories: Subcategory[] }) {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string; }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="bg-customBlue text-white px-4 py-2 rounded-md mb-4"
      >
        Agregar Subcategoría
      </button>

      <div className="bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((subcategory) => (
              <tr key={subcategory.id} className="border-b">
                <td className="px-6 py-4">{subcategory.name}</td>
                <td className="px-6 py-4">{subcategory.category.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subcategory.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <SubcategoryForm 
          categories={categories}
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}