import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Factura } from './types';

// Función para combinar clases de Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para calcular los totales de una factura
export function calcularTotales(conceptos: any[]) {
  const subtotal = conceptos.reduce(
    (total, concepto) => total + (concepto.cantidad * concepto.valorUnitario),
    0
  );
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return { subtotal, iva, total };
}

// Función para generar un folio único para la factura
export function generarFolio(factura: Factura) {
  const date = new Date(factura.fechaEmision);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}-${factura.id.toString().padStart(4, '0')}`;
}

// Función para formatear una fecha en formato ISO sin la parte de la zona horaria
export function formatearFecha(fecha: Date) {
  return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

// Función para validar un RFC según el formato del SAT
export function validarRFC(rfc: string) {
  const regex = /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;
  return regex.test(rfc);
}