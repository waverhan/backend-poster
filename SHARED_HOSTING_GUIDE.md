# 🌐 Shared Hosting Deployment Guide

## 📋 Quick Deployment Steps

### 1. Prepare for Production
```bash
# Clean and prepare the code
npm run prepare:prod

# Build for production
npm run build:prod
```

### 2. Upload Files

#### Frontend (Upload to public_html/)
1. **Zip the dist folder**: `dist.zip`
2. **Upload to cPanel File Manager**
3. **Extract to public_html/**
4. **Delete the zip file**

#### Backend (Upload outside public_html/)
1. **Zip the server folder**: `server.zip`
2. **Upload to cPanel File Manager** (outside public_html)
3. **Extract to a folder like `nodejs/` or `api/`**
4. **Delete the zip file**

### 3. Configure Backend

#### Install Node.js (if available in cPanel)
1. Go to **"Node.js Apps"** in cPanel
2. Create new app:
   - **Node.js version**: 18.x or higher
   - **Application root**: `/nodejs` (or your server folder)
   - **Application URL**: `your-domain.com/api`
   - **Application startup file**: `index.js`

#### Setup Environment Variables
Create `.env` file in server directory:
```env
# Database
DATABASE_URL="file:./production.db"

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Shop Information
SHOP_NAME=Opillia Shop
SHOP_PHONE=+38 (097) 324 46 68
SHOP_EMAIL=info@opillia.com.ua
SHOP_WEBSITE=https://your-domain.com

# Production Settings
PORT=3001
NODE_ENV=production
```

#### Install Dependencies
```bash
cd nodejs  # or your server folder
npm install --production
npx prisma generate
npx prisma db push
```

### 4. Configure Frontend

#### Create .htaccess for SPA Routing
Create `.htaccess` in `public_html/`:
```apache
RewriteEngine On
RewriteBase /

# Handle Angular and Vue.js routes
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 5. Update API URL

#### Option A: Environment Variable (Recommended)
Create `.env` in root and rebuild:
```env
VITE_BACKEND_URL=https://your-domain.com/api
```
Then run: `npm run build:prod`

#### Option B: Direct Edit (Quick Fix)
Edit the built files to point to your domain:
1. Find `assets/index-*.js` in `dist/assets/`
2. Replace `localhost:3001` with `your-domain.com/api`

### 6. Test the Deployment

#### Check Frontend
- Visit: `https://your-domain.com`
- Should load the shop homepage
- Check browser console for errors

#### Check Backend API
- Visit: `https://your-domain.com/api/health`
- Should return: `{"status":"OK","message":"PWA POS Backend is running"}`

#### Check Database
- Visit: `https://your-domain.com/api/branches`
- Should return JSON array of branches

## 🔧 Alternative: Static Hosting + External API

If your shared host doesn't support Node.js:

### 1. Frontend Only Deployment
- Upload `dist/` contents to `public_html/`
- Add `.htaccess` for SPA routing
- Use external API service (Heroku, Railway, etc.)

### 2. External API Options

#### Heroku (Free tier available)
```bash
# Deploy backend to Heroku
git subtree push --prefix server heroku main
```

#### Railway
```bash
# Deploy backend to Railway
railway login
railway new
railway up
```

#### Netlify Functions
Convert backend to serverless functions

## 🚨 Common Issues & Solutions

### Issue: "Cannot GET /api/..."
**Solution**: Backend not running or wrong URL
- Check Node.js app status in cPanel
- Verify API URL in frontend build
- Check server logs

### Issue: "404 on page refresh"
**Solution**: Missing .htaccess file
- Add .htaccess with SPA routing rules
- Check mod_rewrite is enabled

### Issue: "Database connection failed"
**Solution**: Database path or permissions
- Check DATABASE_URL in .env
- Ensure write permissions on database file
- Run `npx prisma db push`

### Issue: "CORS errors"
**Solution**: Backend CORS configuration
- Check CORS settings in server/index.js
- Add your domain to allowed origins

## 📞 Support

Need help with deployment?
- **Phone**: +38 (097) 324 46 68
- **Email**: info@opillia.com.ua

## 🔄 Updates

To update your deployed app:
1. Pull latest changes: `git pull`
2. Prepare for production: `npm run prepare:prod`
3. Build: `npm run build:prod`
4. Upload new `dist/` contents
5. Restart Node.js app in cPanel (if backend changed)

## ✅ Deployment Checklist

- [ ] Code prepared for production (`npm run prepare:prod`)
- [ ] Frontend built (`npm run build:prod`)
- [ ] Files uploaded to hosting
- [ ] .htaccess configured for SPA routing
- [ ] Backend environment variables set
- [ ] Database initialized
- [ ] API URL updated in frontend
- [ ] SSL certificate installed
- [ ] Domain pointing to hosting
- [ ] All functionality tested
- [ ] Email notifications working
- [ ] Error monitoring setup

Your Opillia Shop is now ready for customers! 🎉
