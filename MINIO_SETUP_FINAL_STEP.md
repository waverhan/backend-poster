# 🔑 Final Step: Add MinIO Secret Key

## ✅ What's Done

Your backend has been successfully deployed to Railway with:
- ✅ MinIO service endpoint configured
- ✅ MinIO access key configured
- ✅ Email service configured
- ✅ Multiple email recipients configured

## ⏳ What's Remaining

We need to add the **MinIO Secret Key** to complete the setup.

---

## 📋 Step 1: Get MinIO Secret Key from Railway

### Option A: Via Railway Dashboard (Recommended)

1. Go to: https://railway.app/dashboard
2. Select project: **backend-poster-pos**
3. Select environment: **production**
4. Click on the **"Bucket"** service (your MinIO service)
5. Click **Variables** tab
6. Look for:
   - `MINIO_ROOT_USER` = `minioadmin` (Access Key)
   - `MINIO_ROOT_PASSWORD` = **[COPY THIS]** (Secret Key)

### Option B: Via MinIO Console

1. Go to: https://console-production-ba80.up.railway.app
2. Login with:
   - Username: `minioadmin`
   - Password: [Your MinIO password]
3. Go to **Settings** → **Access Keys**
4. Copy the secret key

---

## 🔧 Step 2: Add Secret Key to Backend

Once you have the secret key:

### Method 1: Via Railway Dashboard (Easiest)

1. Go to: https://railway.app/dashboard
2. Select project: **backend-poster-pos**
3. Select environment: **production**
4. Click on **backend-api** service
5. Click **Variables** tab
6. Add new variable:
   - **Key**: `MINIO_SECRET_KEY`
   - **Value**: [Your MinIO secret key]
7. Click **Save**

### Method 2: Via Code (Update railway.json)

1. Open: `server/railway.json`
2. Find the `MINIO_ACCESS_KEY` line
3. Add below it:
   ```json
   "MINIO_SECRET_KEY": "[YOUR_SECRET_KEY_HERE]"
   ```
4. Save and commit
5. Run: `railway up`

---

## 🚀 Step 3: Redeploy Backend

### If using Railway Dashboard:

1. Go to **backend-api** service
2. Click **Deployments** tab
3. Click **Redeploy** on latest deployment
4. Wait for deployment to complete

### If using Code:

```bash
cd server
railway up
```

---

## ✅ Step 4: Verify MinIO is Working

After redeployment, check the logs:

```bash
cd server
railway logs
```

Look for:
```
✅ MinIO service configured successfully
✅ Created MinIO bucket: opillia-images
```

---

## 🧪 Step 5: Test Image Upload

1. Go to admin panel: https://opillia.com.ua/admin
2. Go to Products section
3. Upload a product image
4. Check logs for:
   ```
   ✅ Image uploaded to MinIO: products/product_1234567890_image.jpg
   ```

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| Backend Deployment | ✅ Complete |
| Email Service | ✅ Configured |
| Multiple Recipients | ✅ Configured |
| MinIO Endpoint | ✅ Configured |
| MinIO Access Key | ✅ Configured |
| MinIO Secret Key | ⏳ **PENDING** |
| MinIO Bucket | ✅ Configured |

---

## 🎯 Next Actions

1. **Get MinIO Secret Key** from Railway Bucket service
2. **Add to backend variables** (MINIO_SECRET_KEY)
3. **Redeploy backend**
4. **Verify in logs**
5. **Test image upload**

---

## 📞 Need Help?

- Check: `server/GET_MINIO_CREDENTIALS.md`
- Check: `server/MINIO_AND_EMAIL_SETUP.md`
- Check: `QUICK_START_RAILWAY.md`

---

## 🎉 Once Complete

Your system will have:
- ✅ Cloud-based image storage (MinIO)
- ✅ Multiple email recipients for orders
- ✅ Updated SMTP password
- ✅ Fully automated image management


