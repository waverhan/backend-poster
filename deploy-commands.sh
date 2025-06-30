#!/bin/bash

# 🚀 PWA POS Shop - Deployment Commands
# Run these commands to deploy your project to GitHub and Netlify

echo "🚀 PWA POS Shop - Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add all files
echo "📦 Adding all files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Add banner slider functionality with admin management

- Added BannerSlider component for homepage and shop page
- Created admin panel for banner management
- Implemented image upload functionality
- Added banner reordering and status management
- Updated stores and API routes for banner functionality"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/waverhan/pwa-poster-shop.git
fi

# Set main branch and push
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 Next Steps for Netlify Deployment:"
echo "1. Go to https://netlify.com"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub and select 'waverhan/pwa-poster-shop'"
echo "4. Set build command: npm run build"
echo "5. Set publish directory: dist"
echo "6. Add environment variables:"
echo "   - VITE_API_BASE_URL=https://your-site-name.netlify.app/.netlify/functions"
echo "   - VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344"
echo "7. Deploy!"
echo ""
echo "📖 For detailed instructions, see NETLIFY_DEPLOYMENT.md"
