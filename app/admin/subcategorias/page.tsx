"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconUpload from '@/components/admin/categories/iconUpload';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function SubcategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    slug: '',
    iconPath: '/icons/default-subcategory.svg'
  });

  // Cargar categorías al montar el componente
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSubcategory,
          categoryId: selectedCategory
        }),
      });

      if (!response.ok) throw new Error('Error al crear la subcategoría');

      setShowForm(false);
      setNewSubcategory({
        name: '',
        slug: '',
        iconPath: '/icons/default-subcategory.svg'
      });
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestionar Subcategorías</h1>
        <p className="text-gray-600 text-lg font-bold ">Agrega subcategorías a las categorías existentes</p>
      </div>

      {/* Selector de Categoría */}
      <div className="mb-6">
        <label className="block text-xl font-extrabold text-gray-700 mb-1">
          Selecciona una Categoría
        </label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm px-4 py-2 text-gray-900 bg-white transition duration-150 ease-in-out"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botón para mostrar formulario */}
      {selectedCategory && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-black text-white px-4 py-2 rounded-md hover:bg-black"
        >
          + Agregar Subcategoría
        </button>
      )}

      {/* Modal del formulario */}
      {showForm && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nueva Subcategoría</h2>
            <p className="text-gray-600 mb-4">
              Agregando a: {categories.find(c => c.id === selectedCategory)?.name}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  }))}
                  className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={newSubcategory.slug}
                  className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icono
                </label>
                <IconUpload
                  currentIcon={newSubcategory.iconPath}
                  onUpload={(path) => setNewSubcategory(prev => ({ ...prev, iconPath: path }))}
                  type="subcategory"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}