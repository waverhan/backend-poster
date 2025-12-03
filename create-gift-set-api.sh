#!/bin/bash

# Create Подарунковий Набір Опілля gift set via API

BACKEND_URL="https://backend-api-production-b3a0.up.railway.app"

# Bundle items with product IDs
BUNDLE_ITEMS='[
  {"product_id": "cmclpsxei000vstlkaebkdlwb", "quantity": 1},
  {"product_id": "cmclpwlgp0064stlkd54aahl6", "quantity": 1},
  {"product_id": "cmclpwc1x005qstlk16k7cazz", "quantity": 1},
  {"product_id": "cmclpwpi40068stlkuwitulv5", "quantity": 1},
  {"product_id": "cmfw6heh3xnadxc2e6f5iwn14", "quantity": 1}
]'

# Calculate new_until date (30 days from now)
NEW_UNTIL=$(date -u -v+30d +"%Y-%m-%dT%H:%M:%S.000Z")

echo "🎁 Creating Подарунковий Набір Опілля gift set..."

curl -X POST "${BACKEND_URL}/api/products" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": \"cmclpsjhk0006stlkmznhnuqw\",
    \"name\": \"Подарунковий Набір Опілля\",
    \"display_name\": \"Подарунковий Набір Опілля\",
    \"slug\": \"podarunkovyi-nabir-opillya\",
    \"description\": \"Подарунковий набір включає: бокал на ніжці та 4 види пива Опілля (Корифей, Портер, Фірмове, Корифей Односолодове) по 0,5л у склі. Ідеальний подарунок для справжніх цінителів якісного пива!\",
    \"subtitle\": \"Бокал + 4 види пива 0,5л\",
    \"price\": 250,
    \"original_price\": 280,
    \"image_url\": \"https://opillia.com.ua/wp-content/uploads/2024/11/gift-set.jpg\",
    \"display_image_url\": \"https://opillia.com.ua/wp-content/uploads/2024/11/gift-set.jpg\",
    \"is_active\": true,
    \"is_bundle\": true,
    \"bundle_items\": ${BUNDLE_ITEMS},
    \"is_new\": true,
    \"new_until\": \"${NEW_UNTIL}\",
    \"sort_order\": 1
  }" | jq '.'

echo ""
echo "✅ Gift set created successfully!"
echo ""
echo "Bundle contains:"
echo "  1. Бокал на нiжцi - 99 UAH"
echo "  2. Пиво Опілля \`Корифей\` 0,5 л (скло) - 39 UAH"
echo "  3. Пиво Опілля \"Портер\" 0,5л. скло - 51 UAH"
echo "  4. Пиво Опілля \`Фірмове\` 0,5 л (скло) - 45 UAH"
echo "  5. Пиво світле \"Опілля Корифей Односолодове\" 0,5л. скло - 46 UAH"
echo ""
echo "💰 Price: 250 UAH (original: 280 UAH)"
echo "🎉 Total savings: 30 UAH (10% discount)"

