# MinIO Image Storage & Email Configuration Guide

## Overview

This guide covers three major updates to the backend:
1. **MinIO Integration** - Cloud-based image storage on Railway
2. **SMTP Password Update** - New secure password
3. **Multiple Email Recipients** - Send order notifications to multiple email addresses

---

## 1. MinIO Image Storage Setup

### What is MinIO?

MinIO is an S3-compatible object storage service that can be deployed on Railway. It replaces local file storage with cloud-based storage, which is better for:
- Scalability (unlimited storage)
- Reliability (automatic backups)
- Performance (CDN-ready)
- Cost efficiency (pay-as-you-go)

### How It Works

**Before (Local Storage):**
```
Admin uploads image → Saved to /server/public/images → Served from Railway server
```

**After (MinIO Storage):**
```
Admin uploads image → Uploaded to MinIO → Served from MinIO CDN
```

### Setup Instructions

#### Step 1: Deploy MinIO on Railway

1. Go to Railway dashboard: https://railway.app
2. Create new service → Select "MinIO"
3. Configure:
   - **Root User**: `minioadmin` (or your choice)
   - **Root Password**: Generate a strong password
   - **Storage**: 10GB+ recommended

#### Step 2: Get MinIO Credentials

After deployment, Railway will provide:
- **Endpoint**: `minio.railway.app:443` (or your custom domain)
- **Access Key**: Your root username
- **Secret Key**: Your root password

#### Step 3: Update Railway Environment Variables

Add to your Railway backend service:

```env
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-strong-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
```

#### Step 4: Test the Connection

The backend will automatically:
- Connect to MinIO on startup
- Create the bucket if it doesn't exist
- Log success/failure messages

### Fallback Behavior

If MinIO is not configured:
- Images are stored locally in `/server/public/images`
- No errors occur - system works normally
- You can enable MinIO anytime without code changes

### Image Upload Flow

```javascript
// When admin uploads an image:
1. File is received by /api/upload/product-image
2. Saved temporarily to local storage
3. If MinIO enabled → Upload to MinIO
4. Return image path (MinIO or local)
5. Save path to database
```

---

## 2. SMTP Password Update

### What Changed

**Old Password**: (previous password)
**New Password**: `T0N5rvgZRg`

### Update Instructions

#### Option A: Update Railway Environment Variables (Recommended)

1. Go to Railway dashboard
2. Select your backend service
3. Go to Variables tab
4. Update `SMTP_PASS` to: `T0N5rvgZRg`
5. Redeploy

#### Option B: Update Local .env File

```env
SMTP_PASS=T0N5rvgZRg
```

### Verify Configuration

The backend logs will show:
```
✅ Email service configured successfully
```

If you see an error, check:
- SMTP_USER is correct
- SMTP_PASS is correct
- SMTP_HOST is correct (smtp.gmail.com)
- SMTP_PORT is 587

---

## 3. Multiple Email Recipients for Orders

### What Changed

Previously, order notifications were sent only to `SHOP_EMAIL`.

Now you can send to multiple email addresses:
- `info@opillia.com.ua` (primary)
- `waverhan@gmail.com` (new)
- `dzhodzhyk.natalja@gmail.com` (new)

### Setup Instructions

#### Step 1: Update Railway Environment Variables

Add new variable:

```env
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com
```

**Format**: Comma-separated email addresses (no spaces after commas)

#### Step 2: How It Works

When a new order is placed:

1. Customer receives confirmation email
2. Company receives notification email sent to:
   - `SHOP_EMAIL` (primary)
   - All emails in `SHOP_NOTIFICATION_EMAILS`

Example:
```
To: info@opillia.com.ua, waverhan@gmail.com, dzhodzhyk.natalja@gmail.com
Subject: 🛒 Нове замовлення №12345 - Opillia Shop
```

#### Step 3: Verify Configuration

Check the backend logs when an order is placed:
```
✅ Company notification sent to: info@opillia.com.ua, waverhan@gmail.com, dzhodzhyk.natalja@gmail.com
```

### Add/Remove Recipients

To change recipients, update `SHOP_NOTIFICATION_EMAILS`:

**Add more emails:**
```env
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com,another@email.com
```

**Remove an email:**
```env
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com
```

**Only primary email:**
```env
SHOP_NOTIFICATION_EMAILS=
```

---

## Complete Environment Variables

Here's the complete set of variables needed:

```env
# Database
DATABASE_URL=postgresql://...

# SMTP Email
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

# Multiple Email Recipients
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com

# MinIO (Optional)
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
```

---

## Troubleshooting

### MinIO Issues

**Problem**: "MinIO credentials not provided"
- **Solution**: Check MINIO_ACCESS_KEY and MINIO_SECRET_KEY are set

**Problem**: "Failed to connect to MinIO"
- **Solution**: Verify MINIO_ENDPOINT is correct and accessible

**Problem**: Images not uploading
- **Solution**: Check MinIO bucket exists and has write permissions

### Email Issues

**Problem**: "Email service not configured"
- **Solution**: Check SMTP_USER and SMTP_PASS are set

**Problem**: "Failed to send email"
- **Solution**: Verify SMTP credentials and check Gmail app password

**Problem**: Emails not going to all recipients
- **Solution**: Check SHOP_NOTIFICATION_EMAILS format (comma-separated, no spaces)

---

## Support

For issues or questions:
1. Check backend logs: `railway logs`
2. Verify environment variables in Railway dashboard
3. Test SMTP connection separately
4. Check MinIO bucket permissions


