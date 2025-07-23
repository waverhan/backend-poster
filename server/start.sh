#!/bin/sh

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🔄 Running payment fields migration..."
node scripts/migrate-payment-fields.js || echo "⚠️ Migration script failed or already applied"

echo "🚀 Starting the application..."
node index.js
