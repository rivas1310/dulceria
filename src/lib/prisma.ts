import { PrismaClient } from "@prisma/client";

// Prevenir múltiples instancias de Prisma Client en desarrollo
// Ver: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Declarar variable global para el cliente Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Inicializar cliente Prisma
export const prisma = global.prisma || new PrismaClient();

// Guardar el cliente en la variable global sólo en desarrollo
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
