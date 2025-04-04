-- CreateTable
CREATE TABLE "ProductoSAT" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "claveSAT" TEXT NOT NULL,
    "claveUnidad" TEXT NOT NULL DEFAULT 'H87',
    "descripcionSAT" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductoSAT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductoSAT_productId_key" ON "ProductoSAT"("productId");

-- AddForeignKey
ALTER TABLE "ProductoSAT" ADD CONSTRAINT "ProductoSAT_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
