import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Producto No Encontrado</h1>
      <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
      <Link
        href="/admin/productos"
        className="bg-black hover:bg-customCyan text-white px-4 py-2 rounded-md"
      >
        Volver a Productos
      </Link>
    </div>
  );
} 