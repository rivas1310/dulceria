"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import IconEditModal from '@/components/admin/icons/IconEditModal';

type IconType = {
  id: number;
  originalId?: number;
  path: string;
  name: string;
  type: 'category' | 'subcategory';
  uniqueKey?: string;
};

export default function IconosPage() {
  const [icons, setIcons] = useState<IconType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingIcon, setEditingIcon] = useState<IconType | null>(null);

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/icons');
      const data = await response.json();
      setIcons(data);
    } catch (error) {
      console.error('Error al cargar iconos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIcon = async (updatedIcon: IconType) => {
    try {
      const response = await fetch(`/api/icons/${updatedIcon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIcon),
      });

      if (!response.ok) throw new Error('Error al actualizar el icono');

      // Actualizar la lista de iconos
      await fetchIcons();
      setEditingIcon(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando iconos...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Administrar Iconos</h1>
        <p className="text-gray-600">Gestiona los iconos para categorías y subcategorías</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {icons.map((icon) => (
          <div
            key={icon.uniqueKey || `${icon.type}-${icon.id}`}
            className="border rounded-lg p-4 flex flex-col items-center"
          >
            <div className="w-20 h-20 relative mb-2">
              <Image
                src={icon.path}
                alt={icon.name}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-center text-black font-medium">{icon.name}</p>
            <p className="text-xs text-black mb-2">
              {icon.type === 'category' ? 'Categoría' : 'Subcategoría'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingIcon(icon)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Editar
              </button>
              <button
                onClick={async () => {
                  if (confirm('¿Estás seguro de eliminar este icono?')) {
                    await fetch(`/api/icons/${icon.id}`, { method: 'DELETE' });
                    await fetchIcons();
                  }
                }}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingIcon && (
        <IconEditModal
          icon={editingIcon}
          onClose={() => setEditingIcon(null)}
          onSave={handleUpdateIcon}
        />
      )}
    </div>
  );
}