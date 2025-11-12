# 🖼️ MinIO Image Storage Setup Guide

## Overview

Product images are now served from MinIO (S3-compatible object storage) on Railway instead of Poster POS URLs. This provides:
- ✅ Faster image loading
- ✅ Independent image storage
- ✅ Better control over image URLs
- ✅ Scalable cloud storage

---

## 🔧 Step 1: Add MinIO Secret Key to Railway

### Get the Secret Key

1. Go to: https://railway.app/dashboard
2. Select project: **backend-poster-pos**
3. Click on **"Bucket"** service (MinIO)
4. Click **Variables** tab
5. Copy `MINIO_ROOT_PASSWORD`

### Add to Backend

1. Go to **backend-api** service
2. Click **Variables** tab
3. Add new variable:
   - **Key**: `MINIO_SECRET_KEY`
   - **Value**: [Your MinIO password]
4. Click **Save**

### Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy**
3. Wait for deployment to complete

---

## 📤 Step 2: Upload Existing Images to MinIO

Once MinIO is configured, upload all existing product images:

### Via Admin Panel

1. Go to: https://opillia.com.ua/admin
2. Go to **Sync** section
3. Click **Upload Images to MinIO**
4. Wait for completion

### Via API

```bash
curl -X POST https://backend-api-production-b3a0.up.railway.app/api/sync/upload-images-to-minio
```

### Expected Response

```json
{
  "success": true,
  "message": "Image upload to MinIO completed! Uploaded 150 images.",
  "stats": {
    "total_products": 150,
    "uploaded": 150,
    "skipped": 0,
    "errors": 0
  }
}
```

---

## 🖼️ Step 3: Verify Images Are Showing

1. Go to: https://opillia.com.ua
2. Browse products
3. Images should now load from MinIO
4. Check browser DevTools → Network tab
5. Image URLs should show `/api/upload/minio-image/...`

---

## 📊 How It Works

### Image Flow

```
Poster POS
    ↓
Download Image
    ↓
Save Locally
    ↓
Upload to MinIO
    ↓
Store MinIO URL in Database
    ↓
Frontend Request
    ↓
Middleware Transforms URL
    ↓
Presigned URL from MinIO
    ↓
Image Displayed
```

### URL Transformation

- **Database**: `minio://products/product_123.jpg`
- **API Response**: `/api/upload/minio-image/product_123.jpg`
- **Frontend**: Presigned URL from MinIO (24-hour expiry)

---

## 🔄 New Product Images

When new products are synced from Poster POS:

1. Image is downloaded from Poster
2. Automatically uploaded to MinIO
3. MinIO URL stored in database
4. Frontend receives transformed URL

---

## 🛠️ Troubleshooting

### Images Not Showing

**Check 1: MinIO Secret Key**
```bash
# Go to Railway backend-api service
# Verify MINIO_SECRET_KEY is set
# Check logs for: "✅ MinIO service configured successfully"
```

**Check 2: Image Upload Status**
```bash
# Go to Admin Panel → Sync
# Check "Upload Images to MinIO" status
# Look for errors in logs
```

**Check 3: Database URLs**
```bash
# Check if image_url starts with "minio://"
# If not, run upload endpoint again
```

### Slow Image Loading

- MinIO presigned URLs are cached for 24 hours
- First load may be slower (generating presigned URL)
- Subsequent loads use cached URL

### MinIO Not Configured

If you see: "⚠️ MinIO credentials not provided. Using local file storage."

1. Add `MINIO_SECRET_KEY` to Railway variables
2. Redeploy backend
3. Check logs for success message

---

## 📋 Admin Panel Endpoints

### Upload Images to MinIO
- **Endpoint**: `POST /api/sync/upload-images-to-minio`
- **Purpose**: Batch upload all product images to MinIO
- **Response**: Upload statistics

### Check Image URLs
- **Endpoint**: `GET /api/sync/check-images`
- **Purpose**: Check current image URL distribution
- **Response**: Count of Poster, Railway, and placeholder URLs

---

## 🔐 Security

- **Presigned URLs**: Expire after 24 hours
- **Access Control**: Only authenticated users can upload
- **Bucket**: Private bucket with restricted access
- **SSL**: Enabled for all MinIO connections

---

## 📈 Performance

- **Image Caching**: 1 year cache on frontend
- **Presigned URLs**: 24-hour expiry
- **Batch Upload**: 5 images at a time to avoid overload
- **Fallback**: Local storage if MinIO unavailable

---

## 🎯 Next Steps

1. ✅ Add MinIO secret key to Railway
2. ✅ Redeploy backend
3. ✅ Upload existing images to MinIO
4. ✅ Verify images are showing
5. ✅ Monitor performance

---

## 📞 Support

- **Setup Issues**: See `MINIO_SETUP_FINAL_STEP.md`
- **Technical Details**: See `server/MINIO_AND_EMAIL_SETUP.md`
- **Deployment**: See `RAILWAY_DEPLOYMENT_GUIDE.md`

---

## ✨ Benefits

✅ **Faster Loading** - Images served from Railway
✅ **Independent Storage** - Not dependent on Poster POS
✅ **Scalable** - Can handle unlimited images
✅ **Reliable** - Automatic backups on Railway
✅ **Secure** - Presigned URLs with expiry
✅ **Cost Effective** - Included with Railway plan


