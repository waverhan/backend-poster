-- CreateTable
CREATE TABLE "not_found_errors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requested_url" TEXT NOT NULL,
    "referrer" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_seen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "not_found_errors_requested_url_idx" ON "not_found_errors"("requested_url");

-- CreateIndex
CREATE INDEX "not_found_errors_timestamp_idx" ON "not_found_errors"("timestamp");

