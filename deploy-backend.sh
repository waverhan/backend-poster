#!/bin/bash

# 🚀 PWA POS Shop - Backend Deployment Script
# Deploy to: https://github.com/waverhan/backend-posterpos-shop.git

echo "🚀 PWA POS Shop - Backend Deployment"
echo "===================================="

# Create backend directory
echo "📁 Creating backend directory..."
mkdir -p ../backend-posterpos-shop
cd ../backend-posterpos-shop

# Copy server files
echo "📦 Copying server files..."
if [ -d "../posterpos-shop/server" ]; then
    cp -r ../posterpos-shop/server/* .
    echo "✅ Server files copied"
else
    echo "❌ Error: Server directory not found. Please run from the main project directory."
    exit 1
fi

# Create backend-specific package.json
echo "📄 Creating backend package.json..."
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
    "db:studio": "npx prisma studio",
    "db:seed": "node scripts/add-banners-table.js"
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

# Create Render configuration
echo "🎨 Creating Render configuration..."
cat > render.yaml << 'EOF'
services:
  - type: web
    name: posterpos-backend
    env: node
    plan: free
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: DATABASE_URL
        fromDatabase:
          name: posterpos-db
          property: connectionString

databases:
  - name: posterpos-db
    plan: free
EOF

# Create .env.example
echo "🔐 Creating environment template..."
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend.netlify.app

# Optional: Email Service
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Optional: File Upload Limits
MAX_FILE_SIZE=5242880
UPLOAD_PATH=public/images
EOF

# Create .gitignore for backend
echo "📝 Creating backend .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
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

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads (keep directory structure)
public/images/products/*
public/images/banners/*
!public/images/products/.gitkeep
!public/images/banners/.gitkeep

# Prisma
prisma/dev.db*
EOF

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p public/images/banners
mkdir -p public/images/products
touch public/images/banners/.gitkeep
touch public/images/products/.gitkeep

# Create comprehensive README for backend
echo "📖 Creating backend README..."
cat > README.md << 'EOF'
# 🚀 PWA POS Backend API

Backend API for PWA POS Shop with comprehensive banner management and e-commerce functionality.

## ✨ Features

- 🎨 **Banner Management** - CRUD operations with image upload
- 🛒 **Product Catalog** - Integration with Poster POS API
- 📦 **Order Processing** - Complete order management
- 🏪 **Branch Management** - Multi-location support
- 📊 **Inventory Tracking** - Real-time stock levels
- 📧 **Email Services** - Order confirmations and notifications
- 🔐 **Security** - CORS, validation, and error handling

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

## 📡 API Endpoints

### 🎨 Banner Management
- `GET /api/banners` - Get active banners
- `GET /api/banners/admin` - Get all banners (admin)
- `POST /api/banners` - Create banner (with image upload)
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `PUT /api/banners/reorder` - Reorder banners

### 🛍️ Products
- `GET /api/products` - Get products with inventory
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product

### 📂 Categories
- `GET /api/categories` - Get all categories

### 🏪 Branches
- `GET /api/branches` - Get all branches
- `PUT /api/branches/:id` - Update branch

### 📦 Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders (admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### 🔄 Sync
- `POST /api/sync/full` - Full sync with Poster POS
- `POST /api/sync/inventory` - Sync inventory only
- `POST /api/sync/images` - Download product images

### 📤 File Upload
- `POST /api/upload` - Upload files (images)

## 🌐 Deployment Options

### 🚂 Railway (Recommended)
1. **Create Account**: [railway.app](https://railway.app)
2. **New Project**: Deploy from GitHub
3. **Add Database**: PostgreSQL service
4. **Environment Variables**: Set required vars
5. **Deploy**: Automatic deployment

### 🎨 Render
1. **Create Account**: [render.com](https://render.com)
2. **New Web Service**: Connect GitHub
3. **Add Database**: PostgreSQL
4. **Environment Variables**: Configure
5. **Deploy**: Automatic builds

### 🔧 Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔐 Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.netlify.app
```

### Optional
```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=public/images
```

## 🗄️ Database Schema

### Core Tables
- **banners** - Homepage/shop banners
- **products** - Product catalog
- **categories** - Product categories
- **branches** - Store locations
- **orders** - Customer orders
- **customers** - Customer data
- **product_inventory** - Stock levels

### Banner Schema
```sql
CREATE TABLE banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 File Structure

```
backend-posterpos-shop/
├── routes/              # API route handlers
│   ├── banners.js      # Banner management
│   ├── products.js     # Product operations
│   ├── orders.js       # Order processing
│   └── upload.js       # File uploads
├── services/           # Business logic
│   ├── database.js     # Database utilities
│   ├── emailService.js # Email handling
│   └── imageService.js # Image processing
├── prisma/             # Database schema
│   ├── schema.prisma   # Prisma schema
│   └── migrations/     # Database migrations
├── public/             # Static files
│   └── images/         # Uploaded images
├── scripts/            # Utility scripts
└── index.js           # Main server file
```

## 🧪 Testing

### Health Check
```bash
curl https://your-backend.railway.app/health
```

### API Testing
```bash
# Get banners
curl https://your-backend.railway.app/api/banners

# Get products
curl https://your-backend.railway.app/api/products

# Test CORS
curl -H "Origin: https://your-frontend.netlify.app" \
     https://your-backend.railway.app/api/banners
```

## 🔗 Frontend Integration

This backend is designed to work with:
- **Frontend Repository**: https://github.com/waverhan/posterpos-shop.git
- **Frontend URL**: https://your-frontend.netlify.app

### Frontend Environment Variables
```env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

## 📞 Support

- **Backend Repository**: https://github.com/waverhan/backend-posterpos-shop.git
- **Frontend Repository**: https://github.com/waverhan/posterpos-shop.git
- **Issues**: GitHub Issues for bug reports
- **Documentation**: See deployment guides in frontend repo

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] CORS origins set correctly
- [ ] File upload directories created
- [ ] Health check endpoint responding
- [ ] SSL certificate configured
- [ ] Error logging enabled
- [ ] Backup strategy implemented

Ready to power your PWA POS Shop! 🚀
EOF

# Initialize git
echo "🔧 Initializing Git..."
git init
git add .
git commit -m "Initial backend setup for PWA POS Shop

✨ Features:
- Express.js API server with CORS
- Banner management with image upload (multer)
- Product catalog integration with Poster POS
- Order processing and management
- Branch and inventory management
- Email service integration
- File upload handling
- Prisma ORM with PostgreSQL

🚀 Deployment Ready:
- Railway configuration (railway.json)
- Render configuration (render.yaml)
- Environment template (.env.example)
- Comprehensive API documentation
- Database schema and migrations

🔗 Integration:
- Designed for frontend: https://github.com/waverhan/posterpos-shop.git
- CORS configured for Netlify deployment
- RESTful API endpoints
- Error handling and validation"

# Set up remote repository
echo "🔗 Setting up remote repository..."
git remote add origin https://github.com/waverhan/backend-posterpos-shop.git
git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Backend deployment preparation complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://railway.app (recommended) or https://render.com"
echo "2. Create new project from GitHub"
echo "3. Select 'waverhan/backend-posterpos-shop'"
echo "4. Add PostgreSQL database service"
echo "5. Set environment variables:"
echo "   DATABASE_URL=<from-database-service>"
echo "   CORS_ORIGIN=https://your-frontend.netlify.app"
echo "6. Deploy!"
echo ""
echo "📖 Your backend will be live at: https://your-backend.railway.app"
echo ""
echo "🔄 Don't forget to update frontend environment variables:"
echo "   VITE_API_BASE_URL=https://your-backend.railway.app"
