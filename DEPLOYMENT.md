# 🚀 Deployment Guide - PWA POS Shop

Complete guide for deploying the AI-powered e-commerce platform to various hosting providers.

## 🌐 Netlify Deployment (Recommended)

### Why Netlify?
- ✅ **Free tier available** with generous limits
- ✅ **Automatic deployments** from Git
- ✅ **Built-in CDN** for global performance
- ✅ **Environment variables** management
- ✅ **Custom domains** and SSL certificates
- ✅ **Preview deployments** for testing

### Step-by-Step Netlify Deployment

#### 1. Prepare Your Repository
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: PWA POS Shop with AI features"

# Add remote repository (replace with your GitHub repo)
git remote add origin https://github.com/yourusername/pwa-pos.git

# Push to GitHub
git push -u origin main
```

#### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"New site from Git"**
3. Choose **GitHub** as your Git provider
4. Select your **pwa-pos** repository
5. Configure build settings:
   ```
   Branch to deploy: main
   Build command: npm run build
   Publish directory: dist
   ```

#### 3. Environment Variables
In Netlify dashboard, go to **Site settings > Environment variables** and add:

```env
# Required - Backend API (update when backend is ready)
VITE_BACKEND_URL=https://your-backend-api.netlify.app

# Optional - AI Features (for full functionality)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional - Messaging (when backend ready)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_VIBER_BOT_TOKEN=your_viber_bot_token

# Poster POS Integration (already configured)
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

#### 4. Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (2-3 minutes)
3. Your site will be available at `https://random-name.netlify.app`

#### 5. Custom Domain (Optional)
1. Go to **Site settings > Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `shop.yourdomain.com`)
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

### Netlify Configuration File
Create `netlify.toml` in project root for advanced configuration:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

## 🔧 Alternative Hosting Options

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_OPENAI_API_KEY
```

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
npm run build
firebase deploy
```

### AWS S3 + CloudFront
```bash
# Install AWS CLI
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔒 Security Configuration

### Environment Variables Security
```bash
# Never commit these files
echo ".env*" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore

# Use different keys for different environments
# Development: .env.development
# Production: .env.production
```

### Content Security Policy
Add to `index.html` for enhanced security:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://api.openai.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com https://api.telegram.org;
  font-src 'self';
">
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Enable gzip compression in build
npm install --save-dev vite-plugin-compression
```

### CDN Configuration
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ai: ['@/services/aiChatService'],
          ui: ['@/components']
        }
      }
    }
  }
})
```

## 🧪 Testing Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Build completes without errors
- [ ] AI chat responds to commands
- [ ] Product recommendations work
- [ ] Mobile responsiveness verified
- [ ] PWA features functional
- [ ] Performance score > 90

### Post-deployment Testing
```bash
# Test production build locally
npm run build
npm run preview

# Test specific features
curl https://your-site.netlify.app/api/health
```

### Monitoring
1. **Netlify Analytics** - Built-in traffic analytics
2. **Google Analytics** - User behavior tracking
3. **Sentry** - Error monitoring
4. **Lighthouse** - Performance monitoring

## 🔄 Continuous Deployment

### Automatic Deployments
Netlify automatically deploys when you push to main branch:
```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Netlify automatically builds and deploys
```

### Preview Deployments
Create pull requests to test changes:
```bash
# Create feature branch
git checkout -b feature/new-chat-command

# Make changes and push
git push origin feature/new-chat-command

# Create PR - Netlify creates preview deployment
```

### Deploy Hooks
Trigger deployments from external services:
```bash
# Get deploy hook URL from Netlify dashboard
curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Working
```bash
# Ensure variables start with VITE_
VITE_API_KEY=your_key  # ✅ Correct
API_KEY=your_key       # ❌ Won't work in Vite
```

#### Chat Not Responding
1. Check browser console for errors
2. Verify OpenAI API key is set
3. Test with local commands first
4. Check network requests in DevTools

#### Mobile Issues
1. Test on actual devices
2. Check PWA manifest
3. Verify service worker registration
4. Test offline functionality

### Debug Commands
```bash
# Check build output
npm run build 2>&1 | tee build.log

# Test production build locally
npm run preview

# Check bundle size
npx vite-bundle-analyzer dist
```

## 📈 Scaling Considerations

### Performance
- Enable CDN caching
- Optimize images
- Implement lazy loading
- Use service workers

### Monitoring
- Set up error tracking
- Monitor Core Web Vitals
- Track conversion metrics
- Monitor API usage

### Backup Strategy
- Regular database backups
- Environment variable backups
- Code repository mirrors
- Asset backups

## 🎯 Production Checklist

### Before Going Live
- [ ] All features tested
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics tracking setup
- [ ] Error monitoring active
- [ ] Performance optimized
- [ ] SEO metadata complete

### Launch Day
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all integrations
- [ ] Test user flows
- [ ] Monitor server resources
- [ ] Prepare rollback plan

### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor conversion rates
- [ ] Optimize based on analytics
- [ ] Plan feature updates
- [ ] Scale infrastructure as needed

---

**Ready to deploy? Start with Netlify for the easiest setup!** 🚀

Your PWA POS Shop will be live and serving customers with AI-powered features in minutes!
