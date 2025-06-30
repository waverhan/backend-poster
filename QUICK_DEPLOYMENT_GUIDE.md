# 🚀 Quick Deployment Guide

Deploy your PWA POS Shop with banner slider to separate repositories.

## 📋 Overview

- **Frontend**: https://github.com/waverhan/posterpos-shop.git → Netlify
- **Backend**: https://github.com/waverhan/backend-posterpos-shop.git → Railway

## ⚡ Quick Start (3 Commands)

### Option A: Deploy Both (Automated)
```bash
chmod +x deploy-both.sh
./deploy-both.sh
```

### Option B: Deploy Separately

#### 1. Deploy Backend First
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

#### 2. Deploy Frontend
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## 🌐 Manual Deployment Steps

### 🔧 Backend Deployment (Railway)

1. **Run Backend Script**
   ```bash
   ./deploy-backend.sh
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub"
   - Select `waverhan/backend-posterpos-shop`
   - Add PostgreSQL service
   - Set environment variables:
     ```
     DATABASE_URL=<from-postgresql-service>
     CORS_ORIGIN=https://your-frontend.netlify.app
     ```
   - Deploy!

3. **Get Backend URL**
   - Copy your Railway URL: `https://your-backend.railway.app`

### 📱 Frontend Deployment (Netlify)

1. **Run Frontend Script**
   ```bash
   ./deploy-frontend.sh
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git" → GitHub
   - Select `waverhan/posterpos-shop`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend.railway.app
     VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
     ```
   - Deploy!

## ✅ Verification Checklist

### Backend (Railway)
- [ ] Repository pushed to GitHub
- [ ] Railway deployment successful
- [ ] Database connected
- [ ] Health check responds: `https://your-backend.railway.app/health`
- [ ] API endpoints work: `https://your-backend.railway.app/api/banners`

### Frontend (Netlify)
- [ ] Repository pushed to GitHub
- [ ] Netlify deployment successful
- [ ] Environment variables set
- [ ] Site loads: `https://your-site.netlify.app`
- [ ] Banner slider appears on homepage and /shop
- [ ] Admin panel accessible: `/admin`

## 🎯 What Works After Deployment

### ✅ Immediate Features
- Dynamic banner slider (UI only)
- Product catalog from Poster POS
- Shopping cart and checkout
- PWA installation
- Responsive design
- Admin panel interface

### 🔧 Full Features (After Backend Connection)
- Banner management in admin
- Image uploads for banners
- Data persistence
- Order processing
- Email notifications

## 🔗 URLs After Deployment

- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.railway.app`
- **Admin Panel**: `https://your-site-name.netlify.app/admin`
- **API Docs**: `https://your-backend.railway.app/api`

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
# Verify DATABASE_URL format
# Test API endpoints manually
curl https://your-backend.railway.app/health
```

### Frontend Issues
```bash
# Check Netlify build logs
# Verify environment variables
# Test local build
npm run build
```

### Connection Issues
- Verify CORS_ORIGIN matches frontend URL
- Check VITE_API_BASE_URL points to backend
- Test API calls in browser console

## 📞 Support

- **Scripts**: `deploy-frontend.sh`, `deploy-backend.sh`, `deploy-both.sh`
- **Detailed Guides**: `BACKEND_DEPLOYMENT.md`, `NETLIFY_DEPLOYMENT.md`
- **Repositories**: 
  - Frontend: https://github.com/waverhan/posterpos-shop.git
  - Backend: https://github.com/waverhan/backend-posterpos-shop.git

## 🎉 Success!

Your PWA POS Shop with dynamic banner slider is now live! 🚀

Test the banner functionality:
1. Go to `/admin` → "Banners" tab
2. Create your first banner
3. See it appear on homepage and /shop page
4. Enjoy your modern PWA e-commerce platform!
