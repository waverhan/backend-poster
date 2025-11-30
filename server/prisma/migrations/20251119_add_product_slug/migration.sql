-- Add slug column to products table
ALTER TABLE "products" ADD COLUMN "slug" TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

