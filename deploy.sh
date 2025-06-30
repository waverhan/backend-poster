#!/bin/bash

# 🚀 Opillia Shop Production Deployment Script
# This script prepares and builds the application for production deployment

echo "🚀 Starting Opillia Shop production deployment preparation..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are installed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Found package.json - in correct directory"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check for environment file
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating template..."
    cat > .env << EOF
# Production Environment Configuration
# Update these values for your production environment

# Required - Backend API URL (UPDATE THIS)
VITE_BACKEND_URL=https://your-domain.com/api

# Optional - AI Features
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional - Messaging
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_VIBER_BOT_TOKEN=your_viber_bot_token

# Poster POS Integration (pre-configured)
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
EOF
    print_warning "Created .env template. Please update VITE_BACKEND_URL with your domain!"
else
    print_status "Environment file exists"
fi

# Check if backend URL is configured
if grep -q "your-domain.com" .env; then
    print_warning "Please update VITE_BACKEND_URL in .env with your actual domain before deploying!"
fi

# Clean previous build
if [ -d "dist" ]; then
    print_info "Cleaning previous build..."
    rm -rf dist
    print_status "Previous build cleaned"
fi

# Build the application
print_info "Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please check the errors above."
    exit 1
fi

print_status "Application built successfully!"

# Check if dist directory was created
if [ ! -d "dist" ]; then
    print_error "Build completed but dist directory not found!"
    exit 1
fi

# Create deployment package
print_info "Creating deployment package..."

# Create deployment directory
mkdir -p deployment
rm -rf deployment/*

# Copy frontend files
cp -r dist deployment/frontend
print_status "Frontend files copied to deployment/frontend"

# Copy backend files
cp -r server deployment/backend
print_status "Backend files copied to deployment/backend"

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.txt << EOF
🚀 OPILLIA SHOP DEPLOYMENT INSTRUCTIONS

📁 FOLDER STRUCTURE:
- frontend/ - Upload contents to public_html/ (or web root)
- backend/  - Upload to server directory (outside public_html)

📋 DEPLOYMENT STEPS:

1. FRONTEND DEPLOYMENT:
   - Upload all files from frontend/ to your web root (public_html/)
   - Create .htaccess file for SPA routing (see below)

2. BACKEND DEPLOYMENT:
   - Upload backend/ folder to your server (outside web root)
   - Install dependencies: npm install --production
   - Create .env file with production settings
   - Initialize database: npx prisma generate && npx prisma db push
   - Start the server (or configure with cPanel Node.js)

3. .HTACCESS FILE (create in web root):
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"

4. BACKEND .ENV FILE:
DATABASE_URL="file:./production.db"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SHOP_NAME=Opillia Shop
SHOP_PHONE=+38 (097) 324 46 68
SHOP_EMAIL=info@opillia.com.ua
SHOP_WEBSITE=https://your-domain.com
PORT=3001
NODE_ENV=production

📞 SUPPORT:
Phone: +38 (097) 324 46 68
Email: info@opillia.com.ua

🔗 TESTING:
- Frontend: https://your-domain.com
- Backend Health: https://your-domain.com/api/health
- API Test: https://your-domain.com/api/branches

✅ Your Opillia Shop is ready for production!
EOF

print_status "Deployment instructions created"

# Create .htaccess template
cat > deployment/frontend/.htaccess << EOF
RewriteEngine On
RewriteBase /

# Handle SPA routing
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
EOF

print_status ".htaccess file created"

# Create backend .env template
cat > deployment/backend/.env.example << EOF
# Production Environment Configuration
# Copy this file to .env and update with your production values

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

# Messaging Bots (optional)
VIBER_BOT_TOKEN=your-viber-bot-token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Production Settings
PORT=3001
NODE_ENV=production
EOF

print_status "Backend environment template created"

# Create ZIP file for easy upload
if command -v zip &> /dev/null; then
    print_info "Creating ZIP file for easy upload..."
    cd deployment
    zip -r ../opillia-shop-deployment.zip .
    cd ..
    print_status "Created opillia-shop-deployment.zip"
else
    print_warning "zip command not found. You can manually compress the deployment folder."
fi

# Final summary
echo ""
echo "🎉 DEPLOYMENT PREPARATION COMPLETE!"
echo ""
print_status "Frontend built and ready in deployment/frontend/"
print_status "Backend files ready in deployment/backend/"
print_status "Deployment instructions created"
print_status "Security headers configured"
print_status "Environment templates created"

if [ -f "opillia-shop-deployment.zip" ]; then
    print_status "ZIP file created: opillia-shop-deployment.zip"
fi

echo ""
print_info "NEXT STEPS:"
echo "1. Update VITE_BACKEND_URL in .env with your domain"
echo "2. Rebuild if you changed the backend URL: npm run build"
echo "3. Upload deployment/frontend/ to your web root"
echo "4. Upload deployment/backend/ to your server"
echo "5. Configure backend environment and database"
echo "6. Test your deployment"
echo ""
print_info "See deployment/DEPLOYMENT_INSTRUCTIONS.txt for detailed steps"
echo ""
print_status "Your Opillia Shop is ready for production deployment! 🚀"
