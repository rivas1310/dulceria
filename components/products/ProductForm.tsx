"use client";
import { useState, useEffect } from 'react';
import { prisma } from "@/src/lib/prisma";
import ImageUpload from "./ImageUpload";
import { Product, Category, Subcategory } from "@prisma/client";
import Image from 'next/image';
import { toast } from "react-toastify";

async function getCategories() {
  return await prisma.category.findMany();
}

interface ProductWithRelations {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  subcategoryId: number | null;
  stock: number;
  image: string;
  isActive: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
    iconPath: string | null;
    isActive: boolean;
  };
  subcategory: {
    id: number;
    name: string;
    slug: string;
    iconPath: string | null;
    isActive: boolean;
  } | null;
}

interface ProductFormProps {
  product: any; // Ajusta según tu modelo de Prisma
  categories: any[]; // Ajusta según tu modelo de Prisma
}

interface CategoryType {
  id: number;
  name: string;
  subcategories: Array<{
    id: number;
    name: string;
  }>;
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const [categoriesState, setCategoriesState] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(product?.categoryId || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategoriesState(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Cargando categorías...</div>;
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(Number(e.target.value));
  };

  // Obtener las subcategorías de la categoría seleccionada
  const selectedCategoryData = categoriesState.find(cat => cat.id === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  return (
    <>
      <div className="space-y-2">
        <label className="text-slate-800" htmlFor="name">
          Nombre:
        </label>
        <input
          id="name"
          type="text"
          name="name"
          className="block w-full p-3 text-black bg-slate-100"
          placeholder="Nombre Producto"
          defaultValue={product?.name}
        />
      </div>

      <div className="space-y-2">
        <label className="text-slate-800" htmlFor="price">
          Precio:
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          className="block w-full p-3 text-black bg-slate-100"
          placeholder="Precio Producto"
          defaultValue={product?.price}
        />
      </div>

      <div className="space-y-2">
        <label className="text-slate-800" htmlFor="categoryId">
          Categoría:
        </label>
        <select
          className="block w-full p-3 text-black bg-slate-100"
          id="categoryId"
          name="categoryId"
          value={selectedCategory || ""}
          onChange={handleCategoryChange}
          required
        >
          <option value="">-- Seleccione --</option>
          {categoriesState.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Campo de Subcategoría */}
      {selectedCategory > 0 && (
        <div className="space-y-2">
          <label className="text-slate-800" htmlFor="subcategoryId">
            Subcategoría:
          </label>
          <select
            className="block w-full p-3 text-black bg-slate-100"
            id="subcategoryId"
            name="subcategoryId"
            defaultValue={product?.subcategoryId}
            required
          >
            <option value="">-- Seleccione --</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-slate-800" htmlFor="stock">
          Stock:
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          className="block w-full p-3 text-black bg-slate-100"
          placeholder="Cantidad en Stock"
          defaultValue={product?.stock ?? 0}
        />
      </div>

      <ImageUpload image={product?.image} />
    </>
  );
}
