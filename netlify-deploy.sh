#!/bin/bash

# 🚀 Netlify Deployment Script for PWA POS Frontend
# This script prepares and deploys the frontend to Netlify

echo "🚀 Starting Netlify deployment for PWA POS Frontend..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
netlify login

# Ask for backend URL
echo "🔧 Configuration setup..."
read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " backend_url

# Create or update .env.production file
echo "📝 Creating production environment file..."
cat > .env.production << EOF
VITE_BACKEND_URL=$backend_url
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
VITE_APP_NAME=Opillia POS
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
EOF

# Build the application
echo "🔨 Building the application..."
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=dist

# Get the deployment URL
echo "🌐 Getting deployment URL..."
site_url=$(netlify status --json | jq -r '.site.url')

echo "✅ Deployment completed!"
echo "🌐 Your PWA is available at: $site_url"
echo "📋 Next steps:"
echo "   1. Test all functionality"
echo "   2. Set up custom domain (optional)"
echo "   3. Configure PWA installation"

# Test the deployment
echo "🧪 Testing deployment..."
if curl -f "$site_url" > /dev/null 2>&1; then
    echo "✅ Frontend is accessible!"
else
    echo "❌ Frontend test failed. Please check the deployment."
fi

echo "🎉 Netlify deployment script completed!"
