#!/bin/bash

BACKEND_URL="https://backend-api-production-b3a0.up.railway.app"
PRODUCT_ID="cmiqephft0001btecg5kjduk2"

echo "🔄 Updating gift set product with bundle items..."

# Bundle items as a JSON string (will be stringified by the API)
BUNDLE_ITEMS='[{"product_id":"cmclpsxei000vstlkaebkdlwb","quantity":1},{"product_id":"cmclpwlgp0064stlkd54aahl6","quantity":1},{"product_id":"cmclpwc1x005qstlk16k7cazz","quantity":1},{"product_id":"cmclpwpi40068stlkuwitulv5","quantity":1},{"product_id":"cmfw6heh3xnadxc2e6f5iwn14","quantity":1}]'

curl -X PUT "${BACKEND_URL}/api/products/${PRODUCT_ID}" \
  -H "Content-Type: application/json" \
  -d "{
    \"display_name\": \"Подарунковий Набір Опілля\",
    \"name\": \"Подарунковий Набір Опілля\",
    \"subtitle\": \"Бокал + 4 види пива 0,5л\",
    \"description\": \"Подарунковий набір включає: бокал на ніжці та 4 види пива Опілля (Корифей, Портер, Фірмове, Корифей Односолодове) по 0,5л у склі. Ідеальний подарунок для справжніх цінителів якісного пива!\",
    \"is_bundle\": true,
    \"bundle_items\": ${BUNDLE_ITEMS},
    \"price\": 250,
    \"original_price\": 280,
    \"category_id\": \"cmclpsjhk0006stlkmznhnuqw\",
    \"is_active\": true
  }" | jq '.'

echo ""
echo "✅ Gift set updated!"
echo ""
echo "Verifying bundle items..."
curl -s "${BACKEND_URL}/api/products/${PRODUCT_ID}/bundle-items" | jq '.bundle_items | length'

