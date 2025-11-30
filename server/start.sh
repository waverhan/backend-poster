#!/bin/sh

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🔄 Running payment fields migration..."
node scripts/migrate-payment-fields.js || echo "⚠️ Migration script failed or already applied"

echo "🔄 Running new product features migration..."
node migrations/add-new-product-features.js || echo "⚠️ New product features migration failed or already applied"

echo "🔄 Running Untappd mappings migration..."
node migrations/add-untappd-mappings.js || echo "⚠️ Untappd mappings migration failed or already applied"

echo "🚀 Starting the application..."
# Enable garbage collection and set memory limits to prevent crashes
# --expose-gc: Enable manual garbage collection
# --max-old-space-size=1024: Limit heap to 1GB to prevent OOM (increased from 512MB)
# --abort-on-uncaught-exception: Catch uncaught exceptions
node --expose-gc --max-old-space-size=1024 --abort-on-uncaught-exception index.js
