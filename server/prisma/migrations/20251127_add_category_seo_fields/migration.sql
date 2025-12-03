-- Add SEO metadata fields to categories
ALTER TABLE "categories" ADD COLUMN "seo_title" TEXT;
ALTER TABLE "categories" ADD COLUMN "seo_meta_description" TEXT;
ALTER TABLE "categories" ADD COLUMN "seo_content" TEXT;
