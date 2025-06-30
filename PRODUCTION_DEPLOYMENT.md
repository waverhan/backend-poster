# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Security Checklist

### ✅ Security Issues Fixed
- [x] **Console logs removed** - Build process automatically removes console.log statements
- [x] **API keys secured** - All sensitive keys moved to environment variables
- [x] **Debug code removed** - No debug routes or test endpoints in production
- [x] **Error handling** - Proper error boundaries and user-friendly messages
- [x] **Input validation** - All user inputs are validated and sanitized

### ⚠️ Environment Variables to Configure

**Frontend (.env):**
```env
# Required - Update with your production backend URL
VITE_BACKEND_URL=https://your-domain.com/api

# Optional - AI Features
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional - Messaging
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_VIBER_BOT_TOKEN=your_viber_bot_token

# Poster POS Integration (already configured)
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

**Backend (server/.env):**
```env
# Database - Update for production
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

# Messaging Bots
VIBER_BOT_TOKEN=your-viber-bot-token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Production Settings
PORT=3001
NODE_ENV=production
```

## 🌐 Shared Hosting Deployment

### Option 1: cPanel Shared Hosting

#### Step 1: Prepare Files
```bash
# Build the frontend
npm run build

# The dist/ folder contains all frontend files
# The server/ folder contains backend files
```

#### Step 2: Upload Files
1. **Frontend**: Upload contents of `dist/` folder to `public_html/`
2. **Backend**: Upload `server/` folder to a directory outside `public_html/` (e.g., `nodejs/`)

#### Step 3: Configure Backend
1. **Install Node.js** in cPanel (if available)
2. **Create .env file** in server directory with production values
3. **Install dependencies**:
   ```bash
   cd server
   npm install --production
   ```
4. **Setup database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

#### Step 4: Configure Frontend
1. **Update API URL** in production build
2. **Setup .htaccess** for SPA routing:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### Option 2: VPS/Dedicated Server

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/waverhan/posterpos-shop.git
cd posterpos-shop

# Install dependencies
npm install

# Build frontend
npm run build

# Setup backend
cd server
npm install --production
cp .env.example .env
# Edit .env with production values

# Generate database
npx prisma generate
npx prisma db push
```

#### Step 3: Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'opillia-backend',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/opillia << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /path/to/posterpos-shop/dist;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/opillia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Security Hardening

### 1. Environment Variables
- ✅ All sensitive data in environment variables
- ✅ No hardcoded API keys in code
- ✅ Production database credentials secured

### 2. HTTPS Configuration
```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Security Headers
```nginx
# Add to Nginx server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 4. Rate Limiting
```bash
# Install rate limiting for API
npm install express-rate-limit
```

## 📊 Monitoring & Maintenance

### 1. Log Management
```bash
# PM2 logs
pm2 logs opillia-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Database Backup
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp server/prisma/production.db backups/db_backup_$DATE.db
# Keep only last 7 days
find backups/ -name "db_backup_*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backup
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 3. Health Monitoring
```bash
# Check application status
pm2 status
curl https://your-domain.com/health
```

## 🚀 Go Live Checklist

- [ ] Domain configured and pointing to server
- [ ] SSL certificate installed and working
- [ ] Environment variables set for production
- [ ] Database migrated and populated
- [ ] Backend API running and accessible
- [ ] Frontend built and deployed
- [ ] Email notifications working
- [ ] Payment system configured (if applicable)
- [ ] Monitoring and logging setup
- [ ] Backup system in place
- [ ] Security headers configured
- [ ] Rate limiting enabled

## 📞 Support

For deployment assistance:
- **Phone**: +38 (097) 324 46 68
- **Email**: info@opillia.com.ua
- **Documentation**: Check README.md and docs/ folder

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull origin main

# Rebuild frontend
npm run build

# Restart backend
pm2 restart opillia-backend

# Reload Nginx
sudo systemctl reload nginx
```
