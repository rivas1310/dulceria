import DetalleFactura from "@/components/admin/facturacion/DetallesFactura"
import { prisma } from "@/src/lib/prisma"

export default async function FacturaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    // Primero verificar todas las tablas disponibles en la base de datos
    const allTablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const allTables = Array.isArray(allTablesResult) 
      ? allTablesResult.map((t: any) => t.table_name) 
      : [];
    
    console.log("Todas las tablas disponibles:", allTables);
    
    // Buscar tablas específicas
    const facturaTablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%factura%' OR table_name LIKE '%Factura%')
    `;
    
    const conceptoTablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%concepto%' OR table_name LIKE '%Concepto%')
    `;
    
    const facturaTables = Array.isArray(facturaTablesResult) 
      ? facturaTablesResult.map((t: any) => t.table_name) 
      : [];
    
    const conceptoTables = Array.isArray(conceptoTablesResult) 
      ? conceptoTablesResult.map((t: any) => t.table_name) 
      : [];
    
    console.log("Tablas de facturas encontradas:", facturaTables);
    console.log("Tablas de conceptos encontradas:", conceptoTables);
    
    // Determinar la tabla de facturas a usar
    let facturaTableName = '';
    
    // Buscar primero en las tablas específicas de facturas
    if (facturaTables.length > 0) {
      facturaTableName = facturaTables[0]; // Usar la primera tabla de facturas encontrada
    } else {
      // Si no se encuentra, buscar entre todas las tablas
      const posiblesTablasFactura = ['factura', 'facturas', 'Factura', 'Facturas'];
      for (const tableName of posiblesTablasFactura) {
        if (allTables.some(t => t.toLowerCase() === tableName.toLowerCase())) {
          facturaTableName = allTables.find(t => t.toLowerCase() === tableName.toLowerCase()) || '';
          break;
        }
      }
      
      // Si aún no se encuentra, usar un valor por defecto
      if (!facturaTableName) {
        facturaTableName = 'facturas';
      }
    }
    
    console.log("Tabla de facturas a utilizar:", facturaTableName);
    
    // Verificar estructura de la tabla de facturas
    const columnsFacturaResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${facturaTableName}
    `;
    
    const columnsFactura = Array.isArray(columnsFacturaResult) 
      ? columnsFacturaResult.map((col: any) => col.column_name) 
      : [];
    
    console.log(`Columnas en la tabla ${facturaTableName}:`, columnsFactura);
    
    // Intentar obtener la factura
    const facturaQuery = `SELECT * FROM "${facturaTableName}" WHERE id = ${Number.parseInt(params.id)}`;
    console.log("Consulta a ejecutar:", facturaQuery);
    
    const facturaResult = await prisma.$queryRawUnsafe(facturaQuery);
    
    console.log("Resultado de la consulta de factura:", JSON.stringify(facturaResult, null, 2));
    
    // Si no hay resultados, mostramos error
    if (!Array.isArray(facturaResult) || facturaResult.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded">
            <h2 className="text-xl font-bold">Factura no encontrada</h2>
            <p>No se encontró la factura con ID: {params.id}</p>
            <p>Tabla consultada: {facturaTableName}</p>
            <p>Tablas disponibles: {allTables.join(', ')}</p>
            <p>Tablas de facturas: {facturaTables.join(', ')}</p>
            <p>Tablas de conceptos: {conceptoTables.join(', ')}</p>
          </div>
        </div>
      );
    }
    
    const factura = facturaResult[0];
    
    // Log de los datos críticos para depuración
    console.log("Datos del emisor:", {
      emisorRFC: factura.emisorRFC || factura.emisorrfc,
      emisorNombre: factura.emisorNombre || factura.emisornombre,
      emisorCP: factura.emisorCP || factura.emisorcp
    });
    
    console.log("Datos del receptor:", {
      receptorRFC: factura.receptorRFC || factura.receptorrfc,
      receptorNombre: factura.receptorNombre || factura.receptornombre,
      receptorCP: factura.receptorCP || factura.receptorcp
    });
    
    // Determinar la tabla de conceptos a usar
    let conceptoTableName = '';
    
    // Buscar primero en las tablas específicas de conceptos
    if (conceptoTables.length > 0) {
      conceptoTableName = conceptoTables[0]; // Usar la primera tabla de conceptos encontrada
    } else {
      // Revisar las columnas de la tabla para ver si tiene la estructura esperada
      const columnsResult = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${facturaTableName}
      `;
      
      const columns = Array.isArray(columnsResult) 
        ? columnsResult.map((col: any) => col.column_name.toLowerCase()) 
        : [];
      
      console.log(`Columnas en la tabla ${facturaTableName}:`, columns);
      
      // Verificar si "conceptos" existe como una columna o relación
      if (columns.includes('conceptos')) {
        // La factura ya tiene conceptos como propiedad, no necesitamos buscar en otra tabla
        const facturaCompleta = {
          ...factura,
          conceptos: factura.conceptos || [],
        };
        
        return (
          <div className="container mx-auto px-4 py-8">
            <DetalleFactura factura={facturaCompleta} />
          </div>
        );
      }
      
      // Si no se encuentra, mostrar la factura sin conceptos
      const facturaCompleta = {
        ...factura,
        conceptos: [],
      };
      
      return (
        <div className="container mx-auto px-4 py-8">
          <DetalleFactura factura={facturaCompleta} />
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            <p>No se encontró la tabla de conceptos. Se muestra la factura sin conceptos.</p>
            <p>Tablas disponibles: {allTables.join(', ')}</p>
          </div>
        </div>
      );
    }
    
    console.log("Tabla de conceptos a utilizar:", conceptoTableName);
    
    // Intentar obtener los conceptos
    const conceptosQuery = `SELECT * FROM "${conceptoTableName}" WHERE "facturaId" = ${Number.parseInt(params.id)}`;
    console.log("Consulta de conceptos a ejecutar:", conceptosQuery);
    
    let conceptos = [];
    
    try {
      const conceptosResult = await prisma.$queryRawUnsafe(conceptosQuery);
      conceptos = Array.isArray(conceptosResult) ? conceptosResult : [];
      console.log("Conceptos encontrados:", conceptos.length);
    } catch (conceptosError) {
      console.error("Error al obtener conceptos:", conceptosError);
      // Si falla la consulta de conceptos, seguimos mostrando la factura sin conceptos
    }
    
    // Combinar los resultados
    const facturaCompleta = {
      ...factura,
      conceptos: conceptos,
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        <DetalleFactura factura={facturaCompleta} />
      </div>
    );
  } catch (error) {
    console.error("Error al obtener la factura:", error);
    
    // Mostrar detalles del error para facilitar la depuración
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          <h2 className="text-xl font-bold">Error al cargar la factura</h2>
          <p>Ocurrió un error al intentar cargar la factura con ID: {params.id}</p>
          <p>Mensaje de error: {error instanceof Error ? error.message : String(error)}</p>
          <p className="mt-4">Por favor, intente de nuevo o contacte al administrador.</p>
        </div>
      </div>
    );
  }
}

