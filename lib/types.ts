export interface DatosReceptor {
    rfc: string;
    nombre: string;
    codigoPostal: string;
    regimenFiscal: string;
    usoCFDI: string;
  }
  
  export interface Concepto {
    productoId: number;
    cantidad: number;
    valorUnitario: number;
    descripcion: string;
    claveProdServ: string;
    claveUnidad: string;
  }
  
  export interface Factura {
    id: number;
    folio?: string;
    uuid?: string;
    fechaEmision: Date;
    estado: 'PENDIENTE' | 'TIMBRADA' | 'CANCELADA';
    emisorRFC: string;
    emisorNombre: string;
    emisorCP: string;
    receptorRFC: string;
    receptorNombre: string;
    receptorCP: string;
    regimenFiscal: string;
    usoCFDI: string;
    subtotal: number;
    iva: number;
    total: number;
    formaPago: string;
    metodoPago: string;
    conceptos: Concepto[];
    selloDigitalEmisor?: string;
    selloSAT?: string;
    certificadoSAT?: string;
    cadenaOriginal?: string;
  }
  
  export interface FacturaCreateData {
    receptor: DatosReceptor;
    conceptos: Omit<Concepto, 'productoId'>[];
  }
  
  export interface FacturaUpdateData {
    estado?: 'PENDIENTE' | 'TIMBRADA' | 'CANCELADA';
  }