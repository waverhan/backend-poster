#!/bin/bash

# 🚀 Railway Deployment Script for PWA POS Backend
# This script prepares and deploys the backend to Railway.app

echo "🚀 Starting Railway deployment for PWA POS Backend..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create a new Railway project (if not exists)
echo "📦 Setting up Railway project..."
railway link

# Set environment variables
echo "🔧 Setting up environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Ask user for database URL
echo "🗄️  Please enter your PlanetScale database URL:"
read -p "DATABASE_URL: " database_url
railway variables set DATABASE_URL="$database_url"

# Set Poster API token
railway variables set POSTER_API_TOKEN="218047:05891220e474bad7f26b6eaa0be3f344"

# Ask for email configuration
echo "📧 Email configuration:"
read -p "EMAIL_HOST (default: smtp.gmail.com): " email_host
email_host=${email_host:-smtp.gmail.com}
railway variables set EMAIL_HOST="$email_host"

read -p "EMAIL_PORT (default: 587): " email_port
email_port=${email_port:-587}
railway variables set EMAIL_PORT="$email_port"

read -p "EMAIL_USER: " email_user
railway variables set EMAIL_USER="$email_user"

read -p "EMAIL_PASS: " email_pass
railway variables set EMAIL_PASS="$email_pass"

# Create railway.json configuration
echo "📝 Creating Railway configuration..."
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run db:generate"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create Dockerfile for better control (optional)
echo "🐳 Creating optimized Dockerfile..."
cat > Dockerfile << EOF
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
EOF

# Create .dockerignore
echo "📋 Creating .dockerignore..."
cat > .dockerignore << EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.coverage/
.vscode
.DS_Store
*.log
EOF

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "🌐 Getting deployment URL..."
deployment_url=$(railway status --json | jq -r '.deployments[0].url')

echo "✅ Deployment completed!"
echo "🌐 Your backend is available at: $deployment_url"
echo "📋 Next steps:"
echo "   1. Update your frontend VITE_BACKEND_URL to: $deployment_url"
echo "   2. Test the API endpoints"
echo "   3. Deploy your frontend to Netlify"

# Test the deployment
echo "🧪 Testing deployment..."
if curl -f "$deployment_url/api/health" > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Please check the logs:"
    echo "   railway logs"
fi

echo "🎉 Railway deployment script completed!"
