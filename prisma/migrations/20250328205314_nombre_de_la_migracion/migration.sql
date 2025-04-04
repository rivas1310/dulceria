/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,categoryId]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_CREDITO', 'TARJETA_DEBITO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('PUE', 'PPD');

-- CreateEnum
CREATE TYPE "UsoCFDI" AS ENUM ('G01', 'G02', 'G03', 'P01');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'TIMBRADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "folio" TEXT,
    "uuid" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "emisorRFC" TEXT NOT NULL,
    "emisorNombre" TEXT NOT NULL,
    "emisorCP" TEXT NOT NULL,
    "receptorRFC" TEXT NOT NULL,
    "receptorNombre" TEXT NOT NULL,
    "receptorCP" TEXT NOT NULL,
    "regimenFiscal" TEXT NOT NULL,
    "usoCFDI" "UsoCFDI" NOT NULL DEFAULT 'G03',
    "subtotal" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30),
    "iva" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "formaPago" "FormaPago" NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'PUE',
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptoFactura" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valorUnitario" DECIMAL(65,30) NOT NULL,
    "importe" DECIMAL(65,30) NOT NULL,
    "claveProdServ" TEXT NOT NULL,
    "claveUnidad" TEXT NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptoFactura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folio_key" ON "Factura"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_uuid_key" ON "Factura"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_orderId_key" ON "Factura"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_categoryId_key" ON "Subcategory"("slug", "categoryId");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoFactura" ADD CONSTRAINT "ConceptoFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
