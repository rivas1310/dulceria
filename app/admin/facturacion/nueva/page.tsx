// app/admin/facturacion/nueva/page.tsx
import FacturaForm from '@/components/admin/facturacion/FacturaForm';
import { prisma } from '@/src/lib/prisma';

export default async function NuevaFacturaPage() {
  try {
    const productos = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        productoSAT: {
          select: {
            claveSAT: true
          }
        }
      }
    });

    console.log('Productos encontrados:', productos);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Nueva Factura</h1>
        <FacturaForm productos={productos} />
      </div>
    );

  } catch (error) {
    console.error('Error completo:', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-red-600">
          Error al cargar el formulario
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 mb-2">Error al cargar los productos:</p>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </pre>
        </div>
      </div>
    );
  }
}