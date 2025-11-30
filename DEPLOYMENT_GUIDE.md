# 🚀 Deployment Guide - PWA POS Shop

## ⚠️ CRITICAL DEPLOYMENT DIRECTIVES

### Directory Structure
```
pwa-pos/
├── src/                    # Frontend Vue 3 code
├── server/                 # Backend Express.js code ⚠️ DEPLOY THIS
├── public/                 # Static assets
├── dist/                   # Built frontend (generated)
├── package.json            # Frontend dependencies
├── vite.config.ts          # Frontend build config
└── netlify.toml            # Netlify config
```

---

## Frontend Deployment (Netlify)

### Build & Deploy
```bash
cd /Users/erhan/Documents/augment-projects/pwa-pos
npm run build
netlify deploy --prod --dir=dist
```

### What Gets Deployed
- Built Vue 3 app from `/dist` folder
- Service worker for PWA functionality
- All static assets and images

### Live URL
- **Production:** https://opillia.com.ua
- **Staging:** https://posterpos.netlify.app

---

## Backend Deployment (Railway) - ⚠️ IMPORTANT

### Deploy from /server Directory ONLY
```bash
cd /Users/erhan/Documents/augment-projects/pwa-pos/server
railway up
```

### ⚠️ DO NOT DO THIS
```bash
# ❌ WRONG - This deploys from root directory
cd /Users/erhan/Documents/augment-projects/pwa-pos
railway up
```

### What Gets Deployed
- Express.js backend from `/server` folder
- Prisma ORM and database migrations
- All API routes and services
- Environment variables from Railway dashboard

### Live URL
- **Backend API:** https://backend-api-production-b3a0.up.railway.app

---

## Database Migrations

### Apply Migrations
```bash
cd /Users/erhan/Documents/augment-projects/pwa-pos/server
npx prisma migrate deploy
```

### Create New Migration
```bash
cd /Users/erhan/Documents/augment-projects/pwa-pos/server
npx prisma migrate dev --name migration_name
```

---

## Complete Deployment Checklist

- [ ] Frontend: `npm run build` in root directory
- [ ] Frontend: `netlify deploy --prod --dir=dist`
- [ ] Backend: `cd server && railway up`
- [ ] Verify: https://opillia.com.ua loads without errors
- [ ] Verify: Backend API responds at https://backend-api-production-b3a0.up.railway.app/health

---

## Troubleshooting

### Backend Not Deploying
1. Ensure you're in `/server` directory
2. Check Railway logs: `railway logs`
3. Verify `server/railway.toml` exists

### Database Migration Errors
1. Check Prisma schema: `server/prisma/schema.prisma`
2. Review migration files: `server/prisma/migrations/`
3. Run: `npx prisma db push` to sync schema

### Frontend Not Loading
1. Check Netlify build logs
2. Verify `dist/` folder exists
3. Clear browser cache and reload

