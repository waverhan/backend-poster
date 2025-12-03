#!/bin/bash

PRODUCT_ID="cmiqephft0001btecg5kjduk2"
BRANCHES=(
  "cmclpsiy60003stlk9kpfn3yc"  # Братиславська
  "cmclpsiyg0005stlku10z6yqq"  # Гетьмана
  "cmclpsiyb0004stlkxax6xnqq"  # Данькевича
  "cmclpsixu0001stlkw95udmd1"  # Голосіївский 100/2
  "cmclpsix70000stlk5opic0xq"  # Голосіївский 5
)

for BRANCH_ID in "${BRANCHES[@]}"; do
  echo "Adding inventory for branch: $BRANCH_ID"
  curl -X POST "https://backend-api-production-b3a0.up.railway.app/api/inventory" \
    -H "Content-Type: application/json" \
    -d "{
      \"product_id\": \"$PRODUCT_ID\",
      \"branch_id\": \"$BRANCH_ID\",
      \"quantity\": 50,
      \"unit\": \"pcs\"
    }" | jq '.'
  echo ""
done

echo "✅ Inventory added for all branches"
