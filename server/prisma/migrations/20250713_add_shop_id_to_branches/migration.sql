-- AlterTable
ALTER TABLE "branches" ADD COLUMN "shop_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "branches_shop_id_key" ON "branches"("shop_id");
