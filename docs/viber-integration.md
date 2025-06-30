# Viber Integration Setup

This guide explains how to set up Viber bot integration for sending order notifications to customers.

## Features

✅ **Automatic Order Confirmations** - Send Viber messages when orders are placed  
✅ **Status Update Notifications** - Send messages when order status changes  
✅ **Rich Message Format** - Include order details, customer info, and action buttons  
✅ **Admin Testing Interface** - Test messages from the admin panel  

## Setup Instructions

### 1. Create a Viber Bot

1. Go to [Viber Partners](https://partners.viber.com)
2. Sign up or log in with your Viber account
3. Create a new Public Account (Bot)
4. Fill in your bot details:
   - **Name**: Your business name (e.g., "Опілля Shop")
   - **Description**: Brief description of your business
   - **Avatar**: Upload your business logo
   - **Category**: Choose appropriate category (e.g., "Shopping & Retail")

### 2. Get Your Bot Token

1. After creating the bot, go to the bot settings
2. Copy the **Authentication Token**
3. Keep this token secure - you'll need it for the server configuration

### 3. Configure the Server

1. Add the Viber bot token to your environment variables:
   ```bash
   # In your .env file
   VIBER_BOT_TOKEN=your_viber_bot_token_here
   ```

2. Restart your server to load the new environment variable

### 4. Test the Integration

1. Go to the admin panel: `/admin`
2. Click on the **"📱 Messaging"** button
3. Check that Viber status shows "✅ Configured"
4. Use the test message form to send a test message to your phone

## How It Works

### Order Confirmation Messages

When a customer places an order, they automatically receive a Viber message with:

- Order number and customer name
- List of ordered items with quantities and prices
- Total amount and delivery fee
- Delivery method and address (or pickup location)
- Estimated delivery time
- Contact information
- Action buttons to contact support or visit website

### Status Update Messages

When order status changes, customers receive notifications for:

- **Confirmed**: Order confirmed and being processed
- **Preparing**: Order is being prepared
- **Ready**: Order ready for pickup (pickup orders only)
- **Out for Delivery**: Order is on the way (delivery orders only)
- **Delivered**: Order successfully delivered
- **Cancelled**: Order was cancelled

### Message Format Example

```
🎉 Вітаємо, Іван Петренко!

Ваше замовлення №ORD241219142537 успішно оформлено.

📦 ТОВАРИ:
• Пиво Stella Artois 0.5L - 2 шт. × 45.00 UAH
• Чіпси Lays 50г - 1 шт. × 25.00 UAH

💰 ПІДСУМОК:
Сума товарів: 115.00 UAH
Доставка: 99.00 UAH
💳 Загальна сума: 214.00 UAH

🚀 ДОСТАВКА:
🚚 Доставка за адресою: вул. Хрещатик, 1, Київ
⏰ Орієнтовний час: 19/12/2024, 16:25

💵 ОПЛАТА: Оплата при отриманні

Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей.

З повагою,
Команда Опілля 🍺

📞 +38 (097) 324 46 68
✉️ info@opillia.com.ua
```

## Troubleshooting

### Bot Token Not Working

- Verify the token is correct and copied completely
- Make sure there are no extra spaces or characters
- Check that the bot is active in Viber Partners panel

### Messages Not Sending

- Check server logs for error messages
- Verify the customer's phone number is in correct format
- Ensure the customer has Viber installed and active

### Testing Messages

- Use the admin messaging interface to test
- Try sending to your own phone number first
- Check the message log in the admin panel

## API Endpoints

The following API endpoints are available for Viber messaging:

- `GET /api/messaging/viber/status` - Check bot configuration status
- `POST /api/messaging/viber/test` - Send test message
- `POST /api/messaging/viber/order-notification` - Send order notification

## Security Notes

- Keep your Viber bot token secure and never expose it in client-side code
- The token is stored as a server-side environment variable
- Messages are sent directly from your server to Viber's API
- Customer phone numbers are handled securely and not logged

## Support

If you need help with Viber integration:

1. Check the admin messaging panel for configuration status
2. Review server logs for error messages
3. Test with the built-in test message feature
4. Verify your bot is properly configured in Viber Partners

For technical support, contact your development team with:
- Server logs showing any errors
- Screenshots of the admin messaging panel
- Details about what's not working as expected
