# 🔐 License Management System

A comprehensive licensing system for protecting your shop application with domain binding, subscription management, and secure validation.

## 🚀 Features

### ✅ **Core Protection**
- **Domain Binding**: One license per domain only
- **Subscription Management**: Monthly ($29) and Yearly ($299) plans
- **Secure Validation**: Server-side license verification
- **Device Fingerprinting**: Additional security layer
- **Encrypted Storage**: Local license data encryption
- **Periodic Validation**: Automatic license checks every 6 hours

### ✅ **User Experience**
- **Seamless Integration**: Non-intrusive license checking
- **Expiry Warnings**: 7-day advance notifications
- **Grace Period**: Smooth renewal process
- **Offline Tolerance**: Works during temporary network issues
- **Admin Dashboard**: License status monitoring

### ✅ **Business Features**
- **Automatic Renewal**: Easy subscription management
- **Usage Analytics**: License validation tracking
- **Customer Support**: Built-in support links
- **Revenue Protection**: Prevents unauthorized usage

## 📋 Setup Instructions

### 1. **License Server Setup**

```bash
# Navigate to license server directory
cd license-server

# Install dependencies
npm install

# Start the license server
npm start
# Server runs on http://localhost:3002
```

### 2. **Create Your First License**

```bash
# Create a license for your domain
cd license-server
node scripts/create-license.js yourdomain.com monthly customer@email.com

# Example output:
# ✅ License created successfully!
# 🔑 License Key: ABC123-DEF4-5678-90XY
# 🌐 Domain: yourdomain.com
# 📅 Subscription: monthly
# ⏰ Expires: December 15, 2024
```

### 3. **Configure Frontend**

Update your license server URL in `src/services/licenseService.ts`:

```typescript
private readonly LICENSE_SERVER_URL = 'https://your-license-server.com/api'
```

### 4. **Deploy License Server**

Deploy to your preferred hosting platform:

```bash
# For production deployment
npm run start

# Environment variables needed:
# PORT=3002 (optional, defaults to 3002)
```

## 🔧 Configuration

### **License Server Configuration**

Edit `license-server/server.js`:

```javascript
// Pricing configuration
const MONTHLY_PRICE = 29
const YEARLY_PRICE = 299

// Features included with license
const DEFAULT_FEATURES = [
  'ai_recommendations',
  'delivery_management', 
  'analytics',
  'multilanguage',
  'admin_panel'
]
```

### **Frontend Configuration**

Edit `src/services/licenseService.ts`:

```typescript
// Your license server URL
private readonly LICENSE_SERVER_URL = 'https://your-license-server.com/api'

// Encryption key (change this!)
private readonly ENCRYPTION_KEY = 'your-secret-encryption-key-2024'

// Validation interval (6 hours)
6 * 60 * 60 * 1000
```

## 💳 Payment Integration

### **Stripe Integration Example**

```javascript
// Add to license-server/server.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

app.post('/api/purchase', async (req, res) => {
  const { domain, subscriptionType } = req.body
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Shop License - ${subscriptionType}`,
        },
        unit_amount: subscriptionType === 'yearly' ? 29900 : 2900,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${req.headers.origin}/license-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/license-cancel`,
    metadata: {
      domain,
      subscriptionType
    }
  })
  
  res.json({ url: session.url })
})
```

## 🛡️ Security Features

### **1. Domain Binding**
- License is cryptographically bound to domain
- Cannot be used on different domains
- Hash-based verification

### **2. Device Fingerprinting**
- Canvas fingerprinting
- WebGL renderer detection
- Browser characteristics
- Screen resolution and timezone

### **3. Encrypted Storage**
- AES encryption for local storage
- Secure key derivation
- Tamper detection

### **4. Server-Side Validation**
- Real-time license verification
- Usage tracking and analytics
- Abuse detection

## 📊 Analytics & Monitoring

### **License Usage Analytics**

```sql
-- View license statistics
SELECT 
  COUNT(*) as total_licenses,
  COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_licenses,
  COUNT(CASE WHEN expires_at < datetime('now') THEN 1 END) as expired_licenses
FROM licenses;

-- View validation attempts
SELECT 
  domain,
  COUNT(*) as validation_attempts,
  COUNT(CASE WHEN success = 1 THEN 1 END) as successful_validations
FROM license_validations 
GROUP BY domain;
```

### **Admin Dashboard Metrics**

Access at `/admin` to view:
- License status and expiry
- Validation history
- Feature usage
- Renewal reminders

## 🔄 License Lifecycle

### **1. Purchase Flow**
```
Customer visits purchase page
→ Selects subscription type
→ Completes payment
→ License automatically generated
→ License key sent via email
```

### **2. Activation Flow**
```
Customer enters license key
→ Domain validation
→ Server verification
→ Local storage encryption
→ App unlocked
```

### **3. Renewal Flow**
```
7-day expiry warning shown
→ Customer clicks "Renew"
→ Payment processing
→ License extended
→ Automatic revalidation
```

## 🚨 Troubleshooting

### **Common Issues**

**License not validating:**
- Check internet connection
- Verify license server is running
- Confirm domain matches exactly
- Check license hasn't expired

**Domain binding issues:**
- Ensure consistent domain format
- Check for www vs non-www
- Verify SSL certificate

**Server errors:**
- Check license server logs
- Verify database connectivity
- Confirm API endpoints are accessible

### **Debug Mode**

Enable debug logging:

```typescript
// In licenseService.ts
const DEBUG = true

if (DEBUG) {
  console.log('License validation:', result)
}
```

## 📞 Support

### **Customer Support Integration**

```typescript
// Add to your support system
const supportTicket = {
  domain: window.location.hostname,
  licenseKey: licenseService.getCurrentLicense()?.licenseKey,
  issue: 'License validation failed',
  userAgent: navigator.userAgent
}
```

## 🎯 Best Practices

### **1. Security**
- Use HTTPS for license server
- Regularly rotate encryption keys
- Monitor for suspicious activity
- Implement rate limiting

### **2. User Experience**
- Show clear expiry warnings
- Provide easy renewal process
- Offer grace periods
- Include helpful error messages

### **3. Business**
- Track license usage analytics
- Monitor renewal rates
- Provide customer support
- Regular security audits

## 📈 Scaling

### **High Availability Setup**

```bash
# Load balancer configuration
upstream license_servers {
  server license1.yourdomain.com:3002;
  server license2.yourdomain.com:3002;
  server license3.yourdomain.com:3002;
}
```

### **Database Scaling**

```sql
-- Add indexes for performance
CREATE INDEX idx_license_domain ON licenses(domain);
CREATE INDEX idx_license_key ON licenses(license_key);
CREATE INDEX idx_validation_date ON license_validations(validated_at);
```

## 💰 Pricing Strategy

### **Recommended Pricing**
- **Monthly**: $29/month (higher for flexibility)
- **Yearly**: $299/year (save $49, encourage annual)
- **Enterprise**: Custom pricing for multiple domains

### **Value Proposition**
- AI-powered recommendations
- Advanced analytics
- Multi-language support
- Priority support
- Regular updates

---

## 🎉 Ready to Protect Your Application!

Your shop application now has enterprise-grade license protection with:
- ✅ Secure domain binding
- ✅ Subscription management
- ✅ Real-time validation
- ✅ Customer-friendly experience
- ✅ Revenue protection

Start selling your protected application with confidence! 🚀
