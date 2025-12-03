#!/bin/bash

BACKEND_URL="https://backend-api-production-b3a0.up.railway.app"
PRODUCT_ID="cmiqephft0001btecg5kjduk2"

echo "📦 Adding inventory for gift set product via direct database update..."

# Create a temporary endpoint call to update inventory
# We'll use the sync endpoint pattern to trigger an update

# First, let's check current branches
echo "Fetching branches..."
BRANCHES=$(curl -s "${BACKEND_URL}/api/branches" | jq -r '.[] | .id')

echo "Found branches:"
echo "$BRANCHES"

# For each branch, we need to create inventory records
# Since there's no direct POST endpoint, we'll need to add one or use Prisma Studio

echo ""
echo "⚠️  No direct inventory creation endpoint available."
echo "We need to either:"
echo "1. Add a POST /api/inventory endpoint to the backend"
echo "2. Use Prisma Studio to add inventory manually"
echo "3. Run the script directly on Railway"

echo ""
echo "Let's add the endpoint to the backend..."

