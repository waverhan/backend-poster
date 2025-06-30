#!/bin/bash

# 🚀 PWA POS Shop - Frontend Deployment Script
# Deploy to: https://github.com/waverhan/posterpos-shop.git

echo "🚀 PWA POS Shop - Frontend Deployment"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Remove server directory from frontend repo
echo "🧹 Cleaning up - removing server directory for frontend-only deployment..."
if [ -d "server" ]; then
    rm -rf server
    echo "✅ Removed server directory"
fi

# Create .gitignore for frontend
echo "📝 Creating frontend .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# Capacitor
ios/
android/
EOF

# Update package.json to remove server-related scripts
echo "📦 Updating package.json for frontend-only deployment..."
cat > package.json << 'EOF'
{
  "name": "posterpos-shop-frontend",
  "private": true,
  "version": "1.0.0",
  "description": "PWA POS Shop - Frontend with Banner Slider",
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

# Create frontend-specific README
echo "📖 Creating frontend README..."
cat > README.md << 'EOF'
# 🛒 PWA POS Shop - Frontend

Modern Progressive Web App for e-commerce with dynamic banner slider functionality.

## ✨ Features

- 🎨 **Dynamic Banner Slider** - Homepage and shop page banners
- 🛒 **E-commerce** - Full shopping cart and checkout
- 📱 **PWA Ready** - Installable, offline-capable
- 🎯 **Location-based** - Delivery and pickup options
- 🤖 **AI-Powered** - Smart recommendations and chat
- 🌍 **Multilingual** - Ukrainian and English support
- 🎨 **Modern UI** - Responsive design with dark/light mode

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

### 3. Start Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🌐 Deployment

### Netlify (Recommended)
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Environment Variables
```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

## 🔗 Backend

This frontend connects to a separate backend API:
- Repository: https://github.com/waverhan/backend-posterpos-shop.git
- Handles banner management, file uploads, and data persistence

## 📱 PWA Features

- Offline functionality
- Install prompts
- Push notifications
- Background sync

## 🎯 Banner Slider

- Auto-sliding banners every 5 seconds
- Manual navigation with dots and arrows
- Responsive design for all devices
- Admin management through backend API

Visit `/admin` → "Banners" tab to manage banners (requires backend).

## 📞 Support

- Frontend Repository: https://github.com/waverhan/posterpos-shop.git
- Backend Repository: https://github.com/waverhan/backend-posterpos-shop.git
EOF

# Add all files
echo "📦 Adding all files to Git..."
git add .

# Commit changes
echo "💾 Committing frontend changes..."
git commit -m "feat: Frontend-only setup with banner slider functionality

✨ Features:
- Dynamic banner slider for homepage and shop page
- PWA capabilities with offline support
- Modern Vue 3 + TypeScript architecture
- Responsive design with Tailwind CSS
- Integration ready for backend API

🔧 Setup:
- Removed server directory (deployed separately)
- Updated package.json for frontend-only deployment
- Added Netlify-optimized configuration
- Environment variables for backend connection

🚀 Ready for Netlify deployment!"

# Check if remote exists and add/update it
echo "🔗 Setting up remote repository..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "📝 Updating existing remote..."
    git remote set-url origin https://github.com/waverhan/posterpos-shop.git
else
    echo "➕ Adding remote repository..."
    git remote add origin https://github.com/waverhan/posterpos-shop.git
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Frontend deployment preparation complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub → 'waverhan/posterpos-shop'"
echo "4. Build command: npm run build"
echo "5. Publish directory: dist"
echo "6. Add environment variables:"
echo "   VITE_API_BASE_URL=https://your-backend.railway.app"
echo "   VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344"
echo "7. Deploy!"
echo ""
echo "📖 Your frontend will be live at: https://your-site-name.netlify.app"
