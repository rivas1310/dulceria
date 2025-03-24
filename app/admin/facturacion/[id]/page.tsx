// app/admin/facturacion/[id]/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import FacturaDetails from '@/components/admin/facturacion/FacturaDetails';

export const metadata = {
  title: 'Detalles de Factura - Unisite Cafetería',
};

export default function FacturaPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalles de Factura</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/facturacion`}
            className="px-3 py-1 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Volver
          </Link>
          <Link
            href={`/admin/facturacion/imprimir/${params.id}`}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            target="_blank"
          >
            Imprimir Factura
          </Link>
        </div>
      </div>
      
      <Suspense fallback={<div>Cargando factura...</div>}>
        <FacturaDetails id={params.id} />
      </Suspense>
    </div>
  );
}