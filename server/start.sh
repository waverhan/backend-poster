#!/bin/sh

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

echo "🚀 Starting the application..."
node index.js
