"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IconUpload from '@/components/admin/categories/iconUpload';
import Image from 'next/image';

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    iconPath: '/icons/default-category.svg'
  });
  
  const [subcategories, setSubcategories] = useState<Array<{
    name: string;
    slug: string;
    iconPath: string;
  }>>([]);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    slug: '',
    iconPath: '/icons/default-subcategory.svg'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      // Primero crear la categoría
      const categoryResponse = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Leer la respuesta como JSON
      const responseData = await categoryResponse.json();
      
      // Verificar si la respuesta fue exitosa
      if (!categoryResponse.ok) {
        // Si hay un error, extraer el mensaje
        const errorMessage = responseData.error || 'Error al crear la categoría';
        alert('Error: ' + errorMessage);
        console.error('Error de API:', responseData);
        throw new Error(errorMessage);
      }
      
      const category = responseData;

      // Luego crear las subcategorías
      for (const subcategory of subcategories) {
        await fetch('/api/subcategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...subcategory,
            categoryId: category.id
          }),
        });
      }

      router.push('/admin/categorias');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {})
    }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nueva Categoría</h1>
        <p className="text-gray-600">Crea una nueva categoría para tus productos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección de Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre de la categoría
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono de la categoría
            </label>
            <IconUpload
              currentIcon={formData.iconPath}
              onUpload={(path) => setFormData(prev => ({ ...prev, iconPath: path }))}
            />
            {imagePreview && (
              <Image 
                src={imagePreview} 
                alt="Vista previa de la imagen" 
                width={200} 
                height={200}
                className="mt-2 rounded-md"
              />
            )}
          </div>
        </div>

        {/* Sección de Subcategorías */}
        <div className="mt-8 border-t pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Subcategorías</h2>
            <button
              type="button"
              onClick={() => {
                if (!formData.name) {
                  alert('Primero debes especificar el nombre de la categoría');
                  return;
                }
                setShowSubcategoryForm(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              + Agregar Subcategoría
            </button>
          </div>

          {/* Lista de subcategorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subcategories.map((sub, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={sub.iconPath} 
                    alt={sub.name} 
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-gray-500">{sub.slug}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubcategories(prev => 
                    prev.filter((_, i) => i !== index)
                  )}
                  className="text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {subcategories.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              No hay subcategorías agregadas
            </div>
          )}
        </div>

        {/* Modal para nueva subcategoría */}
        {showSubcategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Nueva Subcategoría</h3>
                <p className="text-sm text-gray-600">
                  Agregando subcategoría a: <span className="font-semibold">{formData.name || 'Nueva Categoría'}</span>
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!formData.name) {
                  alert('Primero debes especificar el nombre de la categoría');
                  return;
                }
                setSubcategories(prev => [...prev, newSubcategory]);
                setNewSubcategory({
                  name: '',
                  slug: '',
                  iconPath: '/icons/default-subcategory.svg'
                });
                setShowSubcategoryForm(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Subcategoría
                  </label>
                  <input
                    type="text"
                    value={newSubcategory.name}
                    onChange={(e) => setNewSubcategory(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                    placeholder="Ej: Café Caliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={newSubcategory.slug}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                    readOnly
                    placeholder="Se genera automáticamente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono de la Subcategoría
                  </label>
                  <IconUpload
                    currentIcon={newSubcategory.iconPath}
                    onUpload={(path) => setNewSubcategory(prev => ({ 
                      ...prev, 
                      iconPath: path 
                    }))}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSubcategoryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={!formData.name}
                  >
                    Agregar Subcategoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}