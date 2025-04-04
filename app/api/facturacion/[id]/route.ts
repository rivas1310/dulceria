import { prisma } from "@/src/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")
    const rfc = searchParams.get("rfc")
    const estado = searchParams.get("estado")

    const where: any = {}

    if (fechaInicio && fechaFin) {
      where.fechaEmision = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    }

    if (rfc) {
      where.receptorRFC = rfc
    }

    if (estado) {
      where.estado = estado
    }

    const facturas = await prisma.factura.findMany({
      where,
      include: {
        conceptos: true,
      },
      orderBy: {
        fechaEmision: "desc",
      },
    })

    return NextResponse.json(facturas)
  } catch (error) {
    console.error("Error al obtener facturas:", error)
    return NextResponse.json({ error: "Error al obtener las facturas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { receptor, conceptos } = body

    console.log("Datos recibidos:", { receptor, conceptos })

    if (!receptor || !conceptos || conceptos.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Calcular totales
    const subtotal = conceptos.reduce(
      (total: number, concepto: any) => total + concepto.cantidad * concepto.valorUnitario,
      0,
    )

    const iva = subtotal * 0.16
    const total = subtotal + iva

    console.log("Totales calculados:", { subtotal, iva, total })

    try {
      // Sanitizar y validar datos
      const emisorRFC = (process.env.EMISOR_RFC || "XXX010101XXX").replace(/'/g, "''")
      const emisorNombre = (process.env.EMISOR_NOMBRE || "Nombre de tu empresa").replace(/'/g, "''")
      const emisorCP = (process.env.EMISOR_CP || "12345").replace(/'/g, "''")
      const receptorRFC = receptor.rfc.replace(/'/g, "''")
      const receptorNombre = receptor.nombre.replace(/'/g, "''")
      const receptorCP = receptor.codigoPostal.replace(/'/g, "''")
      const regimenFiscal = receptor.regimenFiscal.replace(/'/g, "''")
      const usoCFDI = receptor.usoCFDI.replace(/'/g, "''")

      // Asegurar que los valores numéricos sean números válidos
      const subtotalFixed = Number.parseFloat(subtotal.toFixed(2))
      const ivaFixed = Number.parseFloat(iva.toFixed(2))
      const totalFixed = Number.parseFloat(total.toFixed(2))

      // Volver a usar SQL raw para evitar problemas con las relaciones de Prisma
      const tablesResult = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE '%factura%' OR table_name LIKE '%concepto%')
      `

      const tables = Array.isArray(tablesResult) ? tablesResult.map((t: any) => t.table_name.toLowerCase()) : []

      let facturaTableName = ""
      const posiblesTablasFactura = ["factura", "facturas", "Factura", "Facturas"]

      for (const tableName of posiblesTablasFactura) {
        if (tables.includes(tableName.toLowerCase())) {
          facturaTableName = tableName
          break
        }
      }

      if (!facturaTableName) {
        facturaTableName = "facturas"
      }

      // Crear la factura usando SQL raw
      const insertFactura = `
        INSERT INTO "${facturaTableName}" (
          "emisorRFC", "emisorNombre", "emisorCP", 
          "receptorRFC", "receptorNombre", "receptorCP", 
          "regimenFiscal", "usoCFDI", 
          "subtotal", "iva", "total", 
          "formaPago", "metodoPago", "fechaEmision", "estado",
          "createdAt", "updatedAt"
        ) VALUES (
          '${emisorRFC}', 
          '${emisorNombre}', 
          '${emisorCP}', 
          '${receptorRFC}', 
          '${receptorNombre}', 
          '${receptorCP}', 
          '${regimenFiscal}', 
          '${usoCFDI}',
          ${subtotalFixed}, 
          ${ivaFixed}, 
          ${totalFixed}, 
          'TRANSFERENCIA', 
          'PUE', 
          NOW(),
          'PENDIENTE',
          NOW(),
          NOW()
        ) RETURNING id
      `

      const facturaResult = await prisma.$queryRawUnsafe(insertFactura)
      const facturaId = Array.isArray(facturaResult) && facturaResult.length > 0 ? facturaResult[0].id : null

      if (!facturaId) {
        throw new Error("No se pudo obtener el ID de la factura creada")
      }

      console.log("Factura creada con ID:", facturaId)

      // Buscar la tabla de conceptos
      let conceptoTableName = ""
      const posiblesTablasConcepto = ["conceptofactura", "conceptosfactura", "conceptos_factura", "conceptos"]

      for (const tableName of posiblesTablasConcepto) {
        if (tables.includes(tableName.toLowerCase())) {
          conceptoTableName = tableName
          break
        }
      }

      if (!conceptoTableName) {
        conceptoTableName = "ConceptoFactura"
      }

      // Crear los conceptos usando SQL raw
      for (const concepto of conceptos) {
        const importe = Number.parseFloat((concepto.cantidad * concepto.valorUnitario).toFixed(2))
        const descripcionSanitizada = concepto.descripcion.replace(/'/g, "''")
        const claveSAT = (concepto.claveSAT || "01010101").replace(/'/g, "''")

        const insertConceptoQuery = `
          INSERT INTO "${conceptoTableName}" (
            "facturaId", "cantidad", "descripcion", 
            "valorUnitario", "importe", "claveProdServ", "claveUnidad",
            "createdAt", "updatedAt"
          ) VALUES (
            ${facturaId}, 
            ${concepto.cantidad}, 
            '${descripcionSanitizada}', 
            ${concepto.valorUnitario.toFixed(2)}, 
            ${importe}, 
            '${claveSAT}', 
            'H87',
            NOW(),
            NOW()
          )
        `

        await prisma.$queryRawUnsafe(insertConceptoQuery)
      }

      return NextResponse.json({
        message: "Factura creada correctamente",
        facturaId: facturaId,
      })
    } catch (innerError) {
      console.error("Error al crear factura:", innerError)
      throw innerError
    }
  } catch (error) {
    console.error("Error detallado al crear factura:", error)
    return NextResponse.json(
      {
        error: "Error al crear la factura",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

