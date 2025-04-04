/*
  Warnings:

  - You are about to drop the `facturas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConceptoFactura" DROP CONSTRAINT "ConceptoFactura_facturaId_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_orderId_fkey";

-- DropTable
DROP TABLE "facturas";

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
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folio_key" ON "Factura"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_uuid_key" ON "Factura"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_orderId_key" ON "Factura"("orderId");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptoFactura" ADD CONSTRAINT "ConceptoFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
