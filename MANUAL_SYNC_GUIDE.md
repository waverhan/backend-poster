# Manual Sync Guide - Price Updates & New Products Import

## Overview

The system now provides **manual, separate endpoints** for updating prices and importing new products from Poster POS API. The automatic daily cron job has been **disabled** to give you full control over when these operations run.

## New Features

### 1. Manual Price Update Endpoint
**Endpoint:** `POST /api/sync/update-prices`

**What it does:**
- Fetches all products from Poster POS API
- Compares prices with existing products in the database
- Updates only the prices that have changed
- Preserves all other product data (name, description, category, etc.)

**Price Calculation:**
- Converts from kopecks to UAH: `price_kopecks / 100`
- For weight-based products (weight_flag=1): `price / 10` (converts from 100g price to 1kg price)

**Example Response:**
```json
{
  "success": true,
  "message": "Price update completed! Updated 5 prices.",
  "stats": {
    "updated_prices": 5,
    "skipped_products": 309,
    "errors": 0,
    "total_poster_products": 314,
    "sync_type": "manual-price-update"
  }
}
```

### 2. Manual New Products Import Endpoint
**Endpoint:** `POST /api/sync/import-new-products`

**What it does:**
- Fetches all products from Poster POS API
- Identifies products that don't exist in the database yet
- Creates new product records with:
  - Poster Product ID
  - Product name and description
  - Price (converted from kopecks)
  - Category (if available)
  - Weight flag and unit
  - Active status

**Example Response:**
```json
{
  "success": true,
  "message": "New products import completed! Added 2 new products.",
  "stats": {
    "new_products": 2,
    "skipped_products": 312,
    "errors": 0,
    "total_poster_products": 314,
    "sync_type": "manual-new-products-import"
  }
}
```

## Admin Panel Usage

### Location
Navigate to: **Admin Panel → Price Sync Tab**

### Available Buttons

1. **Update Prices Now** (Blue button)
   - Manually trigger price updates from Poster POS
   - Only updates prices, preserves all other data
   - Safe operation

2. **Import New Products** (Green button)
   - Manually import new products from Poster POS
   - Only imports products that don't exist yet
   - Existing products are not affected

3. **Sync Prices (Legacy)** (Yellow button)
   - Original price sync endpoint
   - Kept for backward compatibility

## Disabled Features

### Daily Cron Job
The automatic daily sync at 6 AM has been **disabled**. 

**Previous behavior:**
- Ran automatically every day at 6 AM (Kyiv time)
- Attempted to sync both new products and prices

**New behavior:**
- Manual control only
- Use the admin panel buttons to trigger syncs when needed

**Location in code:**
- File: `server/scripts/setup-cron.js`
- Lines: 159-161 (commented out)

## API Endpoints Summary

| Endpoint | Method | Purpose | Manual |
|----------|--------|---------|--------|
| `/api/sync/update-prices` | POST | Update prices only | ✅ Yes |
| `/api/sync/import-new-products` | POST | Import new products | ✅ Yes |
| `/api/sync/prices-only` | POST | Legacy price sync | ✅ Yes |
| `/api/sync/daily` | POST | Combined sync (legacy) | ✅ Yes |
| `/api/sync/inventory` | POST | Inventory sync | ✅ Yes (15 min intervals) |

## Automatic Syncs Still Running

The following automatic syncs are **still active**:

1. **Inventory Sync** - Every 15 minutes (8 AM - 10 PM)
2. **Peak Hours Sync** - Every 5 minutes (12 PM - 8 PM)
3. **Health Check** - Every hour
4. **Log Cleanup** - Every Sunday at 2 AM

## Price Conversion Details

### Standard Products (weight_flag = 0)
```
Price in UAH = price_1 / 100
Example: 3900 kopecks = 39 UAH
```

### Weight-Based Products (weight_flag = 1)
```
Price in UAH = (price_1 / 100) / 10
Example: 600 kopecks = 6 UAH per 100g = 60 UAH per kg
```

## Testing the Endpoints

### Using cURL

**Update Prices:**
```bash
curl -X POST https://backend-api-production-b3a0.up.railway.app/api/sync/update-prices \
  -H "Content-Type: application/json"
```

**Import New Products:**
```bash
curl -X POST https://backend-api-production-b3a0.up.railway.app/api/sync/import-new-products \
  -H "Content-Type: application/json"
```

## Troubleshooting

### No prices updated
- Check if products have `poster_product_id` set
- Verify Poster API token is correct
- Check if prices actually changed in Poster POS

### No new products imported
- Verify new products exist in Poster POS
- Check if they're already in the database
- Ensure they have valid product IDs

### Errors in sync
- Check server logs for detailed error messages
- Verify database connection
- Ensure Poster API is accessible

## Files Modified

1. **server/routes/sync.js**
   - Added `/api/sync/update-prices` endpoint
   - Added `/api/sync/import-new-products` endpoint
   - Fixed price field extraction from Poster API response

2. **server/scripts/setup-cron.js**
   - Disabled daily cron job
   - Updated log messages

3. **src/views/AdminView.vue**
   - Added UI buttons for manual syncs
   - Added handler functions
   - Updated Price Sync tab layout

## Next Steps

1. Deploy changes to Railway backend
2. Test the new endpoints from Admin Panel
3. Monitor sync logs for any issues
4. Adjust sync frequency as needed

