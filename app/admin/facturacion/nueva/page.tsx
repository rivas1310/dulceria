// app/admin/facturacion/nueva/page.tsx
import { Suspense } from 'react';
import FacturaForm from '@/components/admin/facturacion/FacturaForm';

export const metadata = {
  title: 'Nueva Factura - Unisite Cafetería',
};

export default function NuevaFacturaPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Factura</h1>
      
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <FacturaForm />
      </Suspense>
    </div>
  );
}