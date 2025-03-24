// app/admin/facturacion/page.tsx
import { Suspense } from 'react';
import FacturasList from '@/components/admin/facturacion/FacturacionList';

export const metadata = {
  title: 'Administrar Facturas - Unisite Cafetería',
};

export default function FacturacionPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Administrar Facturación</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl">Facturas</h2>
          <p className="text-gray-600">Gestiona las facturas de tus ventas</p>
        </div>
        <a 
          href="/admin/facturacion/nueva"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Nueva Factura
        </a>
      </div>
      
      <Suspense fallback={<div>Cargando facturas...</div>}>
        <FacturasList />
      </Suspense>
    </div>
  );
}