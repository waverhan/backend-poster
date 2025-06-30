# 🔐 Admin Panel Access Guide

The admin panel is protected with password authentication to prevent unauthorized access.

## 🚀 Accessing the Admin Panel

### Step 1: Navigate to Admin URL
Go directly to: `https://your-site.com/admin`

### Step 2: Enter Admin Password
- **Default Password**: `admin123`
- Enter the password in the login modal that appears
- Click "Sign In"

### Step 3: Access Admin Features
Once authenticated, you'll have access to:
- 📊 **Overview** - Data sync and statistics
- 📦 **Orders** - Order management
- 🛍️ **Products** - Product catalog management
- 📂 **Categories** - Category management
- 🏪 **Branches** - Store locations
- 🎨 **Banners** - Homepage banner management
- 🤖 **AI Analytics** - Recommendation analytics

## 🔧 Changing the Admin Password

### For Development (.env file):
```env
VITE_ADMIN_PASSWORD=your_secure_password_here
```

### For Production (Netlify):
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add/Update: `VITE_ADMIN_PASSWORD=your_secure_password`
4. Redeploy your site

## 🛡️ Security Features

### Current Protection:
- ✅ Password-protected access
- ✅ Session persistence (stays logged in)
- ✅ Automatic logout on page refresh if password changed
- ✅ No admin links visible to regular users

### Recommended for Production:
- 🔄 Change default password immediately
- 🔄 Use a strong, unique password
- 🔄 Consider adding IP restrictions
- 🔄 Monitor access logs

## 🎯 Admin Panel Features

### Banner Management
- Create, edit, and delete banners
- Upload banner images
- Reorder banners with drag & drop
- Enable/disable banners
- Preview banners on homepage and shop page

### Product Management
- Bulk edit products
- Update prices and categories
- Manage custom quantities
- Sync with Poster POS API
- Image management

### Order Management
- View all orders
- Update order status
- Filter by status and date
- Customer information

### Site Configuration
- Update site settings
- Manage SEO settings
- Configure delivery pricing
- Theme customization

## 🚨 Troubleshooting

### Can't Access Admin Panel?
1. **Check Password**: Ensure you're using the correct password
2. **Clear Browser Cache**: Try incognito/private mode
3. **Check Environment Variables**: Verify `VITE_ADMIN_PASSWORD` is set
4. **Check Console**: Look for JavaScript errors

### Forgot Admin Password?
1. **Check .env file** (development)
2. **Check Netlify environment variables** (production)
3. **Default fallback**: Try `admin123`

### Admin Panel Not Loading?
1. **Check URL**: Ensure you're at `/admin`
2. **Check Network**: Verify site is accessible
3. **Check Browser Compatibility**: Use modern browser

## 📱 Mobile Access

The admin panel is responsive and works on mobile devices:
- 📱 **Phone**: Optimized layout for small screens
- 📱 **Tablet**: Full functionality with touch interface
- 📱 **Desktop**: Complete admin experience

## 🔄 Session Management

### How It Works:
- Login persists across browser sessions
- Stored securely in localStorage
- Automatic logout if password changes
- No server-side session required

### Manual Logout:
Currently, there's no logout button. To logout:
1. Clear browser localStorage
2. Or change the admin password
3. Or use incognito mode for temporary access

## 🎉 Quick Start

1. **Go to**: `https://your-site.com/admin`
2. **Enter password**: `admin123` (or your custom password)
3. **Start managing**: Your PWA POS Shop!

## 📞 Support

If you need help with admin access:
- Check this documentation first
- Verify environment variables
- Test in incognito mode
- Check browser console for errors

---

**Security Note**: Always change the default password in production environments!
