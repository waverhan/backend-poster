#!/bin/bash

BACKEND_URL="https://backend-api-production-b3a0.up.railway.app"
PRODUCT_ID="cmiqephft0001btecg5kjduk2"

# Branch IDs
BRANCHES=(
  "cmclpsix70000stlk5opic0xq"  # Пр-т Голосіївский 5
  "cmclpsixu0001stlkw95udmd1"  # пр-т Голосіївский 100/2
  "cmclpsiy60003stlk9kpfn3yc"  # вул. Братиславська 14Б
  "cmclpsiyb0004stlkxax6xnqq"  # вул. Костянтина Данькевича 10
  "cmclpsiyg0005stlku10z6yqq"  # вул. Гетьмана 40А
)

echo "📦 Adding inventory for gift set product..."

for BRANCH_ID in "${BRANCHES[@]}"; do
  echo "Adding inventory for branch: $BRANCH_ID"
  
  curl -X POST "${BACKEND_URL}/api/inventory" \
    -H "Content-Type: application/json" \
    -d "{
      \"product_id\": \"${PRODUCT_ID}\",
      \"branch_id\": \"${BRANCH_ID}\",
      \"quantity\": 10,
      \"unit\": \"pcs\"
    }" -s | jq -c '{id, product_id, branch_id, quantity, unit}'
  
  echo ""
done

echo "✅ Inventory added for all branches!"

