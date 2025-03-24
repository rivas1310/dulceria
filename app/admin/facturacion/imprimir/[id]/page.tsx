// app/admin/facturacion/imprimir/[id]/page.tsx
import { Suspense } from 'react';
import FacturaPrint from '@/components/admin/facturacion/FacturaPrint';

export const metadata = {
  title: 'Imprimir Factura - Unisite Cafetería',
};

export default function ImprimirFacturaPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4 max-w-4xl mx-auto bg-white">
      <Suspense fallback={<div>Cargando factura...</div>}>
        <FacturaPrint id={params.id} />
      </Suspense>
    </div>
  );
}