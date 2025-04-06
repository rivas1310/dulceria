"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Definir la interfaz para las categorías
interface Subcategory {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  iconPath?: string;
  subcategories: Subcategory[];
}

export default function MobileCategoryButton() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Error al cargar las categorías');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-4 left-4 bg-customBlue text-white p-4 rounded-full md:hidden z-50"
        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
      >
        Categorías
      </button>

      {isCategoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-customBlue overflow-y-auto">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-2xl font-bold text-white">Categorías</h2>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className="text-2xl text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="text-white text-center py-4">Cargando...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-4">{error}</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div
                      className="flex items-center gap-4 bg-white p-4 rounded-lg cursor-pointer"
                      onClick={() => toggleCategory(category.name)}
                    >
                      <Image
                        src={category.iconPath || "/icon_default.svg"}
                        alt={category.name}
                        width={30}
                        height={30}
                      />
                      <span className="text-black font-bold text-lg flex-grow">
                        {category.name}
                      </span>
                      {category.subcategories?.length > 0 && (
                        <span 
                          className="text-gray-600 transform transition-transform duration-200" 
                          style={{
                            transform: expandedCategory === category.name ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          ▼
                        </span>
                      )}
                    </div>
                    
                    {expandedCategory === category.name && category.subcategories?.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/order/${category.slug}/${sub.name.toLowerCase().replace(/ /g, '-')}`}
                            className="block bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            <span className="text-black">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
