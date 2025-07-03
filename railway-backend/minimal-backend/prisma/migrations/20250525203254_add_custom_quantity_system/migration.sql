-- AlterTable
ALTER TABLE "products" ADD COLUMN "custom_quantity" REAL;
ALTER TABLE "products" ADD COLUMN "custom_unit" TEXT;
ALTER TABLE "products" ADD COLUMN "max_quantity" REAL;
ALTER TABLE "products" ADD COLUMN "min_quantity" REAL;
ALTER TABLE "products" ADD COLUMN "quantity_step" REAL;
