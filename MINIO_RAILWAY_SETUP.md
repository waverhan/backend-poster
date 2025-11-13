# ⚠️ URGENT: MinIO Railway Environment Variables Setup

## Problem Found 🔍

The backend logs show:
```
🔍 MinIO Configuration Check:
   Endpoint: localhost:9000
   Access Key: ✗ Missing
   Secret Key: ✓ Set
   Use SSL: false
```

**You have set `MINIO_SECRET_KEY`, but TWO more variables are missing:**
1. ❌ `MINIO_ACCESS_KEY` - NOT SET
2. ❌ `MINIO_ENDPOINT` - Using default `localhost:9000` instead of Railway endpoint

---

## Solution: Add Missing Environment Variables to Railway

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Select your project
3. Go to **backend-api** service
4. Click **Variables** tab

### Step 2: Add `MINIO_ACCESS_KEY`
- **Key:** `MINIO_ACCESS_KEY`
- **Value:** `minioadmin` (default MinIO access key)
- Click **Add**

### Step 3: Add `MINIO_ENDPOINT`
- **Key:** `MINIO_ENDPOINT`
- **Value:** Get this from your MinIO bucket service in Railway
  - Go to your **Bucket** service in Railway
  - Look for the public URL or domain
  - Format should be: `bucket-production-XXXX.up.railway.app:443`
- Click **Add**

### Step 4: Verify `MINIO_USE_SSL` is Set
- **Key:** `MINIO_USE_SSL`
- **Value:** `true` (since we're using port 443)
- If not set, add it

### Step 5: Verify `MINIO_BUCKET` is Set
- **Key:** `MINIO_BUCKET`
- **Value:** `opillia-images`
- If not set, add it

---

## Summary of Required Variables

| Variable | Value | Status |
|----------|-------|--------|
| `MINIO_ENDPOINT` | `bucket-production-XXXX.up.railway.app:443` | ❌ MISSING |
| `MINIO_ACCESS_KEY` | `minioadmin` | ❌ MISSING |
| `MINIO_SECRET_KEY` | `N3DJc2SmM6fWVfeVSRCQmYZVN54uTw47ye9atpK28Cynbk2` | ✅ SET |
| `MINIO_USE_SSL` | `true` | ⚠️ CHECK |
| `MINIO_BUCKET` | `opillia-images` | ⚠️ CHECK |

---

## After Adding Variables

1. **Redeploy backend:**
   ```bash
   cd /Users/erhan/Documents/augment-projects/pwa-pos/server
   railway up
   ```

2. **Check logs for success:**
   ```
   ✅ MinIO service configured successfully
   ```

3. **Go to Admin Panel:**
   - https://opillia.com.ua/admin
   - Click **Sync** → **Upload to MinIO**
   - Should see: "Uploaded 296 images, skipped 0, errors: 0"

---

## Need Help Finding MinIO Endpoint?

1. Go to Railway dashboard
2. Open your **Bucket** service
3. Look for:
   - **Public URL** or **Domain** section
   - Should show something like: `bucket-production-515e.up.railway.app`
   - Add `:443` to the end for the full endpoint

---

**Once you add these variables and redeploy, MinIO will work! 🚀**

