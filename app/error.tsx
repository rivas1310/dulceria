'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error en un servicio de errores
    console.error('Error en la aplicación:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h2>
        <p className="text-gray-700 mb-6">
          Lo sentimos, ha ocurrido un error al procesar tu solicitud.
        </p>
        <div className="bg-gray-100 p-4 rounded mb-6">
          <p className="text-sm font-mono text-gray-800">
            {error.message || 'Error desconocido'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-gray-500 mt-2">
              ID: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
} 