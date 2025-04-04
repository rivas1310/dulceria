"use client"
import { useState } from 'react';
import IconUpload from './IconUpload';

type IconType = {
  id: number;
  path: string;
  name: string;
  type: 'category' | 'subcategory';
};

interface IconEditModalProps {
  icon: IconType;
  onClose: () => void;
  onSave: (icon: IconType) => void;
}

export default function IconEditModal({ icon, onClose, onSave }: IconEditModalProps) {
  const [editedIcon, setEditedIcon] = useState<IconType>(icon);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIconChange = (url: string) => {
    setEditedIcon(prev => ({ ...prev, path: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('📤 Enviando actualización de icono:', JSON.stringify(editedIcon));

      // Validar datos
      if (!editedIcon.name.trim()) {
        throw new Error('El nombre es requerido');
      }

      if (!editedIcon.path) {
        throw new Error('El icono es requerido');
      }

      // Verificar que se incluye el tipo
      if (!editedIcon.type) {
        throw new Error('El tipo (categoría/subcategoría) es requerido');
      }

      // Actualizar el icono
      const updateResponse = await fetch(`/api/icons/${icon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedIcon),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text();
        console.error('🔴 Error en actualización:', errorData);
        throw new Error(`Error al actualizar el icono: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();
      console.log('✅ Icono actualizado:', updateData);

      onSave(editedIcon);
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Editar Icono</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del tipo */}
          <div className="bg-blue-50 p-2 rounded mb-3">
            <p className="text-sm text-blue-700">
              Editando: <strong>{editedIcon.type === 'category' ? 'Categoría' : 'Subcategoría'}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={editedIcon.name}
              onChange={(e) => setEditedIcon({ ...editedIcon, name: e.target.value })}
              className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2"
              disabled={isLoading}
            />
          </div>

          {/* Componente de carga de iconos */}
          <IconUpload 
            currentIcon={icon.path} 
            onIconChange={handleIconChange}
            disabled={isLoading}
            type={icon.type}
          />

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}