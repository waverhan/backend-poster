-- Add slug column to categories table
ALTER TABLE "categories" ADD COLUMN "slug" TEXT;

-- Create unique index for slug (allowing NULL values)
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug") WHERE "slug" IS NOT NULL;

-- Generate slugs from display_name for existing categories
UPDATE "categories" 
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE("display_name", '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE "slug" IS NULL;

