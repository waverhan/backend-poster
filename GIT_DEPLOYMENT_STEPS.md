# 🚀 Git Deployment Steps

Follow these exact commands to deploy your PWA POS Shop with banner functionality to GitHub and Netlify.

## ⚠️ Important: Backend Deployment Decision

You have two options for the `/server` directory:

### 🥇 **Option A: Separate Backend (Recommended)**
- Deploy frontend to Netlify
- Deploy backend to Railway/Render separately
- Full functionality including file uploads
- Better scalability and performance

### 🥈 **Option B: Frontend Only**
- Deploy only frontend to Netlify
- Backend features won't work initially
- Can add backend later

**This guide covers Option B (frontend only). For Option A, see `BACKEND_DEPLOYMENT.md`**

## 📋 Prerequisites Check

Make sure you have:
- ✅ Git installed (`git --version`)
- ✅ GitHub account
- ✅ Repository created: https://github.com/waverhan/pwa-poster-shop.git

## 🔧 Step 1: Git Setup and Push

### 1.1 Initialize Git (if needed)
```bash
git init
```

### 1.2 Add all files
```bash
git add .
```

### 1.3 Commit with descriptive message
```bash
git commit -m "feat: Add banner slider functionality with admin management

✨ New Features:
- Dynamic banner slider for homepage and shop page
- Admin panel for banner management (/admin → Banners tab)
- Image upload and management system
- Drag & drop banner reordering
- Banner status management (active/inactive)
- Responsive design with auto-sliding
- Fallback to static hero when no banners

🔧 Technical Changes:
- Added BannerSlider.vue component
- Created BannerManagement.vue and BannerEditModal.vue
- Implemented banners store with fetch API
- Added banners API routes in server
- Updated Prisma schema with Banner model
- Integrated banner functionality in HomeView and ShopView

📱 PWA Ready:
- Optimized for mobile devices
- Offline-capable
- Fast loading with proper caching"
```

### 1.4 Add remote repository
```bash
git remote add origin https://github.com/waverhan/pwa-poster-shop.git
```

### 1.5 Set main branch and push
```bash
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Netlify Deployment

### 2.1 Go to Netlify
1. Visit [netlify.com](https://netlify.com)
2. Sign in with your GitHub account

### 2.2 Create New Site
1. Click **"New site from Git"**
2. Choose **"GitHub"** as your Git provider
3. Select repository: **`waverhan/pwa-poster-shop`**

### 2.3 Configure Build Settings
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### 2.4 Set Environment Variables
Go to **Site settings → Environment variables** and add:

```env
VITE_API_BASE_URL=https://your-site-name.netlify.app/.netlify/functions
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
VITE_ADMIN_PASSWORD=your_secure_admin_password
NODE_VERSION=18
```

### 2.5 Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (usually 2-3 minutes)
3. Your site will be live at: `https://random-name-123.netlify.app`

## 🎯 Step 3: Test Deployment

### 3.1 Test Homepage
- ✅ Banner slider loads (or fallback hero)
- ✅ Responsive design works
- ✅ Navigation functions properly

### 3.2 Test Shop Page
- ✅ Banner slider appears at top
- ✅ Product catalog loads
- ✅ Categories work correctly

### 3.3 Test Admin Panel
- ✅ Go to `/admin`
- ✅ Click "Banners" tab
- ✅ Try creating a banner (may need backend setup)

## 🔧 Step 4: Custom Domain (Optional)

### 4.1 In Netlify Dashboard
1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `shop.yourdomain.com`)
4. Follow DNS configuration instructions

### 4.2 SSL Certificate
- Netlify automatically provides free SSL
- Your site will be available at `https://yourdomain.com`

## 🚨 Troubleshooting

### Build Fails?
```bash
# Test locally first
npm install
npm run build
```

### Environment Variables Not Working?
- Check spelling in Netlify dashboard
- Restart deployment after adding variables
- Verify variable names match your code

### Banner Images Not Loading?
- Backend API needs to be set up for full functionality
- Images will work once backend is deployed

## 🔐 Admin Panel Access

After deployment, access your admin panel:

1. **Go to**: `https://your-site-name.netlify.app/admin`
2. **Enter password**: Use the password you set in `VITE_ADMIN_PASSWORD`
3. **Default password**: `admin123` (change this for production!)

### Admin Features:
- 🎨 **Banner Management** - Create and manage homepage banners
- 📦 **Order Management** - View and update orders
- 🛍️ **Product Management** - Edit products and sync with Poster POS
- 🏪 **Branch Management** - Manage store locations
- ⚙️ **Site Configuration** - Update site settings

## 🎉 Success!

Your PWA POS Shop is now live with:
- ✅ Dynamic banner slider
- ✅ Admin management panel (password protected)
- ✅ Responsive design
- ✅ PWA capabilities
- ✅ Automatic deployments on Git push

## 📞 Next Steps

1. **Set up backend** for full banner functionality
2. **Add custom domain** for professional appearance
3. **Configure database** for data persistence
4. **Test on mobile devices**
5. **Add content** through admin panel

Your site URL: `https://your-site-name.netlify.app`

---

**Need help?** Check `NETLIFY_DEPLOYMENT.md` for detailed instructions!
