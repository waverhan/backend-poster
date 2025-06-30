import type { Order } from '@/stores/orders'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private static instance: EmailService
  private apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const template = this.generateOrderConfirmationTemplate(order)

      // In a real application, this would call your backend email service
      // For now, we'll just log the email content and simulate sending
      
      
      
      

      // Simulate API call to backend email service
      const response = await fetch(`${this.apiUrl}/api/orders/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: order.customer_email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          order_id: order.id
        })
      })

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`)
      }

      
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      // In a real app, you might want to queue the email for retry
      // or log this to an error tracking service
    }
  }

  private generateOrderConfirmationTemplate(order: Order): EmailTemplate {
    const subject = `Підтвердження замовлення №${order.order_number} - PWA Shop`

    const deliveryInfo = order.delivery_method === 'delivery'
      ? `Доставка за адресою: ${order.delivery_address}`
      : `Самовивіз з магазину: ${order.pickup_branch?.name || 'Не вказано'}`

    const itemsList = order.items.map(item =>
      `• ${item.name} - ${item.quantity} шт. × ${item.price.toFixed(2)} UAH = ${(item.quantity * item.price).toFixed(2)} UAH`
    ).join('\n')

    const estimatedTime = order.estimated_delivery
      ? new Date(order.estimated_delivery).toLocaleString('uk-UA')
      : 'Не вказано'

    const text = `
Вітаємо, ${order.customer_name}!

Ваше замовлення №${order.order_number} успішно оформлено.

ДЕТАЛІ ЗАМОВЛЕННЯ:
${itemsList}

ПІДСУМОК:
Сума товарів: ${order.subtotal.toFixed(2)} UAH
Доставка: ${order.delivery_fee.toFixed(2)} UAH
Загальна сума: ${order.total.toFixed(2)} UAH

ДОСТАВКА:
${deliveryInfo}
Орієнтовний час: ${estimatedTime}

ОПЛАТА:
${order.payment_method === 'cash_on_delivery' ? 'Оплата при отриманні' : order.payment_method}

${order.notes ? `КОМЕНТАР:\n${order.notes}\n` : ''}

Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей замовлення.

З повагою,
Команда PWA Shop

Контакти:
📞 +38 (044) 123-45-67
✉️ support@shop.com.ua
🌐 https://shop.com.ua
    `.trim()

    const html = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .order-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .items-list { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .total { background: #dbeafe; padding: 15px; border-radius: 6px; font-weight: bold; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .status-badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛒 PWA Shop</h1>
        <p>Підтвердження замовлення</p>
    </div>

    <div class="content">
        <h2>Вітаємо, ${order.customer_name}!</h2>
        <p>Ваше замовлення <strong>№${order.order_number}</strong> успішно оформлено.</p>
        <span class="status-badge">Статус: ${order.status === 'pending' ? 'Обробляється' : order.status}</span>

        <div class="order-details">
            <h3>📦 Деталі замовлення:</h3>
            <div class="items-list">
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${(item.quantity * item.price).toFixed(2)} UAH</span>
                    </div>
                `).join('')}
            </div>

            <div class="total">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Сума товарів:</span>
                    <span>${order.subtotal.toFixed(2)} UAH</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Доставка:</span>
                    <span>${order.delivery_fee.toFixed(2)} UAH</span>
                </div>
                <hr style="margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 18px;">
                    <span>Загальна сума:</span>
                    <span>${order.total.toFixed(2)} UAH</span>
                </div>
            </div>
        </div>

        <div class="order-details">
            <h3>${order.delivery_method === 'delivery' ? '🚚 Доставка' : '🏪 Самовивіз'}:</h3>
            <p>${deliveryInfo}</p>
            <p><strong>Орієнтовний час:</strong> ${estimatedTime}</p>
        </div>

        <div class="order-details">
            <h3>💳 Оплата:</h3>
            <p>${order.payment_method === 'cash_on_delivery' ? 'Оплата при отриманні' : order.payment_method}</p>
        </div>

        ${order.notes ? `
        <div class="order-details">
            <h3>📝 Коментар:</h3>
            <p>${order.notes}</p>
        </div>
        ` : ''}

        <p><strong>Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей замовлення.</strong></p>
    </div>

    <div class="footer">
        <p><strong>З повагою, команда PWA Shop</strong></p>
        <p>📞 +38 (044) 123-45-67 | ✉️ support@shop.com.ua</p>
        <p>🌐 <a href="https://shop.com.ua" style="color: #93c5fd;">shop.com.ua</a></p>
    </div>
</body>
</html>
    `.trim()

    return { subject, html, text }
  }

  async sendReviewRequest(order: Order): Promise<void> {
    try {
      const template = this.generateReviewRequestTemplate(order)

      
      
      

      const response = await fetch(`${this.apiUrl}/api/orders/send-review-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: order.customer_email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          order_id: order.id
        })
      })

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`)
      }

      
    } catch (error) {
      console.error('❌ Failed to send review request email:', error)
    }
  }

  private generateReviewRequestTemplate(order: Order): EmailTemplate {
    const subject = `Як вам замовлення? Поділіться враженнями! 🌟`
    const reviewUrl = `${window.location.origin}/review-order/${order.id}`

    const text = `
Вітаємо, ${order.customer_name}!

Дякуємо за ваше замовлення №${order.order_number}. Сподіваємося, вам сподобалися наші товари!

Ваші відгуки допомагають нам покращуватися і допомагають іншим покупцям робити кращий вибір.

ТОВАРИ З ВАШОГО ЗАМОВЛЕННЯ:
${order.items.map(item => `• ${item.name}`).join('\n')}

Будь ласка, приділіть кілька хвилин для оцінки вашої покупки:
${reviewUrl}

🎁 БОНУС ЗА ВІДГУК!
Залиште відгук і отримайте знижку 10% на наступне замовлення!

Це займе лише кілька хвилин, а ваші чесні відгуки дуже цінні для нас.

З повагою,
Команда PWA Shop

Контакти:
📞 +38 (044) 123-45-67
✉️ support@shop.com.ua
🌐 https://shop.com.ua
    `.trim()

    const html = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .products { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .bonus { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .stars { font-size: 30px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <h1>Як вам замовлення?</h1>
        <p>Ваші відгуки допомагають нам покращуватися!</p>
    </div>

    <div class="content">
        <h2>Вітаємо, ${order.customer_name}!</h2>
        <p>Дякуємо за ваше замовлення №<strong>${order.order_number}</strong> від ${new Date(order.created_at).toLocaleDateString('uk-UA')}. Сподіваємося, вам сподобалися наші товари!</p>

        <p>Ваші чесні відгуки допомагають нам покращувати наші товари та сервіс, а також допомагають іншим покупцям робити кращий вибір.</p>

        <div class="products">
            <h3>🛒 Товари з вашого замовлення:</h3>
            <ul>
                ${order.items.map(item => `<li><strong>${item.name}</strong> - ${item.quantity} шт.</li>`).join('')}
            </ul>
            <p><strong>Загальна сума: ${order.total.toFixed(2)} UAH</strong></p>
        </div>

        <div style="text-align: center;">
            <p><strong>Оцініть ваш досвід та допоможіть іншим відкрити чудові товари!</strong></p>
            <a href="${reviewUrl}" class="cta-button">Написати відгук</a>
        </div>

        <div class="bonus">
            <h3>🎁 Бонус за відгук!</h3>
            <p>Залиште відгук і отримайте <strong>знижку 10%</strong> на наступне замовлення!</p>
            <p style="font-size: 18px; font-weight: bold; color: #f59e0b;">Промокод: REVIEW10</p>
        </div>

        <p style="color: #666; font-size: 14px;">
            Це займе лише кілька хвилин. Ваш відгук буде видимий іншим покупцям після модерації.
        </p>
    </div>

    <div class="footer">
        <p><strong>Дякуємо, що обираєте нас!</strong></p>
        <p>📞 +38 (044) 123-45-67 | ✉️ support@shop.com.ua</p>
        <p>🌐 <a href="https://shop.com.ua" style="color: #93c5fd;">shop.com.ua</a></p>
    </div>
</body>
</html>
    `.trim()

    return { subject, html, text }
  }

  async scheduleReviewRequest(order: Order, delayHours = 24): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/schedule-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.id,
          customer_email: order.customer_email,
          delayHours
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to schedule review request: ${response.status}`)
      }

      
    } catch (error) {
      console.error('❌ Failed to schedule review request:', error)
    }
  }
}

export const emailService = EmailService.getInstance()
