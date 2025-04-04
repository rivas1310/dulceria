import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

// Endpoint para validar un cupón
export async function POST(request: NextRequest) {
  try {
    const { codigo, subtotal } = await request.json();
    
    // Validar datos requeridos
    if (!codigo) {
      return NextResponse.json(
        { error: "Se requiere el código del cupón" },
        { status: 400 }
      );
    }
    
    if (!subtotal && subtotal !== 0) {
      return NextResponse.json(
        { error: "Se requiere el subtotal del pedido" },
        { status: 400 }
      );
    }
    
    console.log(`Validando cupón: ${codigo} para subtotal: ${subtotal}`);
    
    // Buscar el cupón
    const cupon = await prisma.cupon.findUnique({
      where: { codigo: codigo.trim().toUpperCase() }
    });
    
    // Verificar si el cupón existe
    if (!cupon) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar si el cupón está activo
    if (!cupon.activo) {
      return NextResponse.json(
        { error: "Este cupón no está activo actualmente" },
        { status: 400 }
      );
    }
    
    // Verificar fecha de expiración
    if (cupon.fechaExpiracion && new Date() > new Date(cupon.fechaExpiracion)) {
      return NextResponse.json(
        { error: "Este cupón ha expirado" },
        { status: 400 }
      );
    }
    
    // Verificar fecha de inicio
    if (new Date() < new Date(cupon.fechaInicio)) {
      const fechaInicio = new Date(cupon.fechaInicio).toLocaleDateString();
      return NextResponse.json(
        { error: `Este cupón será válido a partir del ${fechaInicio}` },
        { status: 400 }
      );
    }
    
    // Verificar máximo uso
    if (cupon.usoMaximo !== null && cupon.usosActuales >= cupon.usoMaximo) {
      return NextResponse.json(
        { error: "Este cupón ha alcanzado su límite de uso" },
        { status: 400 }
      );
    }
    
    // Verificar monto mínimo
    if (cupon.montoMinimo && subtotal < cupon.montoMinimo) {
      return NextResponse.json(
        { error: `El monto mínimo para este cupón es de $${cupon.montoMinimo.toFixed(2)}` },
        { status: 400 }
      );
    }
    
    // Calcular descuento
    let descuento = 0;
    let mensaje = "";
    
    if (cupon.montoDesc) {
      // Descuento de monto fijo
      descuento = Number(cupon.montoDesc);
      if (descuento > subtotal) {
        descuento = subtotal; // El descuento no puede ser mayor que el subtotal
      }
      mensaje = `Descuento de $${descuento.toFixed(2)} aplicado a tu pedido.`;
    } else if (cupon.porcentajeDesc) {
      // Descuento porcentual
      descuento = (Number(cupon.porcentajeDesc) / 100) * subtotal;
      mensaje = `Descuento del ${cupon.porcentajeDesc}% aplicado a tu pedido.`;
    }
    
    // Redondear a 2 decimales para evitar problemas de precisión
    descuento = Math.round(descuento * 100) / 100;
    
    // Calcular total con descuento
    const total = subtotal - descuento;
    
    console.log(`Descuento calculado: ${descuento}. Total final: ${total}`);
    
    // Devolver respuesta exitosa
    return NextResponse.json({
      descuento,
      total,
      mensaje,
      cupon: {
        id: cupon.id,
        codigo: cupon.codigo,
        descripcion: cupon.descripcion
      }
    });
    
  } catch (error) {
    console.error("Error al validar cupón:", error);
    return NextResponse.json(
      { error: "Error interno al validar el cupón" },
      { status: 500 }
    );
  }
} 