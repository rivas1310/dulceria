import NewProductForm from '@/components/products/NewProductForm';

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Producto</h1>
      <NewProductForm />
    </div>
  );
}