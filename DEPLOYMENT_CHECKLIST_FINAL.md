# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment (Code Ready)

- [x] MinIO service created (`server/services/minioService.js`)
- [x] Upload route updated (`server/routes/upload.js`)
- [x] Email service updated (`server/services/emailService.js`)
- [x] Environment variables documented (`.env.example`)
- [x] All code committed to GitHub
- [x] All documentation created
- [x] Backward compatibility verified

---

## 🔧 Step 1: Update Railway Backend Variables (2 min)

### Required Changes

- [ ] Go to: https://railway.app/dashboard
- [ ] Select your **backend service**
- [ ] Click **Variables** tab
- [ ] Update `SMTP_PASS` to: `T0N5rvgZRg`
- [ ] Add `SHOP_NOTIFICATION_EMAILS`: `waverhan@gmail.com,dzhodzhyk.natalja@gmail.com`

### Verify Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=T0N5rvgZRg
SHOP_EMAIL=info@opillia.com.ua
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com
```

---

## 🎁 Step 2: Optional - Deploy MinIO (5 min)

### Create MinIO Service

- [ ] Go to Railway dashboard
- [ ] Click **New** → **Service**
- [ ] Search for **MinIO**
- [ ] Click **Deploy MinIO**
- [ ] Configure:
  - Root User: `minioadmin`
  - Root Password: Generate strong password
  - Storage: 10GB+

### Get MinIO Credentials

- [ ] Click your MinIO service
- [ ] Go to **Variables** tab
- [ ] Copy `MINIO_ENDPOINT`
- [ ] Copy `MINIO_ACCESS_KEY`
- [ ] Copy `MINIO_SECRET_KEY`

### Add MinIO to Backend

- [ ] Go to backend service
- [ ] Click **Variables** tab
- [ ] Add `MINIO_ENDPOINT`: `minio.railway.app:443`
- [ ] Add `MINIO_ACCESS_KEY`: `minioadmin`
- [ ] Add `MINIO_SECRET_KEY`: Your password
- [ ] Add `MINIO_USE_SSL`: `true`
- [ ] Add `MINIO_BUCKET`: `opillia-images`

---

## 🔄 Step 3: Redeploy Backend (2 min)

- [ ] Go to backend service
- [ ] Click **Deployments** tab
- [ ] Click **Redeploy** on latest deployment
- [ ] Wait for deployment to complete (1-2 minutes)
- [ ] Check deployment status shows "Success"

---

## 📊 Step 4: Verify Deployment (2 min)

### Check Backend Logs

- [ ] Go to backend service
- [ ] Click **Logs** tab
- [ ] Look for success messages:
  ```
  ✅ Email service configured successfully
  ✅ MinIO service configured successfully (if MinIO enabled)
  ✅ Created MinIO bucket: opillia-images (if MinIO enabled)
  ```

### Check for Errors

- [ ] No error messages in logs
- [ ] No "Failed to configure" messages
- [ ] No connection errors

---

## 🧪 Step 5: Test Email Configuration (2 min)

### Place Test Order

- [ ] Go to your shop: https://opillia.com.ua
- [ ] Place a test order
- [ ] Use test email or your email

### Verify Email Delivery

- [ ] Check `info@opillia.com.ua` inbox
- [ ] Check `waverhan@gmail.com` inbox
- [ ] Check `dzhodzhyk.natalja@gmail.com` inbox
- [ ] All three should have received the order notification

### Check Backend Logs

- [ ] Look for message:
  ```
  ✅ Company notification sent to: info@opillia.com.ua, waverhan@gmail.com, dzhodzhyk.natalja@gmail.com
  ```

---

## 🖼️ Step 6: Test Image Upload (Optional - if MinIO enabled)

### Upload Product Image

- [ ] Go to admin panel: https://opillia.com.ua/admin
- [ ] Go to Products section
- [ ] Upload a product image
- [ ] Wait for upload to complete

### Verify Image Upload

- [ ] Check backend logs for:
  ```
  ✅ Image uploaded to MinIO: products/product_1234567890_image.jpg
  ```
- [ ] Verify image displays correctly on product page
- [ ] Check that image is served from MinIO (if enabled)

---

## ✅ Final Verification

- [ ] SMTP password updated
- [ ] Multiple email recipients configured
- [ ] Backend redeployed successfully
- [ ] No errors in logs
- [ ] Test order emails received in all 3 inboxes
- [ ] (Optional) MinIO configured and working
- [ ] (Optional) Product images uploading to MinIO

---

## 🎉 Deployment Complete!

All tasks have been successfully deployed to Railway.

### What's Now Live

✅ **SMTP Password**: `T0N5rvgZRg`
✅ **Email Recipients**: 3 addresses receiving order notifications
✅ **MinIO** (Optional): Cloud-based image storage

### Next Steps

1. Monitor order notifications for next 24 hours
2. Test image uploads with new products
3. Check logs regularly for any issues
4. Keep MinIO bucket monitored for storage usage

---

## 🆘 Troubleshooting

### Emails Not Sending

**Check:**
- [ ] SMTP_PASS is exactly: `T0N5rvgZRg`
- [ ] SMTP_USER is correct
- [ ] Backend logs show: `✅ Email service configured successfully`

**If still failing:**
- [ ] Check Gmail app password (not regular password)
- [ ] Enable "Less secure app access" if using Gmail

### Multiple Emails Not Working

**Check:**
- [ ] SHOP_NOTIFICATION_EMAILS format: `email1@example.com,email2@example.com`
- [ ] No spaces after commas
- [ ] All emails are valid
- [ ] Backend logs show all recipients

### MinIO Not Working

**Check:**
- [ ] MinIO service is running on Railway
- [ ] MINIO_ENDPOINT is correct
- [ ] MINIO_ACCESS_KEY and MINIO_SECRET_KEY are correct
- [ ] MINIO_USE_SSL is `true`
- [ ] Backend logs show: `✅ MinIO service configured successfully`

---

## 📞 Support Resources

- `QUICK_START_RAILWAY.md` - 5-minute setup guide
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `server/MINIO_AND_EMAIL_SETUP.md` - Technical details
- `FINAL_SUMMARY.md` - Implementation overview

---

## 📝 Notes

- All changes are backward compatible
- MinIO is optional (images work locally without it)
- Can be rolled back anytime
- No breaking changes to existing code

---

**Status**: ✅ Ready for Deployment

**Estimated Time**: 10-15 minutes total

**Difficulty**: Easy (mostly configuration)


