#!/bin/bash

# 🚀 PWA POS Shop - Complete Deployment Script
# Deploys both frontend and backend to separate repositories

echo "🚀 PWA POS Shop - Complete Deployment"
echo "====================================="
echo ""
echo "This script will deploy:"
echo "📱 Frontend → https://github.com/waverhan/posterpos-shop.git"
echo "🔧 Backend  → https://github.com/waverhan/backend-posterpos-shop.git"
echo ""

# Confirm before proceeding
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting deployment process..."
echo ""

# Step 1: Deploy Backend
echo "📦 Step 1: Deploying Backend"
echo "=============================="
chmod +x deploy-backend.sh
./deploy-backend.sh

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed!"
    exit 1
fi

echo ""
echo "✅ Backend deployment completed!"
echo ""

# Step 2: Deploy Frontend
echo "📱 Step 2: Deploying Frontend"
echo "=============================="
chmod +x deploy-frontend.sh
./deploy-frontend.sh

if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment failed!"
    exit 1
fi

echo ""
echo "✅ Frontend deployment completed!"
echo ""

# Final instructions
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📊 Deployment Summary:"
echo "├── 🔧 Backend Repository: https://github.com/waverhan/backend-posterpos-shop.git"
echo "├── 📱 Frontend Repository: https://github.com/waverhan/posterpos-shop.git"
echo "└── 📁 Backend Files: ../backend-posterpos-shop/"
echo ""
echo "🌐 Next Steps:"
echo ""
echo "1️⃣  Deploy Backend to Railway/Render:"
echo "   • Go to https://railway.app or https://render.com"
echo "   • Create new project from GitHub"
echo "   • Select 'waverhan/backend-posterpos-shop'"
echo "   • Add PostgreSQL database"
echo "   • Set environment variables"
echo "   • Deploy!"
echo ""
echo "2️⃣  Deploy Frontend to Netlify:"
echo "   • Go to https://netlify.com"
echo "   • Create new site from Git"
echo "   • Select 'waverhan/posterpos-shop'"
echo "   • Build command: npm run build"
echo "   • Publish directory: dist"
echo "   • Add environment variables:"
echo "     VITE_API_BASE_URL=https://your-backend.railway.app"
echo "     VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344"
echo "   • Deploy!"
echo ""
echo "3️⃣  Test Your Deployment:"
echo "   • Visit your Netlify URL"
echo "   • Check banner slider on homepage and /shop"
echo "   • Test admin panel at /admin → Banners tab"
echo "   • Verify API connectivity"
echo ""
echo "📖 Detailed Instructions:"
echo "   • Backend: See README.md in ../backend-posterpos-shop/"
echo "   • Frontend: See NETLIFY_DEPLOYMENT.md"
echo ""
echo "🎯 Your PWA POS Shop will be live at:"
echo "   Frontend: https://your-site-name.netlify.app"
echo "   Backend:  https://your-backend.railway.app"
echo ""
echo "🚀 Happy deploying!"
