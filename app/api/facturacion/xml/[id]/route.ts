import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { create } from 'xmlbuilder2';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar primero el nombre de la tabla correcta
    const tablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%factura%' OR table_name LIKE '%concepto%')
    `;
    
    // Convertir el resultado a un array para facilitar su uso
    const tables = Array.isArray(tablesResult) 
      ? tablesResult.map((t: any) => t.table_name.toLowerCase())
      : [];
    
    // Probar diferentes nombres de tabla para facturas
    let facturaTableName = '';
    const posiblesTablasFactura = ['factura', 'facturas', 'Factura', 'Facturas'];
    
    for (const tableName of posiblesTablasFactura) {
      if (tables.includes(tableName.toLowerCase())) {
        facturaTableName = tableName;
        break;
      }
    }
    
    // Si no encontramos la tabla, intentamos usar 'facturas' por defecto
    if (!facturaTableName) {
      facturaTableName = 'facturas';
      console.log('No se encontró tabla de facturas, usando tabla por defecto:', facturaTableName);
    } else {
      console.log('Tabla de facturas encontrada:', facturaTableName);
    }
    
    // Obtener la factura por ID
    const facturaQuery = `SELECT * FROM "${facturaTableName}" WHERE id = ${parseInt(params.id)}`;
    const facturaResult = await prisma.$queryRawUnsafe(facturaQuery);
    
    if (!Array.isArray(facturaResult) || facturaResult.length === 0) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }
    
    const factura = facturaResult[0];
    
    // Probar diferentes nombres de tabla para conceptos
    let conceptoTableName = '';
    const posiblesTablasConcepto = ['conceptofactura', 'conceptosfactura', 'conceptos_factura', 'conceptos'];
    
    for (const tableName of posiblesTablasConcepto) {
      if (tables.includes(tableName.toLowerCase())) {
        conceptoTableName = tableName;
        break;
      }
    }
    
    // Si no encontramos la tabla, intentamos usar 'conceptos' por defecto
    if (!conceptoTableName) {
      conceptoTableName = 'conceptos';
      console.log('No se encontró tabla de conceptos, usando tabla por defecto:', conceptoTableName);
    } else {
      console.log('Tabla de conceptos encontrada:', conceptoTableName);
    }
    
    // Obtener los conceptos de la factura
    const conceptosQuery = `SELECT * FROM "${conceptoTableName}" WHERE "facturaId" = ${factura.id}`;
    const conceptosResult = await prisma.$queryRawUnsafe(conceptosQuery);
    
    factura.conceptos = Array.isArray(conceptosResult) ? conceptosResult : [];

    const xml = generarXML(factura);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename=factura-${factura.id}.xml`
      }
    });

  } catch (error) {
    console.error('Error al generar XML:', error);
    return NextResponse.json(
      { error: 'Error al generar el XML', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function generarXML(factura: any) {
  // Función para manejar diferentes tipos de valores numéricos
  const formatNumber = (value: any): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    if (value && typeof value.toString === 'function') {
      return parseFloat(value.toString());
    }
    return 0;
  };

  // Formatear fecha
  let fechaEmision;
  try {
    fechaEmision = factura.fechaEmision instanceof Date 
      ? factura.fechaEmision 
      : new Date(factura.fechaEmision);
  } catch (error) {
    fechaEmision = new Date();
  }

  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('cfdi:Comprobante', {
      'xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd',
      Version: '4.0',
      Fecha: fechaEmision.toISOString(),
      Folio: factura.folio || '',
      FormaPago: factura.formaPago,
      MetodoPago: factura.metodoPago,
      SubTotal: formatNumber(factura.subtotal).toFixed(2),
      Total: formatNumber(factura.total).toFixed(2),
      Moneda: 'MXN',
      TipoDeComprobante: 'I',
      LugarExpedicion: factura.emisorCP,
    })
    .ele('cfdi:Emisor', {
      Rfc: factura.emisorRFC,
      Nombre: factura.emisorNombre,
      RegimenFiscal: factura.emisorRegimenFiscal || '601',
    })
    .up()
    .ele('cfdi:Receptor', {
      Rfc: factura.receptorRFC,
      Nombre: factura.receptorNombre,
      DomicilioFiscalReceptor: factura.receptorCP,
      RegimenFiscalReceptor: factura.regimenFiscal,
      UsoCFDI: factura.usoCFDI,
    })
    .up()
    .ele('cfdi:Conceptos');

  // Agregar conceptos
  if (factura.conceptos && Array.isArray(factura.conceptos)) {
    factura.conceptos.forEach((concepto: any) => {
      const cantidad = formatNumber(concepto.cantidad);
      const valorUnitario = formatNumber(concepto.valorUnitario);
      const importe = cantidad * valorUnitario;
      
      doc.ele('cfdi:Concepto', {
        ClaveProdServ: concepto.claveProdServ || concepto.claveProdServ || '01010101',
        Cantidad: cantidad,
        ClaveUnidad: concepto.claveUnidad || 'H87',
        Descripcion: concepto.descripcion,
        ValorUnitario: valorUnitario.toFixed(2),
        Importe: importe.toFixed(2),
        ObjetoImp: '02',
      })
      .ele('cfdi:Impuestos')
        .ele('cfdi:Traslados')
          .ele('cfdi:Traslado', {
            Base: importe.toFixed(2),
            Impuesto: '002',
            TipoFactor: 'Tasa',
            TasaOCuota: '0.160000',
            Importe: (importe * 0.16).toFixed(2),
          })
          .up()
        .up()
      .up()
      .up();
    });
  }

  // Agregar totales de impuestos
  const subtotal = formatNumber(factura.subtotal);
  const iva = formatNumber(factura.iva);
  
  doc.up()
    .ele('cfdi:Impuestos', {
      TotalImpuestosTrasladados: iva.toFixed(2),
    })
    .ele('cfdi:Traslados')
      .ele('cfdi:Traslado', {
        Base: subtotal.toFixed(2),
        Impuesto: '002',
        TipoFactor: 'Tasa',
        TasaOCuota: '0.160000',
        Importe: iva.toFixed(2),
      });

  // Agregar complemento si existe
  if (factura.uuid) {
    doc.up()
      .up()
      .ele('cfdi:Complemento')
        .ele('tfd:TimbreFiscalDigital', {
          'xmlns:tfd': 'http://www.sat.gob.mx/TimbreFiscalDigital',
          UUID: factura.uuid,
          FechaTimbrado: fechaEmision.toISOString(),
          SelloCFD: factura.selloDigitalEmisor,
          SelloSAT: factura.selloSAT,
          NoCertificadoSAT: factura.certificadoSAT,
          Version: '1.1',
        });
  }

  return doc.end({ prettyPrint: true });
}