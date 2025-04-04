/*
  Warnings:

  - You are about to drop the `Factura` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConceptoFactura" DROP CONSTRAINT "ConceptoFactura_facturaId_fkey";

-- DropForeignKey
ALTER TABLE "Factura" DROP CONSTRAINT "Factura_orderId_fkey";

-- DropTable
DROP TABLE "Factura";

-- CreateTable
CREATE TABLE "facturas" (
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
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_folio_key" ON "facturas"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_uuid_key" ON "facturas"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_orderId_key" ON "facturas"("orderId");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoFactura" ADD CONSTRAINT "ConceptoFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
