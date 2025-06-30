#!/bin/bash

# 🚀 PWA POS Shop - Backend Separation Script
# This script helps you create a separate backend repository

echo "🚀 PWA POS Shop - Backend Separation"
echo "===================================="

# Create backend directory
echo "📁 Creating backend directory..."
mkdir -p ../pwa-pos-backend
cd ../pwa-pos-backend

# Copy server files
echo "📦 Copying server files..."
cp -r ../pwa-poster-shop/server/* .

# Create backend-specific package.json
echo "📄 Creating backend package.json..."
cat > package.json << 'EOF'
{
  "name": "pwa-pos-backend",
  "version": "1.0.0",
  "description": "PWA POS Shop Backend API with banner management",
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
    "prisma": "^5.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": "18.x"
  }
}
EOF

# Create Railway configuration
echo "🚂 Creating Railway configuration..."
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

# Create .env.example
echo "🔐 Creating environment template..."
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend.netlify.app

# Optional: Email service
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EOF

# Create README for backend
echo "📖 Creating backend README..."
cat > README.md << 'EOF'
# PWA POS Backend API

Backend API for PWA POS Shop with banner management functionality.

## Features

- 🛒 Product catalog API
- 🎨 Banner management with image upload
- 📦 Order processing
- 🏪 Branch management
- 📊 Inventory tracking

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

### 3. Database Setup
```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

## API Endpoints

### Banners
- `GET /api/banners` - Get active banners
- `GET /api/banners/admin` - Get all banners (admin)
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `PUT /api/banners/reorder` - Reorder banners

### Products
- `GET /api/products` - Get products
- `GET /api/products/:id` - Get product by ID

### Categories
- `GET /api/categories` - Get categories

### Branches
- `GET /api/branches` - Get branches

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders

## Deployment

### Railway (Recommended)
1. Push to GitHub
2. Connect to Railway
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### Environment Variables
```
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.netlify.app
```

## Database Schema

Uses Prisma ORM with PostgreSQL:
- Products
- Categories
- Branches
- Orders
- Banners (new)
- Customers
- Inventory

## File Uploads

Banner images are stored in `/public/images/banners/` directory.
EOF

# Initialize git
echo "🔧 Initializing Git..."
git init
git add .
git commit -m "Initial backend setup with banner functionality

✨ Features:
- Express.js API server
- Banner management with image upload
- Product catalog integration
- Order processing
- Prisma database schema
- File upload handling with multer

🚀 Ready for deployment to Railway/Render/Heroku"

echo ""
echo "✅ Backend separation complete!"
echo ""
echo "📁 Backend created in: ../pwa-pos-backend"
echo ""
echo "🔗 Next steps:"
echo "1. cd ../pwa-pos-backend"
echo "2. Create GitHub repository: pwa-pos-backend"
echo "3. git remote add origin https://github.com/waverhan/pwa-pos-backend.git"
echo "4. git push -u origin main"
echo "5. Deploy to Railway/Render"
echo ""
echo "📖 See BACKEND_DEPLOYMENT.md for detailed instructions"
EOF

# Make script executable
chmod +x separate-backend.sh
