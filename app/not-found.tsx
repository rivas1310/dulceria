import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">404</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Página no encontrada</h3>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link 
          href="/"
          className="inline-block py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}