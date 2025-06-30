# Email Notification System

This document explains the email notification system implemented in the PWA POS system.

## Overview

The system automatically sends email notifications to customers in Ukrainian when:
- ✅ **Order is created** - Confirmation email with order details
- ✅ **Order status changes** - Updates about order progress

## Features

### 📧 **Order Confirmation Email**
- **Trigger**: When a new order is successfully created
- **Language**: Ukrainian
- **Content**: 
  - Order number and details
  - Customer information
  - Item list with prices
  - Delivery/pickup information
  - Total amount breakdown
  - Estimated delivery time
  - Contact information

### 📬 **Order Status Update Email**
- **Trigger**: When order status changes (confirmed, preparing, ready, delivered)
- **Language**: Ukrainian
- **Content**:
  - Order number
  - New status
  - Relevant instructions (e.g., ready for pickup)
  - Contact information

## Technical Implementation

### Backend Service
**File**: `server/services/emailService.js`

```javascript
// Send order confirmation
await emailService.sendOrderConfirmationEmail(order)

// Send status update
await emailService.sendOrderStatusUpdateEmail(order, newStatus)
```

### Email Templates
- **HTML Template**: Responsive design with Ukrainian text
- **Plain Text**: Fallback for email clients that don't support HTML
- **Styling**: Professional layout with shop branding

### Configuration
**File**: `server/.env`

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Shop Information
SHOP_NAME=Opillia Shop
SHOP_PHONE=+38 (097) 324 46 68
SHOP_EMAIL=info@opillia.com.ua
SHOP_WEBSITE=https://opillia.com.ua
```

## Setup Instructions

### 1. **Configure SMTP Settings**
1. Copy `server/.env.example` to `server/.env`
2. Update SMTP credentials:
   - For Gmail: Use App Password (not regular password)
   - For other providers: Use appropriate SMTP settings

### 2. **Install Dependencies**
```bash
cd server
npm install nodemailer
```

### 3. **Test Email Service**
The service will automatically log whether emails are sent successfully:
- ✅ `Email confirmation sent for order ORD240101...`
- ⚠️ `Email service not configured - skipping email notification`

## Email Content Examples

### Order Confirmation Email (Ukrainian)

**Subject**: `Підтвердження замовлення №ORD240101... - Opillia Shop`

**Content**:
```
Вітаємо, [Customer Name]!

Ваше замовлення №ORD240101... успішно оформлено та передано в обробку.

ДЕТАЛІ ЗАМОВЛЕННЯ:
• Пиво Volfas Engelman IPA - 2 шт. × 89.00 ₴ = 178.00 ₴
• Снеки солоні - 1 шт. × 45.00 ₴ = 45.00 ₴

ПІДСУМОК:
Сума товарів: 223.00 ₴
Доставка: 99.00 ₴
Загальна сума: 322.00 ₴

СПОСІБ ОТРИМАННЯ:
Доставка за адресою: вул. Хрещатик, 1, Київ
Орієнтовний час: 15 січня 2024, 14:30

Наш менеджер зв'яжеться з вами найближчим часом.

Дякуємо за вибір Opillia Shop!
```

### Status Update Email (Ukrainian)

**Subject**: `Оновлення замовлення №ORD240101... - готове`

**Content**:
```
Вітаємо, [Customer Name]!

Статус вашого замовлення №ORD240101... змінено на: ГОТОВЕ

🏪 Ваше замовлення готове до самовивозу з магазину: Opillia Shop - Центр

З повагою,
Команда Opillia Shop
```

## Error Handling

The email service is designed to be non-blocking:
- ✅ **Order creation succeeds** even if email fails
- ⚠️ **Logs warnings** when email service is not configured
- 🔄 **Graceful fallback** to other notification methods (Viber, Telegram)

## Monitoring

Check server logs for email status:
```bash
# Successful email
✅ Email confirmation sent for order ORD240101...

# Email service not configured
⚠️ Email service not configured - missing SMTP credentials

# Email failed
❌ Failed to send email confirmation: [error details]
```

## Supported Email Providers

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom SMTP
```bash
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-password
```

## Customization

### Modify Email Templates
Edit `server/services/emailService.js`:
- `generateOrderConfirmationEmail()` - Order confirmation template
- `generateStatusUpdateEmail()` - Status update template

### Add New Email Types
1. Create new method in `emailService.js`
2. Call from appropriate route in `server/routes/orders.js`
3. Add Ukrainian translations in `src/i18n/index.ts`

## Security Notes

- ✅ **Use App Passwords** for Gmail (not regular passwords)
- ✅ **Store credentials** in `.env` file (not in code)
- ✅ **Add `.env` to `.gitignore`** to prevent credential exposure
- ✅ **Use TLS/SSL** for secure email transmission

## Troubleshooting

### Email Not Sending
1. **Check SMTP credentials** in `.env` file
2. **Verify email provider settings** (host, port, security)
3. **Check server logs** for error messages
4. **Test with simple email client** to verify SMTP works

### Gmail Issues
1. **Enable 2-Factor Authentication** on Gmail account
2. **Generate App Password** (not regular password)
3. **Use App Password** in `SMTP_PASS` setting

### Customer Not Receiving Emails
1. **Check spam/junk folder**
2. **Verify email address** is correct in order
3. **Check email provider** isn't blocking automated emails

## Future Enhancements

- 📧 **Email templates editor** in admin panel
- 🎨 **Custom email branding** with logo and colors
- 📊 **Email delivery tracking** and analytics
- 🌐 **Multi-language email templates**
- 📱 **Email preview** before sending
