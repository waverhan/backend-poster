#!/bin/sh

echo "🔄 Syncing database schema..."
npx prisma db push

echo "🚀 Starting the application..."
node index.js
