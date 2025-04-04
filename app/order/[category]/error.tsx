'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en la categoría:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-4 min-h-[70vh] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-3">Error en la categoría</h2>
        <p className="text-gray-700 mb-4">
          No se pudieron cargar los productos de esta categoría.
        </p>
        <div className="bg-gray-100 p-3 rounded mb-4">
          <p className="text-sm font-mono text-gray-800">
            {error.message || 'Error desconocido'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition duration-200 text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
} 