# 🚀 Backend Deployment Guide

This guide covers deploying the `/server` directory separately for full functionality.

## 🎯 Why Separate Backend?

The `/server` directory contains:
- Express.js API routes
- File upload handling (multer)
- Database operations (Prisma)
- Image storage
- Complex business logic

These features work best on a dedicated Node.js server rather than serverless functions.

## 📋 Deployment Options

### 🥇 Option 1: Railway (Recommended)
- ✅ Free tier with 500 hours/month
- ✅ Automatic deployments from Git
- ✅ Built-in PostgreSQL database
- ✅ Easy environment variables
- ✅ Custom domains

### 🥈 Option 2: Render
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Built-in PostgreSQL
- ✅ Good performance

### 🥉 Option 3: Heroku
- ⚠️ No free tier (paid only)
- ✅ Mature platform
- ✅ Many add-ons

## 🚀 Railway Deployment (Step-by-Step)

### Step 1: Create Separate Backend Repository

```bash
# Create new directory for backend
mkdir pwa-pos-backend
cd pwa-pos-backend

# Copy server files
cp -r /path/to/your/project/server/* .

# Initialize git
git init
git add .
git commit -m "Initial backend setup"

# Create GitHub repository
# Go to github.com and create: pwa-pos-backend
git remote add origin https://github.com/waverhan/pwa-pos-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Prepare Backend for Deployment

Create `package.json` in backend root:
```json
{
  "name": "pwa-pos-backend",
  "version": "1.0.0",
  "description": "PWA POS Shop Backend API",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "npx prisma generate && npx prisma migrate deploy"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "@prisma/client": "^5.6.0",
    "prisma": "^5.6.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Step 3: Deploy to Railway

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `pwa-pos-backend`

3. **Configure Environment Variables**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=3001
   NODE_ENV=production
   ```

4. **Add PostgreSQL Database**
   - In Railway dashboard, click "Add Service"
   - Choose "PostgreSQL"
   - Copy the DATABASE_URL to your environment variables

5. **Deploy**
   - Railway automatically builds and deploys
   - Get your backend URL: `https://your-app.railway.app`

### Step 4: Update Frontend Configuration

Update your frontend environment variables:

**For Netlify (Frontend):**
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

## 🔧 Alternative: Keep Everything Together

If you prefer one repository, here's how to structure it:

### Project Structure:
```
pwa-poster-shop/
├── frontend/          # Vue.js app
│   ├── src/
│   ├── package.json
│   └── netlify.toml
├── backend/           # Express.js API
│   ├── routes/
│   ├── package.json
│   └── railway.json
├── package.json       # Root package.json
└── README.md
```

### Root package.json:
```json
{
  "name": "pwa-poster-shop",
  "scripts": {
    "install:frontend": "cd frontend && npm install",
    "install:backend": "cd backend && npm install",
    "install:all": "npm run install:frontend && npm run install:backend",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build"
  }
}
```

## 🌐 Deployment Configuration

### Frontend (Netlify)
```toml
# netlify.toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend (Railway)
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

## 🔐 Environment Variables Setup

### Backend (.env):
```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.netlify.app
```

### Frontend (.env):
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

## 🧪 Testing the Setup

### Test Backend:
```bash
curl https://your-backend.railway.app/health
curl https://your-backend.railway.app/api/banners
```

### Test Frontend:
- Visit your Netlify URL
- Check browser console for API calls
- Test banner functionality in admin panel

## 📊 Recommended Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Netlify)     │◄──►│   (Railway)     │
│                 │    │                 │
│ • Vue.js        │    │ • Express.js    │
│ • Static files  │    │ • API routes    │
│ • PWA features  │    │ • File uploads  │
└─────────────────┘    │ • Database      │
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Database      │
                       │ (PostgreSQL)    │
                       └─────────────────┘
```

## 🎯 Quick Start Commands

### For Separate Repositories:

```bash
# 1. Deploy Frontend to Netlify
git clone https://github.com/waverhan/pwa-poster-shop.git
cd pwa-poster-shop
# Follow Netlify deployment steps

# 2. Deploy Backend to Railway
mkdir pwa-pos-backend
cp -r server/* pwa-pos-backend/
cd pwa-pos-backend
git init && git add . && git commit -m "Backend setup"
# Push to GitHub and deploy to Railway
```

### For Monorepo:
```bash
# Restructure existing project
mkdir frontend backend
mv src frontend/
mv server/* backend/
# Update package.json files
# Deploy frontend to Netlify, backend to Railway
```

## 🎉 Benefits of Separate Deployment

- ✅ **Scalability**: Scale frontend and backend independently
- ✅ **Performance**: Optimized hosting for each service type
- ✅ **Cost**: Use free tiers for both services
- ✅ **Reliability**: Separate failure domains
- ✅ **Development**: Independent deployment cycles

Choose the approach that best fits your needs!
