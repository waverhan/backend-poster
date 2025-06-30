import type { Order } from '@/stores/orders'

export interface MessageChannel {
  type: 'viber' | 'telegram' | 'email' | 'sms'
  identifier: string // phone number, email, user_id
  preferred: boolean
}

export interface MessageTemplate {
  subject?: string
  text: string
  html?: string
  buttons?: Array<{
    text: string
    url?: string
    action?: string
  }>
  image?: string
}

export interface NotificationPreferences {
  order_confirmation: MessageChannel[]
  order_status_updates: MessageChannel[]
  delivery_notifications: MessageChannel[]
  review_requests: MessageChannel[]
  promotional_messages: MessageChannel[]
}

class MessagingService {
  private baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  private telegramBotToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  private viberBotToken = import.meta.env.VITE_VIBER_BOT_TOKEN

  // Send order confirmation via multiple channels
  async sendOrderConfirmation(order: Order, channels: MessageChannel[]): Promise<void> {
    const template = this.generateOrderConfirmationTemplate(order)
    
    const promises = channels.map(channel => {
      switch (channel.type) {
        case 'telegram':
          return this.sendTelegramMessage(channel.identifier, template)
        case 'viber':
          return this.sendViberMessage(channel.identifier, template)
        case 'email':
          return this.sendEmailMessage(channel.identifier, template)
        default:
          return Promise.resolve()
      }
    })

    try {
      await Promise.allSettled(promises)
      
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error)
    }
  }

  // Send review request via preferred channel
  async sendReviewRequest(order: Order, preferredChannel: MessageChannel): Promise<void> {
    const template = this.generateReviewRequestTemplate(order)
    
    try {
      switch (preferredChannel.type) {
        case 'telegram':
          await this.sendTelegramMessage(preferredChannel.identifier, template)
          break
        case 'viber':
          await this.sendViberMessage(preferredChannel.identifier, template)
          break
        case 'email':
          await this.sendEmailMessage(preferredChannel.identifier, template)
          break
      }
      
    } catch (error) {
      console.error(`❌ Failed to send review request via ${preferredChannel.type}:`, error)
    }
  }

  // Send order status update
  async sendOrderStatusUpdate(
    order: Order, 
    newStatus: string, 
    channels: MessageChannel[]
  ): Promise<void> {
    const template = this.generateStatusUpdateTemplate(order, newStatus)
    
    const promises = channels.map(channel => {
      switch (channel.type) {
        case 'telegram':
          return this.sendTelegramMessage(channel.identifier, template)
        case 'viber':
          return this.sendViberMessage(channel.identifier, template)
        case 'email':
          return this.sendEmailMessage(channel.identifier, template)
        default:
          return Promise.resolve()
      }
    })

    try {
      await Promise.allSettled(promises)
      
    } catch (error) {
      console.error('❌ Failed to send status update:', error)
    }
  }

  // Telegram messaging
  private async sendTelegramMessage(chatId: string, template: MessageTemplate): Promise<void> {
    if (!this.telegramBotToken) {
      console.warn('Telegram bot token not configured')
      return
    }

    const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`
    
    const payload = {
      chat_id: chatId,
      text: template.text,
      parse_mode: 'HTML',
      reply_markup: template.buttons ? {
        inline_keyboard: [
          template.buttons.map(button => ({
            text: button.text,
            url: button.url,
            callback_data: button.action
          }))
        ]
      } : undefined
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
  }

  // Viber messaging
  private async sendViberMessage(userId: string, template: MessageTemplate): Promise<void> {
    if (!this.viberBotToken) {
      console.warn('Viber bot token not configured')
      return
    }

    const url = 'https://chatapi.viber.com/pa/send_message'
    
    const payload = {
      receiver: userId,
      type: 'text',
      text: template.text,
      keyboard: template.buttons ? {
        Type: 'keyboard',
        Buttons: template.buttons.map(button => ({
          Text: button.text,
          ActionType: button.url ? 'open-url' : 'reply',
          ActionBody: button.url || button.action,
          BgColor: '#2563eb',
          TextColor: '#ffffff'
        }))
      } : undefined
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Viber-Auth-Token': this.viberBotToken
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Viber API error: ${response.status}`)
    }
  }

  // Email messaging (enhanced)
  private async sendEmailMessage(email: string, template: MessageTemplate): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/messaging/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    })

    if (!response.ok) {
      throw new Error(`Email service error: ${response.status}`)
    }
  }

  // Template generators
  private generateOrderConfirmationTemplate(order: Order): MessageTemplate {
    const orderUrl = `${window.location.origin}/order/${order.id}`
    const supportUrl = `${window.location.origin}/chat`
    
    const text = `
🛒 <b>Замовлення підтверджено!</b>

📋 Номер: #${order.order_number}
💰 Сума: ${order.total.toFixed(2)} UAH
🚚 ${order.delivery_method === 'delivery' ? 'Доставка' : 'Самовивіз'}

📦 <b>Товари:</b>
${order.items.map(item => `• ${item.name} × ${item.quantity}`).join('\n')}

${order.delivery_method === 'delivery' 
  ? `📍 Адреса: ${order.delivery_address}` 
  : `🏪 Магазин: ${order.pickup_branch?.name}`
}

⏰ Орієнтовний час: ${order.estimated_delivery 
  ? new Date(order.estimated_delivery).toLocaleString('uk-UA')
  : 'Уточнюється'
}

Наш менеджер зв'яжеться з вами найближчим часом.
    `.trim()

    return {
      subject: `Підтвердження замовлення №${order.order_number}`,
      text,
      buttons: [
        { text: '📋 Деталі замовлення', url: orderUrl },
        { text: '💬 Підтримка', url: supportUrl }
      ]
    }
  }

  private generateReviewRequestTemplate(order: Order): MessageTemplate {
    const reviewUrl = `${window.location.origin}/review-order/${order.id}`
    
    const text = `
⭐ <b>Як вам замовлення?</b>

Привіт, ${order.customer_name}! 👋

Дякуємо за замовлення №${order.order_number}. Сподіваємося, вам все сподобалося!

🛍️ <b>Ваші товари:</b>
${order.items.map(item => `• ${item.name}`).join('\n')}

Поділіться враженнями - це допоможе іншим покупцям!

🎁 <b>Бонус за відгук:</b> знижка 10% на наступне замовлення!
    `.trim()

    return {
      subject: 'Як вам замовлення? Поділіться враженнями! 🌟',
      text,
      buttons: [
        { text: '⭐ Написати відгук', url: reviewUrl },
        { text: '🛒 Замовити ще', url: window.location.origin }
      ]
    }
  }

  private generateStatusUpdateTemplate(order: Order, newStatus: string): MessageTemplate {
    const statusEmojis: Record<string, string> = {
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '📦',
      'out_for_delivery': '🚚',
      'delivered': '🎉',
      'completed': '✨'
    }

    const statusTexts: Record<string, string> = {
      'confirmed': 'підтверджено',
      'preparing': 'готується',
      'ready': 'готове до видачі',
      'out_for_delivery': 'в дорозі',
      'delivered': 'доставлено',
      'completed': 'завершено'
    }

    const emoji = statusEmojis[newStatus] || '📋'
    const statusText = statusTexts[newStatus] || newStatus

    const text = `
${emoji} <b>Оновлення замовлення</b>

Замовлення №${order.order_number} ${statusText}

${newStatus === 'ready' && order.delivery_method === 'pickup' 
  ? `🏪 Можете забирати з магазину: ${order.pickup_branch?.name}`
  : ''
}

${newStatus === 'out_for_delivery' 
  ? `🚚 Кур'єр вже в дорозі до вас!`
  : ''
}

${newStatus === 'delivered' 
  ? `🎉 Замовлення доставлено! Дякуємо за покупку!`
  : ''
}
    `.trim()

    return {
      subject: `Оновлення замовлення №${order.order_number}`,
      text,
      buttons: newStatus === 'delivered' ? [
        { text: '⭐ Залишити відгук', url: `${window.location.origin}/review-order/${order.id}` }
      ] : []
    }
  }

  // Get user's messaging preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/messaging-preferences`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get user preferences:', error)
    }

    // Default preferences
    return {
      order_confirmation: [{ type: 'email', identifier: '', preferred: true }],
      order_status_updates: [{ type: 'telegram', identifier: '', preferred: true }],
      delivery_notifications: [{ type: 'telegram', identifier: '', preferred: true }],
      review_requests: [{ type: 'email', identifier: '', preferred: true }],
      promotional_messages: [{ type: 'email', identifier: '', preferred: false }]
    }
  }

  // Update user's messaging preferences
  async updateUserPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/users/${userId}/messaging-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
    } catch (error) {
      console.error('Failed to update user preferences:', error)
    }
  }
}

export default new MessagingService()
