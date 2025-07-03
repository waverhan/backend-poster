-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poster_product_id" TEXT,
    "ingredient_id" TEXT,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "original_price" REAL,
    "image_url" TEXT,
    "display_image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_bottles" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category_id", "created_at", "description", "display_image_url", "display_name", "id", "image_url", "ingredient_id", "is_active", "name", "original_price", "poster_product_id", "price", "sort_order", "updated_at") SELECT "category_id", "created_at", "description", "display_image_url", "display_name", "id", "image_url", "ingredient_id", "is_active", "name", "original_price", "poster_product_id", "price", "sort_order", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_poster_product_id_key" ON "products"("poster_product_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
