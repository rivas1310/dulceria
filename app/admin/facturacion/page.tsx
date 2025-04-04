import BusquedaFacturas from "@/components/admin/facturacion/BusquedaFacturas"
import ListaFacturas from "@/components/admin/facturacion/ListaFacturas"
import { prisma } from "@/src/lib/prisma"

export default async function FacturacionPage() {
  try {
    // Obtener todas las facturas ordenadas por fecha de creación (descendente)
    const facturas = await prisma.factura.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        conceptos: true,
      },
    })

    // Convertir los valores decimales a números
    const facturasFormateadas = facturas.map(factura => ({
      ...factura,
      total: Number(factura.total),
      subtotal: Number(factura.subtotal),
      iva: Number(factura.iva),
      conceptos: factura.conceptos?.map(concepto => ({
        ...concepto,
        valorUnitario: Number(concepto.valorUnitario),
        importe: Number(concepto.importe)
      }))
    }))

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Facturación</h1>
          <a href="/admin/facturacion/nueva" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nueva Factura
          </a>
        </div>

        <BusquedaFacturas />
        <ListaFacturas facturas={facturasFormateadas} />
      </div>
    )
  } catch (error) {
    console.error("Error al cargar facturas:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          <h2 className="text-xl font-bold">Error al cargar facturas</h2>
          <p>Ocurrió un error al intentar cargar la lista de facturas.</p>
          <p className="mt-2">Mensaje de error: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    )
  }
}

