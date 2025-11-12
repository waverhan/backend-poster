# Railway Deployment Guide - MinIO & Email Setup

## Quick Summary

Three major updates have been implemented:

1. ✅ **MinIO Image Storage** - Cloud-based image storage on Railway
2. ✅ **SMTP Password Updated** - New password: `T0N5rvgZRg`
3. ✅ **Multiple Email Recipients** - Orders sent to multiple email addresses

---

## Step-by-Step Railway Setup

### Step 1: Update Backend Environment Variables

1. Go to: https://railway.app/dashboard
2. Select your backend service
3. Click "Variables" tab
4. Update/Add these variables:

```env
# SMTP Password (UPDATED)
SMTP_PASS=T0N5rvgZRg

# Multiple Email Recipients (NEW)
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com

# MinIO Configuration (OPTIONAL - for cloud image storage)
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-strong-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
```

### Step 2: Deploy MinIO (Optional but Recommended)

If you want cloud-based image storage:

1. Go to Railway dashboard
2. Click "New" → "Service"
3. Search for "MinIO"
4. Click "Deploy MinIO"
5. Configure:
   - **Root User**: `minioadmin`
   - **Root Password**: Generate strong password
   - **Storage**: 10GB+

6. After deployment, get credentials from Railway:
   - Copy **Endpoint** → `MINIO_ENDPOINT`
   - Copy **Access Key** → `MINIO_ACCESS_KEY`
   - Copy **Secret Key** → `MINIO_SECRET_KEY`

7. Add these to your backend service variables

### Step 3: Redeploy Backend

1. Go to your backend service
2. Click "Deployments" tab
3. Click "Redeploy" on latest deployment
4. Wait for deployment to complete
5. Check logs for success messages:

```
✅ Email service configured successfully
✅ MinIO service configured successfully
✅ Created MinIO bucket: opillia-images
```

### Step 4: Test the Setup

#### Test Email Configuration

1. Place a test order on your shop
2. Check backend logs for:
   ```
   ✅ Company notification sent to: info@opillia.com.ua, waverhan@gmail.com, dzhodzhyk.natalja@gmail.com
   ```
3. Verify emails received in all three inboxes

#### Test MinIO Configuration

1. Upload a product image in admin panel
2. Check backend logs for:
   ```
   ✅ Image uploaded to MinIO: products/product_1234567890_image.jpg
   ```
3. Verify image displays correctly on product page

---

## Environment Variables Reference

### Required Variables

```env
# Database
DATABASE_URL=postgresql://...

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=T0N5rvgZRg

# Shop Info
SHOP_NAME=Opillia Shop
SHOP_EMAIL=info@opillia.com.ua
SHOP_PHONE=+38 (097) 324 46 68
SHOP_WEBSITE=https://opillia.com.ua
```

### New Variables

```env
# Multiple Email Recipients (NEW)
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com

# MinIO Configuration (OPTIONAL)
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
```

---

## What Changed in Code

### 1. New MinIO Service
- **File**: `server/services/minioService.js`
- **Features**:
  - Upload images to MinIO
  - Delete images from MinIO
  - Generate presigned URLs
  - List images in bucket
  - Automatic fallback to local storage

### 2. Updated Upload Route
- **File**: `server/routes/upload.js`
- **Changes**:
  - Detects if MinIO is configured
  - Uploads to MinIO if available
  - Falls back to local storage
  - Returns storage type in response

### 3. Updated Email Service
- **File**: `server/services/emailService.js`
- **Changes**:
  - New method: `getOrderNotificationEmails()`
  - Sends to multiple recipients
  - Deduplicates email addresses
  - Logs all recipients

### 4. Updated Configuration
- **File**: `server/.env.example`
- **Changes**:
  - Added SMTP_PASS
  - Added SHOP_NOTIFICATION_EMAILS
  - Added MinIO variables

---

## Troubleshooting

### Email Not Sending

**Check:**
1. SMTP_USER and SMTP_PASS are correct
2. SMTP_HOST is `smtp.gmail.com`
3. SMTP_PORT is `587`
4. Backend logs show: `✅ Email service configured successfully`

**If still failing:**
- Check Gmail app password (not regular password)
- Enable "Less secure app access" if using Gmail

### Images Not Uploading to MinIO

**Check:**
1. MinIO service is running on Railway
2. MINIO_ENDPOINT is correct
3. MINIO_ACCESS_KEY and MINIO_SECRET_KEY are correct
4. MINIO_USE_SSL is `true`
5. Backend logs show: `✅ MinIO service configured successfully`

**If MinIO not configured:**
- Images will be stored locally (no error)
- Check `/server/public/images` directory

### Multiple Emails Not Working

**Check:**
1. SHOP_NOTIFICATION_EMAILS format: `email1@example.com,email2@example.com`
2. No spaces after commas
3. All emails are valid
4. Backend logs show all recipients

---

## Rollback Instructions

If you need to revert changes:

1. Remove MinIO variables from Railway
2. Set SMTP_PASS back to old password
3. Remove SHOP_NOTIFICATION_EMAILS variable
4. Redeploy backend

The code is backward compatible - it will work with or without these variables.

---

## Next Steps

1. ✅ Update Railway environment variables
2. ✅ Deploy MinIO (optional)
3. ✅ Redeploy backend service
4. ✅ Test email delivery
5. ✅ Test image uploads
6. ✅ Monitor logs for errors

---

## Support

For detailed information, see:
- `server/MINIO_AND_EMAIL_SETUP.md` - Complete technical guide
- `server/.env.example` - All available variables
- Railway logs - Real-time debugging


