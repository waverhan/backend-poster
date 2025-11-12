# Quick Start - Railway Deployment (5 Minutes)

## 🚀 What You Need to Do

### Step 1: Update Backend Environment Variables (2 min)

1. Go to: https://railway.app/dashboard
2. Click your **backend service**
3. Click **Variables** tab
4. Add/Update these 2 variables:

```env
SMTP_PASS=T0N5rvgZRg
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com
```

✅ **Done!** These are the minimum required changes.

---

### Step 2: Redeploy Backend (2 min)

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete (usually 1-2 minutes)
4. Check logs for success:

```
✅ Email service configured successfully
```

✅ **Done!** Your backend is updated.

---

### Step 3: Test (1 min)

1. Place a test order on your shop
2. Check that emails are received in:
   - info@opillia.com.ua ✅
   - waverhan@gmail.com ✅
   - dzhodzhyk.natalja@gmail.com ✅

✅ **Done!** Everything is working!

---

## 🎁 Optional: Add MinIO for Cloud Image Storage

If you want cloud-based image storage (recommended for production):

### Step 1: Deploy MinIO (3 min)

1. Go to Railway dashboard
2. Click **New** → **Service**
3. Search for **MinIO**
4. Click **Deploy MinIO**
5. Configure:
   - Root User: `minioadmin`
   - Root Password: Generate strong password
   - Storage: 10GB+

### Step 2: Get MinIO Credentials (1 min)

After deployment:
1. Click your MinIO service
2. Go to **Variables** tab
3. Copy these values:
   - `MINIO_ENDPOINT` (e.g., `minio.railway.app:443`)
   - `MINIO_ACCESS_KEY` (e.g., `minioadmin`)
   - `MINIO_SECRET_KEY` (your password)

### Step 3: Add MinIO to Backend (1 min)

1. Go to your **backend service**
2. Click **Variables** tab
3. Add these variables:

```env
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
```

### Step 4: Redeploy Backend (2 min)

1. Go to **Deployments** tab
2. Click **Redeploy**
3. Wait for completion
4. Check logs for:

```
✅ MinIO service configured successfully
✅ Created MinIO bucket: opillia-images
```

### Step 5: Test Image Upload (1 min)

1. Go to admin panel
2. Upload a product image
3. Check logs for:

```
✅ Image uploaded to MinIO: products/product_1234567890_image.jpg
```

✅ **Done!** Images are now stored in the cloud!

---

## 📋 Complete Environment Variables

After all steps, your backend should have:

```env
# Database (already set)
DATABASE_URL=postgresql://...

# SMTP (UPDATED)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=T0N5rvgZRg

# Shop Info (already set)
SHOP_NAME=Opillia Shop
SHOP_EMAIL=info@opillia.com.ua
SHOP_PHONE=+38 (097) 324 46 68
SHOP_WEBSITE=https://opillia.com.ua

# Multiple Email Recipients (NEW)
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com

# MinIO (OPTIONAL)
MINIO_ENDPOINT=minio.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-password
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images

# Other existing variables...
```

---

## ✅ Verification Checklist

- [ ] Updated SMTP_PASS to `T0N5rvgZRg`
- [ ] Added SHOP_NOTIFICATION_EMAILS
- [ ] Redeployed backend
- [ ] Checked logs for success messages
- [ ] Tested email delivery to all 3 addresses
- [ ] (Optional) Deployed MinIO
- [ ] (Optional) Added MinIO variables
- [ ] (Optional) Tested image upload

---

## 🆘 Troubleshooting

### Emails not sending?
- Check SMTP_PASS is exactly: `T0N5rvgZRg`
- Check SMTP_USER is correct
- Check backend logs for errors

### Multiple emails not working?
- Check format: `email1@example.com,email2@example.com`
- No spaces after commas
- All emails are valid

### MinIO not working?
- Check MINIO_ENDPOINT is correct
- Check MINIO_ACCESS_KEY and MINIO_SECRET_KEY
- Check MinIO service is running on Railway

---

## 📚 More Information

For detailed information, see:
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `server/MINIO_AND_EMAIL_SETUP.md` - Technical details
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

---

## 🎉 You're Done!

Your backend is now updated with:
- ✅ New SMTP password
- ✅ Multiple email recipients
- ✅ Optional MinIO support

Everything is backward compatible and ready to go! 🚀


