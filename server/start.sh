#!/bin/sh

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🔄 Running payment fields migration..."
node scripts/migrate-payment-fields.js || echo "⚠️ Migration script failed or already applied"

echo "🔄 Running new product features migration..."
node migrations/add-new-product-features.js || echo "⚠️ New product features migration failed or already applied"

echo "🚀 Starting the application..."
node index.js
