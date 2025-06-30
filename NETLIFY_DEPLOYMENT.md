# 🚀 PWA POS Shop - Netlify Deployment Guide

This guide will help you deploy the PWA POS Shop to Netlify with the latest banner slider functionality.

## 🆕 Latest Updates
- ✅ Banner slider functionality added to homepage and shop page
- ✅ Admin panel for banner management
- ✅ Image upload and management system
- ✅ Dynamic content management

## 📋 Prerequisites

- GitHub account
- Netlify account (free tier available)
- Node.js 18+ installed locally
- Git installed

## 🔧 Project Structure

```
pwa-poster-shop/
├── src/                    # Vue.js frontend
│   ├── components/
│   │   ├── BannerSlider.vue
│   │   └── admin/
│   │       ├── BannerManagement.vue
│   │       └── BannerEditModal.vue
│   └── stores/
│       └── banners.ts
├── server/                 # Node.js backend
│   ├── routes/
│   │   └── banners.js
│   └── public/images/banners/
├── package.json           # Frontend dependencies
├── server/package.json    # Backend dependencies
├── netlify.toml          # Netlify configuration
└── _redirects            # Netlify redirects
```

## 🚀 Step 1: Prepare Repository

### 1.1 Initialize Git and Push to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: Add banner slider functionality with admin management"

# Add remote repository
git remote add origin https://github.com/waverhan/pwa-poster-shop.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Select your repository: `waverhan/pwa-poster-shop`

3. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:
   ```
   VITE_API_BASE_URL=https://your-site-name.netlify.app/.netlify/functions
   VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
   NODE_VERSION=18
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

## ⚙️ Step 3: Backend Configuration for Netlify Functions

Create Netlify Functions for the backend API:

### 3.1 Create netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3.2 Convert Server Routes to Netlify Functions

Create `netlify/functions/` directory and convert your server routes:

**netlify/functions/banners.js:**
```javascript
const { PrismaClient } = require('@prisma/client')
const multipart = require('lambda-multipart-parser')

const prisma = new PrismaClient()

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/admin')) {
          return await getAdminBanners()
        }
        return await getBanners()
      
      case 'POST':
        return await createBanner(event)
      
      case 'PUT':
        return await updateBanner(event)
      
      case 'DELETE':
        return await deleteBanner(event)
      
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

// Implementation functions here...
```

## 🔐 Step 4: Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

```env
# API Configuration
VITE_API_BASE_URL=https://your-site-name.netlify.app/.netlify/functions
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344

# Database
DATABASE_URL=your-database-connection-string

# Node Version
NODE_VERSION=18

# Optional: Email service
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## 📱 Step 5: Database Setup

For production, use a hosted database:

### Recommended Options:
1. **Supabase** (PostgreSQL, free tier)
   - Create project at supabase.com
   - Get connection string
   - Update DATABASE_URL

2. **PlanetScale** (MySQL, free tier)
   - Create database at planetscale.com
   - Get connection string
   - Update DATABASE_URL

3. **Railway** (PostgreSQL, free tier)
   - Create project at railway.app
   - Add PostgreSQL service
   - Get connection string

## 🧪 Step 6: Testing After Deployment

1. **Test Banner Slider**
   - Visit your Netlify URL
   - Check homepage banner slider
   - Check shop page banner slider
   - Test responsive design

2. **Test Admin Panel**
   - Go to `/admin`
   - Click "Banners" tab
   - Test creating new banners
   - Test image upload
   - Test banner reordering

3. **Test API Endpoints**
   ```bash
   # Test banner API
   curl https://your-site-name.netlify.app/.netlify/functions/banners
   
   # Test products API
   curl https://your-site-name.netlify.app/.netlify/functions/products
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Install dependencies
   npm install
   
   # Test build locally
   npm run build
   ```

2. **Banner Images Not Loading**
   - Check image upload path
   - Verify Netlify Functions handle file uploads
   - Check CORS settings

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database hosting service status
   - Test connection locally first

### Debug Commands:
```bash
# Test locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎉 Success Checklist

After successful deployment, verify:

- ✅ Homepage loads with banner slider
- ✅ Shop page loads with banner slider
- ✅ Admin panel accessible at `/admin`
- ✅ Banner management works in admin
- ✅ Image upload functionality works
- ✅ Product catalog loads correctly
- ✅ Shopping cart functionality works
- ✅ PWA install prompt appears
- ✅ Responsive design on mobile

## 📞 Support

If you encounter issues:
1. Check Netlify build logs in dashboard
2. Review browser console for errors
3. Test API endpoints directly
4. Verify environment variables are set

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests create deploy previews
- Easy rollback to previous versions

Your PWA POS Shop with banner slider functionality will be live at:
`https://your-site-name.netlify.app`
