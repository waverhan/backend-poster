# 🔑 Get MinIO Credentials from Railway

## Step 1: Go to Railway Dashboard

1. Open: https://railway.app/dashboard
2. Select your project: **backend-poster-pos**
3. Select environment: **production**

## Step 2: Find MinIO Service

1. Look for the service named **"Bucket"** (this is your MinIO service)
2. Click on it

## Step 3: Get Credentials

In the MinIO service page, look for:

### Option A: Variables Tab
1. Click **Variables** tab
2. Look for these variables:
   - `MINIO_ROOT_USER` - This is your Access Key (usually `minioadmin`)
   - `MINIO_ROOT_PASSWORD` - This is your Secret Key (copy this!)

### Option B: Logs Tab
1. Click **Logs** tab
2. Look for startup messages that show:
   ```
   MinIO Object Storage Server
   ...
   Root User: minioadmin
   Root Password: [YOUR_PASSWORD]
   ```

## Step 4: Update Backend Variables

Once you have the credentials:

1. Go back to **backend-api** service
2. Click **Variables** tab
3. Add/Update these variables:

```env
MINIO_ENDPOINT=bucket-production-515e.up.railway.app:443
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=[YOUR_PASSWORD_HERE]
MINIO_USE_SSL=true
MINIO_BUCKET=opillia-images
SHOP_NOTIFICATION_EMAILS=waverhan@gmail.com,dzhodzhyk.natalja@gmail.com
```

## Step 5: Redeploy Backend

1. Go to **backend-api** service
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete

## Done! ✅

Your backend is now configured to use MinIO for image storage!


