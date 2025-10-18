# Deployment Instructions - Manual Sync System

## Quick Summary

You now have **manual, separate endpoints** for:
1. ✅ **Updating prices** from Poster POS
2. ✅ **Importing new products** from Poster POS
3. ❌ **Removed** automatic daily cron job (now manual only)

## Step-by-Step Deployment

### Step 1: Commit Changes

```bash
cd /Users/erhan/Documents/augment-projects/pwa-pos

git add server/routes/sync.js
git add server/scripts/setup-cron.js
git add src/views/AdminView.vue
git add MANUAL_SYNC_GUIDE.md
git add SYNC_CHANGES_SUMMARY.md

git commit -m "Implement manual sync endpoints for prices and new products

✨ Features:
- POST /api/sync/update-prices - Manual price updates only
- POST /api/sync/import-new-products - Manual new products import
- Fixed price field extraction from Poster API (price['1'] instead of price_1)
- Disabled automatic daily cron job (now manual control)

🎨 UI Updates:
- Added 'Update Prices Now' button (blue) in Admin Panel
- Added 'Import New Products' button (green) in Admin Panel
- Kept 'Sync Prices (Legacy)' button (yellow) for compatibility

📋 Documentation:
- MANUAL_SYNC_GUIDE.md - Complete usage guide
- SYNC_CHANGES_SUMMARY.md - Summary of changes"
```

### Step 2: Push to GitHub

```bash
git push origin main
```

### Step 3: Railway Auto-Deploy

Railway will automatically:
1. Detect the push
2. Build the backend
3. Deploy to production

**Monitor deployment:**
- Go to https://railway.app
- Select your project
- Watch the deployment logs

### Step 4: Verify Deployment

#### Option A: Test from Admin Panel
1. Go to https://opillia.com.ua/admin
2. Enter admin password
3. Click **Price Sync** tab
4. You should see 3 buttons:
   - Update Prices Now (Blue)
   - Import New Products (Green)
   - Sync Prices (Legacy) (Yellow)

#### Option B: Test with cURL
```bash
# Test Update Prices endpoint
curl -X POST https://backend-api-production-b3a0.up.railway.app/api/sync/update-prices \
  -H "Content-Type: application/json"

# Test Import New Products endpoint
curl -X POST https://backend-api-production-b3a0.up.railway.app/api/sync/import-new-products \
  -H "Content-Type: application/json"
```

## Testing Scenarios

### Scenario 1: Update Prices
1. **In Poster POS:**
   - Change price of product ID 24 (Пиво Опілля `Класичне` 0,5 л) to 40 UAH
   - Change price of product ID 59 (Пиво Опілля `Класичне` КЕГ) to 65 UAH

2. **In Admin Panel:**
   - Click "Update Prices Now"
   - Wait for success message
   - Verify prices updated in Products tab

3. **Expected Result:**
   - ✅ Prices updated
   - ✅ Other product data unchanged
   - ✅ Success message shows number of updated prices

### Scenario 2: Import New Products
1. **In Poster POS:**
   - Create a new product (e.g., "Test Product 2025")
   - Set price to 100 UAH
   - Assign to a category

2. **In Admin Panel:**
   - Click "Import New Products"
   - Wait for success message
   - Search for the new product in Products tab

3. **Expected Result:**
   - ✅ New product appears in system
   - ✅ Price is correct (100 UAH)
   - ✅ Success message shows number of imported products

### Scenario 3: Verify Automatic Syncs Still Work
1. **Check inventory sync:**
   - Wait 15 minutes
   - Check server logs for "Inventory sync" messages
   - Verify inventory levels update

2. **Expected Result:**
   - ✅ Automatic syncs still running
   - ✅ Inventory updates every 15 minutes
   - ✅ No errors in logs

## Rollback (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git revert HEAD

# Push to trigger re-deployment
git push origin main

# Railway will auto-deploy the previous version
```

## Monitoring

### Check Sync Logs
1. Go to Admin Panel → Overview tab
2. Look for sync status messages
3. Check "Sync Logs" section for detailed history

### Check Server Logs
1. Go to https://railway.app
2. Select your project
3. Click "Logs" tab
4. Search for "sync" or "price" keywords

## Common Issues & Solutions

### Issue: "No prices updated"
**Solution:**
- Verify prices actually changed in Poster POS
- Check if products have `poster_product_id` set
- Verify Poster API token is correct

### Issue: "New products not imported"
**Solution:**
- Verify new products exist in Poster POS
- Check if they're already in database
- Ensure they have valid product IDs

### Issue: Buttons not appearing in Admin Panel
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check if frontend deployed successfully

## Support

For issues or questions:
1. Check `MANUAL_SYNC_GUIDE.md` for detailed documentation
2. Check `SYNC_CHANGES_SUMMARY.md` for technical details
3. Review server logs in Railway dashboard
4. Check sync logs in Admin Panel

## Files Changed

- ✅ `server/routes/sync.js` - Backend endpoints
- ✅ `server/scripts/setup-cron.js` - Disabled cron job
- ✅ `src/views/AdminView.vue` - Admin UI
- ✅ `MANUAL_SYNC_GUIDE.md` - User documentation
- ✅ `SYNC_CHANGES_SUMMARY.md` - Technical summary
- ✅ `DEPLOYMENT_INSTRUCTIONS.md` - This file

## Next Steps

1. ✅ Commit and push changes
2. ✅ Wait for Railway deployment (2-5 minutes)
3. ✅ Test from Admin Panel
4. ✅ Monitor sync logs
5. ✅ Use manual buttons as needed

