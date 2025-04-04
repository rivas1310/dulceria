import { Suspense } from 'react';
import CategoryList from '@/components/admin/categories/CategoryList';

export default function AdminCategoriasPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Administrar Categorías</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl">Categorías y Subcategorías</h2>
          <p className="text-gray-600">Gestiona tus categorías y sus subcategorías</p>
        </div>
        <a 
          href="/admin/categorias/nueva"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Nueva Categoría
        </a>
      </div>
      
      <Suspense fallback={<div>Cargando categorías...</div>}>
        <CategoryList />
      </Suspense>
    </div>
  );
}