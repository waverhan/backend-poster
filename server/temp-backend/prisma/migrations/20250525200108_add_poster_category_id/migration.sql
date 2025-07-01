/*
  Warnings:

  - A unique constraint covering the columns `[poster_category_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN "poster_category_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_poster_category_id_key" ON "categories"("poster_category_id");
