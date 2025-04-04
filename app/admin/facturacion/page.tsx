
import BusquedaFacturas from "@/components/admin/facturacion/BusquedaFacturas"
import ListaFacturas from "@/components/admin/facturacion/ListaFacturas"
import { prisma } from "@/src/lib/prisma"

export default async function FacturacionPage() {
  try {
    // Primero verificar el nombre de la tabla correcta
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%factura%'
    `

    console.log("Tablas disponibles:", tables)

    // Determinar el nombre correcto de la tabla
    const facturaTableName =
      Array.isArray(tables) && tables.length > 0
        ? tables.find(
            (t: any) =>
              t.table_name.toLowerCase().includes("factura") && !t.table_name.toLowerCase().includes("concepto"),
          )?.table_name || "Factura"
        : "Factura"

    console.log("Tabla de factura a utilizar:", facturaTableName)

    // Buscar también el nombre de la tabla de conceptos
    const conceptoTableName =
      Array.isArray(tables) && tables.length > 0
        ? tables.find((t: any) => t.table_name.toLowerCase().includes("conceptofactura"))?.table_name ||
          "ConceptoFactura"
        : "ConceptoFactura"

    console.log("Tabla de conceptos a utilizar:", conceptoTableName)

    // Obtener todas las facturas ordenadas por fecha de creación (descendente)
    // Consulta corregida
    const facturasQuery = `SELECT * FROM "${facturaTableName}" ORDER BY "createdAt" DESC`
    const facturasResult = await prisma.$queryRawUnsafe(facturasQuery)

    console.log("Número de facturas encontradas:", Array.isArray(facturasResult) ? facturasResult.length : 0)

    // Intentar usar Prisma directamente si la consulta raw falla
    let facturas
    if (!facturasResult || !Array.isArray(facturasResult) || facturasResult.length === 0) {
      // Intentar con el modelo de Prisma
      facturas = await prisma.factura.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          conceptos: true,
        },
      })
    } else {
      // Obtener todas las facturas con sus conceptos
      facturas = await Promise.all(
        (Array.isArray(facturasResult) ? facturasResult : []).map(async (factura: any) => {
          // Consulta corregida para conceptos
          const conceptosQuery = `SELECT * FROM "${conceptoTableName}" WHERE "facturaId" = ${factura.id}`
          const conceptosResult = await prisma.$queryRawUnsafe(conceptosQuery)

          return {
            ...factura,
            conceptos: Array.isArray(conceptosResult) ? conceptosResult : [],
          }
        }),
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Facturación</h1>
          <a href="/admin/facturacion/nueva" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nueva Factura
          </a>
        </div>

        <BusquedaFacturas />
        <ListaFacturas facturas={facturas} />
      </div>
    )
  } catch (error) {
    console.error("Error al obtener facturas:", error)

    // Mostrar mensaje de error
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Facturación</h1>
          <a href="/admin/facturacion/nueva" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nueva Factura
          </a>
        </div>

        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          <h2 className="text-xl font-bold">Error al cargar facturas</h2>
          <p>Ocurrió un error al intentar cargar la lista de facturas.</p>
          <p>Mensaje de error: {error instanceof Error ? error.message : String(error)}</p>
        </div>

        <BusquedaFacturas />
        <ListaFacturas facturas={[]} />
      </div>
    )
  }
}

