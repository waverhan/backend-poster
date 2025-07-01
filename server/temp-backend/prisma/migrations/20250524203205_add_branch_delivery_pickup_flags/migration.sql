-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poster_id" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "delivery_available" BOOLEAN NOT NULL DEFAULT true,
    "pickup_available" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_branches" ("address", "created_at", "id", "is_active", "latitude", "longitude", "name", "phone", "poster_id", "updated_at") SELECT "address", "created_at", "id", "is_active", "latitude", "longitude", "name", "phone", "poster_id", "updated_at" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
CREATE UNIQUE INDEX "branches_poster_id_key" ON "branches"("poster_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
