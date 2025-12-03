#!/bin/bash

# Product IDs for the bundle items:
# 1. Бокал на нiжцi - cmclpsxei000vstlkaebkdlwb
# 2. Пиво Опілля `Корифей` 0,5 л (скло) - cmclpwlgp0064stlkd54aahl6
# 3. Пиво Опілля "Портер" 0,5л. скло - cmclpwc1x005qstlk16k7cazz
# 4. Пиво Опілля `Фірмове` 0,5 л (скло) - cmclpwpi40068stlkuwitulv5
# 5. Пиво світле "Опілля Корифей Односолодове" 0,5л. скло - cmfw6heh3xnadxc2e6f5iwn14

curl -X PUT "https://backend-api-production-b3a0.up.railway.app/api/products/cmiqephft0001btecg5kjduk2" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Подарунковий Набір Опілля",
    "is_bundle": true,
    "bundle_items": [
      {"product_id": "cmclpsxei000vstlkaebkdlwb", "quantity": 1},
      {"product_id": "cmclpwlgp0064stlkd54aahl6", "quantity": 1},
      {"product_id": "cmclpwc1x005qstlk16k7cazz", "quantity": 1},
      {"product_id": "cmclpwpi40068stlkuwitulv5", "quantity": 1},
      {"product_id": "cmfw6heh3xnadxc2e6f5iwn14", "quantity": 1}
    ]
  }' | jq '.'
