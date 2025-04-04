-- DropForeignKey
ALTER TABLE "Factura" DROP CONSTRAINT "Factura_orderId_fkey";

-- AlterTable
ALTER TABLE "Factura" ALTER COLUMN "orderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
