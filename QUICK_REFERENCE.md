# Quick Reference - Manual Sync System

## Admin Panel Access

**URL:** `https://opillia.com.ua/admin`

**Tab:** Click on **Price Sync** tab (💰 icon)

## Three Buttons Available

### 1. Update Prices Now 🔵
- **Color:** Blue
- **What it does:** Updates prices from Poster POS
- **Time:** ~30 seconds
- **Safe:** Yes - only prices updated
- **Use when:** Prices changed in Poster POS

### 2. Import New Products 🟢
- **Color:** Green
- **What it does:** Imports new products from Poster POS
- **Time:** ~30 seconds
- **Safe:** Yes - only new products added
- **Use when:** New products added to Poster POS

### 3. Sync Prices (Legacy) 🟡
- **Color:** Yellow
- **What it does:** Original price sync endpoint
- **Time:** ~30 seconds
- **Safe:** Yes - for compatibility
- **Use when:** Need legacy behavior

## API Endpoints

### Update Prices
```
POST /api/sync/update-prices
```
**Response:**
```json
{
  "success": true,
  "stats": {
    "updated_prices": 5,
    "skipped_products": 309,
    "errors": 0
  }
}
```

### Import New Products
```
POST /api/sync/import-new-products
```
**Response:**
```json
{
  "success": true,
  "stats": {
    "new_products": 2,
    "skipped_products": 312,
    "errors": 0
  }
}
```

## Automatic Syncs (Still Running)

| Sync Type | Frequency | Time Window |
|-----------|-----------|-------------|
| Inventory | Every 15 min | 8 AM - 10 PM |
| Peak Hours | Every 5 min | 12 PM - 8 PM |
| Health Check | Every hour | All day |
| Log Cleanup | Weekly | Sunday 2 AM |

## Disabled

❌ **Daily Cron Job** (was 6 AM) - Now manual only

## Price Conversion

### Standard Products
```
Price = kopecks / 100
3900 kopecks = 39 UAH
```

### Weight-Based Products
```
Price = (kopecks / 100) / 10
600 kopecks = 6 UAH per 100g = 60 UAH per kg
```

## Testing

### Test Update Prices
1. Change price in Poster POS
2. Click "Update Prices Now"
3. Check Admin Panel → Products tab

### Test Import New Products
1. Create product in Poster POS
2. Click "Import New Products"
3. Search for product in Admin Panel

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No prices updated | Check if prices changed in Poster POS |
| No new products | Verify they exist in Poster POS |
| Buttons not showing | Clear browser cache & refresh |
| Sync takes too long | Check server logs in Railway |

## Files Changed

- `server/routes/sync.js` - Backend endpoints
- `server/scripts/setup-cron.js` - Disabled cron
- `src/views/AdminView.vue` - Admin UI

## Deployment

```bash
git add .
git commit -m "Manual sync system"
git push origin main
# Railway auto-deploys
```

## Documentation

- **Full Guide:** `MANUAL_SYNC_GUIDE.md`
- **Technical:** `SYNC_CHANGES_SUMMARY.md`
- **Deployment:** `DEPLOYMENT_INSTRUCTIONS.md`
- **Status:** `IMPLEMENTATION_COMPLETE.md`

## Key Points

✅ Manual control over syncs
✅ Separate price & product endpoints
✅ Admin Panel UI buttons
✅ Automatic inventory syncs still work
✅ Safe operations (no data loss)
✅ Easy to use

## Support

Check documentation files for:
- Detailed usage guide
- API examples
- Troubleshooting
- Deployment steps

