# Email Configuration Guide

## Current Issue
The SMTP server at `mx1.cityhost.com.ua` is blocking connections from Railway's infrastructure, causing "Connection timeout" errors when trying to send emails.

## Solutions

### Option 1: Use SendGrid (Recommended) ✅
**Best for cloud infrastructure like Railway**

1. **Create a free SendGrid account:**
   - Go to https://sendgrid.com/
   - Sign up for free (100 emails/day limit)
   - Create an API key

2. **Add to Railway environment variables:**
   ```
   SENDGRID_API_KEY=your_api_key_here
   ```

3. **Benefits:**
   - Works reliably with Railway
   - No firewall issues
   - Free tier available
   - Professional email delivery

### Option 2: Contact SMTP Provider
**If you want to keep using mx1.cityhost.com.ua**

Contact cityhost.com.ua support and ask them to:
1. Whitelist Railway's IP addresses for SMTP connections
2. Or check firewall settings blocking external connections
3. Or provide alternative SMTP configuration

### Option 3: Use Alternative SMTP Service
- **Mailgun** - Free tier available
- **AWS SES** - Pay-as-you-go
- **Brevo (Sendinblue)** - Free tier available

## Current Implementation
The backend now supports:
1. **Primary:** SendGrid API (if `SENDGRID_API_KEY` is set)
2. **Fallback:** SMTP on port 465 (SSL)
3. **Secondary Fallback:** SMTP on port 587 (STARTTLS)

## Testing
After setting up SendGrid:
```bash
curl https://backend-api-production-b3a0.up.railway.app/api/orders/test-email
```

Should return:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "sentTo": "info@opillia.com.ua"
}
```

## Next Steps
1. Choose your preferred email solution
2. Set up the API key or contact your SMTP provider
3. Add credentials to Railway environment variables
4. Test the email functionality

