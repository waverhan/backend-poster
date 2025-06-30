import { emailService } from '@/services/emailService'
import messagingService from '@/services/messagingService'
import reviewService from '@/services/reviewService'
import type { Order } from '@/stores/orders'
import type { MessageChannel } from '@/services/messagingService'

export interface CommunicationEvent {
  type: 'order_created' | 'order_status_changed' | 'order_delivered' | 'review_reminder'
  order: Order
  metadata?: {
    old_status?: string
    new_status?: string
    delivery_time?: string
    reminder_count?: number
  }
}

class CommunicationHub {
  private static instance: CommunicationHub

  static getInstance(): CommunicationHub {
    if (!CommunicationHub.instance) {
      CommunicationHub.instance = new CommunicationHub()
    }
    return CommunicationHub.instance
  }

  // Main event handler
  async handleEvent(event: CommunicationEvent): Promise<void> {
    

    try {
      switch (event.type) {
        case 'order_created':
          await this.handleOrderCreated(event.order)
          break
        case 'order_status_changed':
          await this.handleOrderStatusChanged(event.order, event.metadata)
          break
        case 'order_delivered':
          await this.handleOrderDelivered(event.order)
          break
        case 'review_reminder':
          await this.handleReviewReminder(event.order, event.metadata?.reminder_count || 1)
          break
      }
    } catch (error) {
      console.error(`❌ Failed to handle communication event ${event.type}:`, error)
    }
  }

  // Order created - send confirmation
  private async handleOrderCreated(order: Order): Promise<void> {
    

    // Get user's preferred communication channels
    const channels = await this.getUserChannels(order.customer_email, 'order_confirmation')

    // Send via all preferred channels
    await Promise.allSettled([
      // Email confirmation (always send)
      emailService.sendOrderConfirmation(order),
      
      // Multi-channel messaging
      messagingService.sendOrderConfirmation(order, channels),
      
      // Schedule review request for later
      this.scheduleReviewRequest(order)
    ])

    
  }

  // Order status changed - send update
  private async handleOrderStatusChanged(order: Order, metadata?: any): Promise<void> {
    const newStatus = metadata?.new_status || order.status
    

    // Get user's preferred channels for status updates
    const channels = await this.getUserChannels(order.customer_email, 'order_status_updates')

    // Send status update
    await messagingService.sendOrderStatusUpdate(order, newStatus, channels)

    // Special handling for specific statuses
    if (newStatus === 'ready' && order.delivery_method === 'pickup') {
      await this.sendPickupReadyNotification(order, channels)
    }

    if (newStatus === 'out_for_delivery') {
      await this.sendDeliveryTrackingInfo(order, channels)
    }

    
  }

  // Order delivered - trigger review flow
  private async handleOrderDelivered(order: Order): Promise<void> {
    

    // Send delivery confirmation
    const channels = await this.getUserChannels(order.customer_email, 'delivery_notifications')
    await messagingService.sendOrderStatusUpdate(order, 'delivered', channels)

    // Schedule review request (24 hours later)
    setTimeout(async () => {
      await this.sendReviewRequest(order)
    }, 24 * 60 * 60 * 1000) // 24 hours

    
  }

  // Send review request
  private async sendReviewRequest(order: Order): Promise<void> {
    

    // Get user's preferred channel for review requests
    const channels = await this.getUserChannels(order.customer_email, 'review_requests')
    const preferredChannel = channels.find(c => c.preferred) || channels[0]

    if (preferredChannel) {
      await messagingService.sendReviewRequest(order, preferredChannel)
    }

    // Also send email review request
    await emailService.sendReviewRequest(order)

    
  }

  // Handle review reminders
  private async handleReviewReminder(order: Order, reminderCount: number): Promise<void> {
    if (reminderCount > 2) {
      
      return
    }

    

    // Check if user has already reviewed
    const orderReviews = await reviewService.getOrderReviews(order.id)
    if (orderReviews.pending_products.length === 0) {
      
      return
    }

    // Send reminder via preferred channel
    const channels = await this.getUserChannels(order.customer_email, 'review_requests')
    const preferredChannel = channels.find(c => c.preferred) || channels[0]

    if (preferredChannel) {
      const reminderTemplate = this.generateReviewReminderTemplate(order, reminderCount)
      await this.sendCustomMessage(preferredChannel, reminderTemplate)
    }

    // Schedule next reminder (7 days later)
    if (reminderCount < 2) {
      setTimeout(async () => {
        await this.handleReviewReminder(order, reminderCount + 1)
      }, 7 * 24 * 60 * 60 * 1000) // 7 days
    }

    
  }

  // Utility methods
  private async getUserChannels(email: string, type: keyof any): Promise<MessageChannel[]> {
    try {
      // In a real app, get user ID from email
      const userId = 'current_user' // This would be resolved from email
      const preferences = await messagingService.getUserPreferences(userId)
      
      // Convert preference strings to MessageChannel objects
      const channelTypes = preferences[type] || []
      return channelTypes.map(channelType => ({
        type: channelType as any,
        identifier: this.getChannelIdentifier(email, channelType),
        preferred: channelType === preferences.preferred_channel
      }))
    } catch (error) {
      console.error('Failed to get user channels:', error)
      // Fallback to email only
      return [{ type: 'email', identifier: email, preferred: true }]
    }
  }

  private getChannelIdentifier(email: string, channelType: string): string {
    // In a real app, this would fetch the actual identifiers from user profile
    switch (channelType) {
      case 'email':
        return email
      case 'telegram':
        return '@username' // Would be actual telegram username
      case 'viber':
        return '+380123456789' // Would be actual phone number
      case 'sms':
        return '+380123456789' // Would be actual phone number
      default:
        return email
    }
  }

  private async scheduleReviewRequest(order: Order): Promise<void> {
    // Schedule review request for 24 hours after estimated delivery
    const deliveryTime = order.estimated_delivery 
      ? new Date(order.estimated_delivery)
      : new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now as fallback

    const reviewTime = new Date(deliveryTime.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
    const delay = reviewTime.getTime() - Date.now()

    if (delay > 0) {
      setTimeout(async () => {
        await this.sendReviewRequest(order)
      }, delay)
    }
  }

  private async sendPickupReadyNotification(order: Order, channels: MessageChannel[]): Promise<void> {
    const template = {
      subject: `Замовлення готове до видачі!`,
      text: `
🎉 Ваше замовлення №${order.order_number} готове!

📍 Можете забирати з магазину:
${order.pickup_branch?.name}
${order.pickup_branch?.address}

⏰ Режим роботи: ${order.pickup_branch?.hours || 'Уточнюйте за телефоном'}

Не забудьте взяти з собою документ, що посвідчує особу.
      `.trim(),
      buttons: [
        { text: '📍 Показати на карті', url: `https://maps.google.com/?q=${order.pickup_branch?.address}` },
        { text: '📞 Зателефонувати', url: `tel:${order.pickup_branch?.phone}` }
      ]
    }

    await Promise.allSettled(
      channels.map(channel => this.sendCustomMessage(channel, template))
    )
  }

  private async sendDeliveryTrackingInfo(order: Order, channels: MessageChannel[]): Promise<void> {
    const template = {
      subject: `Кур'єр в дорозі!`,
      text: `
🚚 Ваше замовлення №${order.order_number} в дорозі!

📍 Адреса доставки: ${order.delivery_address}
⏰ Орієнтовний час: ${order.estimated_delivery 
  ? new Date(order.estimated_delivery).toLocaleTimeString('uk-UA')
  : 'Уточнюється'
}

Кур'єр зв'яжеться з вами перед прибуттям.
      `.trim(),
      buttons: [
        { text: '📱 Зв\'язатися з кур\'єром', url: 'tel:+380123456789' },
        { text: '📋 Деталі замовлення', url: `${window.location.origin}/order/${order.id}` }
      ]
    }

    await Promise.allSettled(
      channels.map(channel => this.sendCustomMessage(channel, template))
    )
  }

  private generateReviewReminderTemplate(order: Order, reminderCount: number) {
    const incentives = [
      '🎁 Знижка 10% за відгук!',
      '🎁 Подвійні бонуси за відгук!',
      '🎁 Безкоштовна доставка наступного замовлення!'
    ]

    const incentive = incentives[reminderCount - 1] || incentives[0]

    return {
      subject: `Нагадування: залиште відгук про замовлення`,
      text: `
⭐ Привіт! Як вам замовлення №${order.order_number}?

Ваш відгук дуже важливий для нас і допомагає іншим покупцям.

${incentive}

Це займе лише хвилинку!
      `.trim(),
      buttons: [
        { text: '⭐ Написати відгук', url: `${window.location.origin}/review-order/${order.id}` }
      ]
    }
  }

  private async sendCustomMessage(channel: MessageChannel, template: any): Promise<void> {
    switch (channel.type) {
      case 'telegram':
        // Use messaging service telegram method
        break
      case 'viber':
        // Use messaging service viber method
        break
      case 'email':
        // Use email service
        break
    }
  }

  // Public API for triggering events
  async orderCreated(order: Order): Promise<void> {
    await this.handleEvent({ type: 'order_created', order })
  }

  async orderStatusChanged(order: Order, oldStatus: string, newStatus: string): Promise<void> {
    await this.handleEvent({
      type: 'order_status_changed',
      order,
      metadata: { old_status: oldStatus, new_status: newStatus }
    })
  }

  async orderDelivered(order: Order): Promise<void> {
    await this.handleEvent({ type: 'order_delivered', order })
  }

  async sendReviewReminder(order: Order, reminderCount = 1): Promise<void> {
    await this.handleEvent({
      type: 'review_reminder',
      order,
      metadata: { reminder_count: reminderCount }
    })
  }
}

export const communicationHub = CommunicationHub.getInstance()
