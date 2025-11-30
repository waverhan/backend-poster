import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class DiscountService {
  // Get all discounts
  async getAllDiscounts() {
    return await prisma.discount.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  // Get enabled discounts
  async getEnabledDiscounts() {
    return await prisma.discount.findMany({
      where: { enabled: true },
      orderBy: { created_at: 'desc' }
    })
  }

  // Create discount
  async createDiscount(data) {
    return await prisma.discount.create({
      data
    })
  }

  // Update discount
  async updateDiscount(id, data) {
    return await prisma.discount.update({
      where: { id },
      data
    })
  }

  // Delete discount
  async deleteDiscount(id) {
    return await prisma.discount.delete({
      where: { id }
    })
  }

  // Check if customer is first-time buyer
  async isFirstTimeCustomer(customerId, userId) {
    // If no customer ID or user ID, treat as first-time customer
    if (!customerId && !userId) {
      return true
    }

    const whereConditions = []
    if (customerId) whereConditions.push({ customer_id: customerId })
    if (userId) whereConditions.push({ user_id: userId })

    const orderCount = await prisma.order.count({
      where: {
        OR: whereConditions,
        status: { not: 'PENDING' }
      }
    })
    return orderCount === 0
  }

  // Check if current time is happy hours
  isHappyHours(discount) {
    if (discount.type !== 'happy_hours') return false

    // If required fields are missing, return false
    if (!discount.day_of_week || !discount.start_time || !discount.end_time) {
      console.log('  ⚠️ Happy hours discount missing required fields:', {
        day_of_week: discount.day_of_week,
        start_time: discount.start_time,
        end_time: discount.end_time
      })
      return false
    }

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Parse day_of_week (e.g., "1,2,3,4" for Mon-Thu)
    const allowedDays = discount.day_of_week.split(',').map(d => parseInt(d))

    // Check if today is in allowed days
    if (!allowedDays.includes(dayOfWeek)) return false

    // Check if current time is within range
    if (currentTime < discount.start_time || currentTime > discount.end_time) return false

    return true
  }

  // Get applicable discounts for an order
  async getApplicableDiscounts(orderData) {
    console.log('🔍 Checking applicable discounts for order:', {
      subtotal: orderData.subtotal,
      itemsCount: orderData.items?.length || 0,
      customerId: orderData.customerId,
      userId: orderData.userId
    })

    const enabledDiscounts = await this.getEnabledDiscounts()
    console.log('📋 Enabled discounts:', enabledDiscounts.length)

    const applicable = []

    for (const discount of enabledDiscounts) {
      let isApplicable = false

      switch (discount.type) {
        case 'first_order':
          isApplicable = await this.isFirstTimeCustomer(orderData.customerId, orderData.userId)
          console.log(`  ✓ First Order: ${isApplicable}`)
          break

        case 'happy_hours':
          isApplicable = this.isHappyHours(discount)
          console.log(`  ✓ Happy Hours: ${isApplicable}`)
          break

        case 'free_delivery':
          isApplicable = orderData.subtotal >= (discount.min_order_amount || 1500)
          console.log(`  ✓ Free Delivery: ${isApplicable} (${orderData.subtotal} >= ${discount.min_order_amount || 1500})`)
          break

        case 'fixed_shipping':
          isApplicable = orderData.subtotal >= (discount.min_order_amount || 700)
          console.log(`  ✓ Fixed Shipping: ${isApplicable} (${orderData.subtotal} >= ${discount.min_order_amount || 700})`)
          break

        case 'beer_promo':
          isApplicable = this.hasBeerProducts(orderData.items, discount.product_category)
          console.log(`  ✓ Beer Promo: ${isApplicable}`)
          break
      }

      if (isApplicable) {
        console.log(`    ➕ Added: ${discount.name}`)
        applicable.push(discount)
      }
    }

    console.log(`✅ Total applicable discounts: ${applicable.length}`)
    return applicable
  }

  // Check if order has beer products
  hasBeerProducts(items, categorySlug) {
    return items.some(item => item.category_slug === categorySlug)
  }

  // Calculate discount amount
  calculateDiscountAmount(discount, orderData) {
    switch (discount.discount_type) {
      case 'percentage':
        return (orderData.subtotal * discount.discount_value) / 100

      case 'fixed_amount':
        return discount.discount_value

      case 'quantity':
        // For beer promo, return 0 (quantity discount is handled separately)
        return 0

      default:
        return 0
    }
  }

  // Save order discount
  async saveOrderDiscount(orderId, discount, discountAmount) {
    return await prisma.orderDiscount.create({
      data: {
        order_id: orderId,
        discount_id: discount.id,
        discount_name: discount.name,
        discount_type: discount.type,
        discount_amount: discountAmount
      }
    })
  }
}

export default new DiscountService()

