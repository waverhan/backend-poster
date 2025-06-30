# 🚀 Manual Deployment Commands

Since the automated scripts aren't working, here are the exact commands to run manually:

## 📦 Backend Deployment

### Step 1: Create Backend Directory
```bash
mkdir -p ../backend-posterpos-shop
cd ../backend-posterpos-shop
```

### Step 2: Copy Server Files
```bash
cp -r ../posterpos-shop/server/* .
```

### Step 3: Create Backend package.json
```bash
cat > package.json << 'EOF'
{
  "name": "backend-posterpos-shop",
  "version": "1.0.0",
  "description": "PWA POS Shop Backend API with Banner Management",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "npx prisma generate && npx prisma migrate deploy",
    "db:migrate": "npx prisma migrate deploy",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "@prisma/client": "^5.6.0",
    "prisma": "^5.6.0",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": "18.x"
  }
}
EOF
```

### Step 4: Create Railway Configuration
```bash
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
EOF
```

### Step 5: Create Environment Template
```bash
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://username:password@host:port/database
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.netlify.app
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EOF
```

### Step 6: Create Backend README
```bash
cat > README.md << 'EOF'
# 🚀 PWA POS Backend API

Backend API for PWA POS Shop with comprehensive banner management and e-commerce functionality.

## ✨ Features

- 🎨 **Banner Management** - CRUD operations with image upload
- 🛒 **Product Catalog** - Integration with Poster POS API
- 📦 **Order Processing** - Complete order management
- 🏪 **Branch Management** - Multi-location support
- 📊 **Inventory Tracking** - Real-time stock levels

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Set up environment: `cp .env.example .env`
3. Generate Prisma client: `npm run db:generate`
4. Run migrations: `npm run db:migrate`
5. Start server: `npm start`

## 🌐 Deployment

Deploy to Railway:
1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

## 🔗 Frontend Integration

Frontend Repository: https://github.com/waverhan/posterpos-shop.git
EOF
```

### Step 7: Initialize Git and Push
```bash
git init
git add .
git commit -m "Initial backend setup for PWA POS Shop

✨ Features:
- Express.js API server with CORS
- Banner management with image upload
- Product catalog integration with Poster POS
- Order processing and management
- Admin authentication support
- File upload handling
- Prisma ORM with PostgreSQL

🚀 Deployment Ready:
- Railway configuration
- Environment template
- Comprehensive API documentation
- Database schema and migrations"

git remote add origin https://github.com/waverhan/backend-posterpos-shop.git
git branch -M main
git push -u origin main
```

## 📱 Frontend Deployment

### Step 1: Return to Frontend Directory
```bash
cd ../posterpos-shop
```

### Step 2: Remove Server Directory (Frontend Only)
```bash
rm -rf server
```

### Step 3: Update package.json for Frontend
```bash
cat > package.json << 'EOF'
{
  "name": "posterpos-shop-frontend",
  "private": true,
  "version": "1.0.0",
  "description": "PWA POS Shop - Frontend with Banner Slider and Admin Protection",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@capacitor/android": "^5.5.1",
    "@capacitor/app": "^5.0.6",
    "@capacitor/core": "^5.5.1",
    "@capacitor/geolocation": "^5.0.6",
    "@capacitor/haptics": "^5.0.6",
    "@capacitor/ios": "^5.5.1",
    "@capacitor/keyboard": "^5.0.6",
    "@capacitor/splash-screen": "^5.0.6",
    "@capacitor/status-bar": "^5.0.6",
    "@capacitor/toast": "^5.0.6",
    "@headlessui/vue": "^1.7.16",
    "@heroicons/vue": "^2.0.18",
    "@vueuse/core": "^10.5.0",
    "crypto-js": "^4.2.0",
    "pinia": "^2.1.7",
    "vue": "^3.3.8",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.5.1",
    "@rushstack/eslint-patch": "^1.5.1",
    "@tsconfig/node18": "^18.2.2",
    "@types/crypto-js": "^4.2.1",
    "@types/node": "^18.18.8",
    "@vitejs/plugin-vue": "^4.4.1",
    "@vue/eslint-config-typescript": "^12.0.0",
    "@vue/tsconfig": "^0.4.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-vue": "^9.18.1",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "~5.2.0",
    "vite": "^4.5.0",
    "vite-plugin-pwa": "^0.16.7",
    "vue-tsc": "^1.8.22"
  },
  "engines": {
    "node": "18.x"
  }
}
EOF
```

### Step 4: Update Frontend README
```bash
cat > README.md << 'EOF'
# 🛒 PWA POS Shop - Frontend

Modern Progressive Web App for e-commerce with dynamic banner slider and admin protection.

## ✨ Features

- 🎨 **Dynamic Banner Slider** - Homepage and shop page banners
- 🔐 **Protected Admin Panel** - Password-protected admin access
- 🛒 **E-commerce** - Full shopping cart and checkout
- 📱 **PWA Ready** - Installable, offline-capable
- 🎯 **Location-based** - Delivery and pickup options
- 🤖 **AI-Powered** - Smart recommendations and chat
- 🌍 **Multilingual** - Ukrainian and English support

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env`
3. Start development: `npm run dev`
4. Build for production: `npm run build`

## 🔐 Admin Access

- URL: `/admin`
- Default password: `admin123`
- Change via `VITE_ADMIN_PASSWORD` environment variable

## 🌐 Deployment

Deploy to Netlify:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables

## 🔗 Backend

Backend Repository: https://github.com/waverhan/backend-posterpos-shop.git
EOF
```

### Step 5: Commit and Push Frontend
```bash
git add .
git commit -m "feat: Frontend with banner slider and admin protection

✨ New Features:
- Dynamic banner slider for homepage and shop page
- Password-protected admin panel (/admin)
- Admin authentication with session persistence
- Banner management interface
- Responsive design with mobile support

🔐 Security Features:
- Admin password protection (VITE_ADMIN_PASSWORD)
- No admin links visible to regular users
- Session management with localStorage
- Environment-based password configuration

🚀 PWA Features:
- Offline functionality
- Install prompts
- Push notifications
- Background sync

📱 Ready for Netlify deployment!"

git remote add origin https://github.com/waverhan/posterpos-shop.git
git branch -M main
git push -u origin main
```

## 🎯 Next Steps After Git Push

### 1. Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Select `waverhan/backend-posterpos-shop`
4. Add PostgreSQL service
5. Set environment variables:
   ```
   DATABASE_URL=<from-postgresql-service>
   CORS_ORIGIN=https://your-frontend.netlify.app
   ```

### 2. Deploy Frontend to Netlify
1. Go to [netlify.com](https://netlify.com)
2. "New site from Git" → GitHub
3. Select `waverhan/posterpos-shop`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
   VITE_ADMIN_PASSWORD=your_secure_password
   ```

## 🎉 Success!

Your PWA POS Shop will be live with:
- ✅ Dynamic banner slider
- ✅ Protected admin panel
- ✅ Full e-commerce functionality
- ✅ PWA capabilities
- ✅ Automatic deployments
