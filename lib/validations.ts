import { z } from 'zod';
import { REGIMENES_FISCALES, USOS_CFDI } from './constants';

export const receptorSchema = z.object({
  rfc: z.string()
    .min(12, 'El RFC debe tener al menos 12 caracteres')
    .max(13, 'El RFC no puede tener más de 13 caracteres')
    .regex(/^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/, 'RFC inválido'),
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(250, 'El nombre no puede tener más de 250 caracteres'),
  codigoPostal: z.string()
    .length(5, 'El código postal debe tener exactamente 5 dígitos')
    .regex(/^[0-9]{5}$/, 'Código postal inválido'),
  regimenFiscal: z.string()
    .refine((val) => Object.keys(REGIMENES_FISCALES).includes(val), {
      message: 'Régimen fiscal inválido',
    }),
  usoCFDI: z.string()
    .refine((val) => Object.keys(USOS_CFDI).includes(val), {
      message: 'Uso CFDI inválido',
    }),
});

export const conceptoSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  valorUnitario: z.number().positive(),
  descripcion: z.string().min(3).max(250),
  claveProdServ: z.string().min(3).max(10),
  claveUnidad: z.string().min(3).max(10),
});

export const facturaCreateSchema = z.object({
  receptor: receptorSchema,
  conceptos: z.array(conceptoSchema).min(1, 'Debe haber al menos un concepto'),
});

export const facturaUpdateSchema = z.object({
  estado: z.enum(['PENDIENTE', 'TIMBRADA', 'CANCELADA']),
});

// Función para validar la estructura completa de una factura
export function validarFactura(factura: any) {
  return facturaCreateSchema.safeParse(factura);
}

// Función para validar la actualización de una factura
export function validarActualizacionFactura(data: any) {
  return facturaUpdateSchema.safeParse(data);
}

// Función para validar un receptor
export function validarReceptor(receptor: any) {
  return receptorSchema.safeParse(receptor);
}

// Función para validar un concepto
export function validarConcepto(concepto: any) {
  return conceptoSchema.safeParse(concepto);
}