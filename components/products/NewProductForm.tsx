"use client";
import { useState, useEffect } from 'react';
import { ProductSchema } from "@/src/schema/index";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

export default function NewProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar categorías');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const data = {
        name: formData.get("name")?.toString() || "",
        price: formData.get("price")?.toString() || "0",
        categoryId: formData.get("categoryId")?.toString() || "",
        subcategoryId: formData.get("subcategoryId")?.toString() || "",
        image: formData.get("image")?.toString() || "",
        stock: formData.get("stock")?.toString() || "0",
      };

      if (!ProductSchema || typeof ProductSchema.safeParse !== 'function') {
        console.error("Error: ProductSchema no está disponible o no tiene el método safeParse");
        toast.error("Error en la validación del formulario");
        setLoading(false);
        return;
      }

      const result = ProductSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          toast.error(issue.message);
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el producto');
      }

      toast.success("Producto creado exitosamente");
      router.push("/admin/productos");
      router.refresh();
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white mt-10 px-5 py-10 rounded-md shadow-md max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nombre del Producto
          </label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Precio
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Categoría
          </label>
          <select
            name="categoryId"
            className="w-full p-2 border rounded-md"
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subcategoría
            </label>
            <select
              name="subcategoryId"
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecciona una subcategoría</option>
              {categories
                .find(c => c.id === selectedCategory)
                ?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <ImageUpload image={imagePreview || undefined} />

        <button
          type="submit"
          disabled={loading}
          className={`bg-black hover:bg-customCyan text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {loading ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  );
}