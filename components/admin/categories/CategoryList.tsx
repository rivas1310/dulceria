"use client"
import { useState } from 'react';
import Image from 'next/image';
import { Category, Subcategory } from '@prisma/client';

type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
};

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 relative">
              <Image
                src={category.iconPath || '/icons/default-category.svg'}
                alt={category.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-gray-500">Slug: {category.slug}</p>
            </div>
            <button 
              className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
              onClick={() => setEditingCategory(category.id)}
            >
              Editar
            </button>
          </div>

          <div className="ml-12 space-y-2">
            {category.subcategories.map(subcategory => (
              <div 
                key={subcategory.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
              >
                <div className="w-6 h-6 relative">
                  <Image
                    src={subcategory.iconPath || '/subcategories/default.svg'}
                    alt={subcategory.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span>{subcategory.name}</span>
              </div>
            ))}
            <button 
              className="text-blue-500 hover:underline text-sm"
              onClick={() => {/* Agregar lógica para nueva subcategoría */}}
            >
              + Agregar Subcategoría
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}