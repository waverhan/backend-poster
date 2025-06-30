import type { Product } from '@/types'

export interface RecommendationEvent {
  id: string
  type: 'view' | 'click' | 'add_to_cart' | 'purchase'
  context: 'shop' | 'cart' | 'checkout' | 'product'
  product_id: string
  product_name: string
  product_price: number
  recommendation_reason: string
  recommendation_confidence: number
  user_session_id: string
  timestamp: string
  cart_value_at_time?: number
  order_id?: string
}

export interface RecommendationMetrics {
  total_views: number
  total_clicks: number
  total_add_to_cart: number
  total_purchases: number
  click_through_rate: number
  conversion_rate: number
  add_to_cart_rate: number
  revenue_generated: number
  average_order_value: number
  top_performing_products: Array<{
    product_id: string
    product_name: string
    clicks: number
    conversions: number
    revenue: number
  }>
  performance_by_context: Record<string, {
    views: number
    clicks: number
    conversions: number
    revenue: number
  }>
  performance_by_time: Array<{
    date: string
    views: number
    clicks: number
    conversions: number
    revenue: number
  }>
}

class RecommendationAnalyticsService {
  private events: RecommendationEvent[] = []
  private sessionId: string
  private storageKey = 'recommendation-analytics'

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadFromStorage()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error)
    }
  }

  private saveToStorage(): void {
    try {
      // Keep only last 1000 events to prevent storage bloat
      const recentEvents = this.events.slice(-1000)
      localStorage.setItem(this.storageKey, JSON.stringify(recentEvents))
      this.events = recentEvents
    } catch (error) {
      console.error('Failed to save analytics to storage:', error)
    }
  }

  // Track when recommendations are shown
  trackRecommendationView(
    context: string,
    products: Product[],
    reasons: Map<string, string>,
    confidences: Map<string, number>
  ): void {
    products.forEach(product => {
      const event: RecommendationEvent = {
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'view',
        context: context as any,
        product_id: product.id,
        product_name: product.display_name || product.name,
        product_price: product.price,
        recommendation_reason: reasons.get(product.id) || 'Unknown',
        recommendation_confidence: confidences.get(product.id) || 0.5,
        user_session_id: this.sessionId,
        timestamp: new Date().toISOString()
      }
      this.events.push(event)
    })
    this.saveToStorage()
  }

  // Track when user clicks on a recommendation
  trackRecommendationClick(
    context: string,
    product: Product,
    reason: string,
    confidence: number,
    cartValue?: number
  ): void {
    const event: RecommendationEvent = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'click',
      context: context as any,
      product_id: product.id,
      product_name: product.display_name || product.name,
      product_price: product.price,
      recommendation_reason: reason,
      recommendation_confidence: confidence,
      user_session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      cart_value_at_time: cartValue
    }
    this.events.push(event)
    this.saveToStorage()
  }

  // Track when user adds recommended product to cart
  trackRecommendationAddToCart(
    context: string,
    product: Product,
    reason: string,
    confidence: number,
    cartValue?: number
  ): void {
    const event: RecommendationEvent = {
      id: `add_to_cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'add_to_cart',
      context: context as any,
      product_id: product.id,
      product_name: product.display_name || product.name,
      product_price: product.price,
      recommendation_reason: reason,
      recommendation_confidence: confidence,
      user_session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      cart_value_at_time: cartValue
    }
    this.events.push(event)
    this.saveToStorage()
  }

  // Track when recommended product is purchased
  trackRecommendationPurchase(
    context: string,
    product: Product,
    reason: string,
    confidence: number,
    orderId: string,
    orderValue: number
  ): void {
    const event: RecommendationEvent = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'purchase',
      context: context as any,
      product_id: product.id,
      product_name: product.display_name || product.name,
      product_price: product.price,
      recommendation_reason: reason,
      recommendation_confidence: confidence,
      user_session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      order_id: orderId,
      cart_value_at_time: orderValue
    }
    this.events.push(event)
    this.saveToStorage()
  }

  // Get comprehensive analytics metrics
  getMetrics(dateRange?: { start: Date; end: Date }): RecommendationMetrics {
    let filteredEvents = this.events

    if (dateRange) {
      filteredEvents = this.events.filter(event => {
        const eventDate = new Date(event.timestamp)
        return eventDate >= dateRange.start && eventDate <= dateRange.end
      })
    }

    const views = filteredEvents.filter(e => e.type === 'view')
    const clicks = filteredEvents.filter(e => e.type === 'click')
    const addToCarts = filteredEvents.filter(e => e.type === 'add_to_cart')
    const purchases = filteredEvents.filter(e => e.type === 'purchase')

    const totalViews = views.length
    const totalClicks = clicks.length
    const totalAddToCarts = addToCarts.length
    const totalPurchases = purchases.length

    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
    const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0
    const addToCartRate = totalClicks > 0 ? (totalAddToCarts / totalClicks) * 100 : 0

    const revenueGenerated = purchases.reduce((sum, event) => sum + event.product_price, 0)
    const averageOrderValue = totalPurchases > 0 ? revenueGenerated / totalPurchases : 0

    // Top performing products
    const productPerformance = new Map<string, {
      product_name: string
      clicks: number
      conversions: number
      revenue: number
    }>()

    clicks.forEach(event => {
      if (!productPerformance.has(event.product_id)) {
        productPerformance.set(event.product_id, {
          product_name: event.product_name,
          clicks: 0,
          conversions: 0,
          revenue: 0
        })
      }
      productPerformance.get(event.product_id)!.clicks++
    })

    purchases.forEach(event => {
      if (productPerformance.has(event.product_id)) {
        const perf = productPerformance.get(event.product_id)!
        perf.conversions++
        perf.revenue += event.product_price
      }
    })

    const topPerformingProducts = Array.from(productPerformance.entries())
      .map(([product_id, data]) => ({ product_id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Performance by context
    const contextPerformance: Record<string, any> = {}
    const contexts = ['shop', 'cart', 'checkout', 'product']

    contexts.forEach(context => {
      const contextViews = views.filter(e => e.context === context).length
      const contextClicks = clicks.filter(e => e.context === context).length
      const contextConversions = purchases.filter(e => e.context === context).length
      const contextRevenue = purchases
        .filter(e => e.context === context)
        .reduce((sum, e) => sum + e.product_price, 0)

      contextPerformance[context] = {
        views: contextViews,
        clicks: contextClicks,
        conversions: contextConversions,
        revenue: contextRevenue
      }
    })

    // Performance by time (last 30 days)
    const performanceByTime: Array<any> = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayEvents = filteredEvents.filter(event => 
        event.timestamp.startsWith(dateStr)
      )

      performanceByTime.push({
        date: dateStr,
        views: dayEvents.filter(e => e.type === 'view').length,
        clicks: dayEvents.filter(e => e.type === 'click').length,
        conversions: dayEvents.filter(e => e.type === 'purchase').length,
        revenue: dayEvents
          .filter(e => e.type === 'purchase')
          .reduce((sum, e) => sum + e.product_price, 0)
      })
    }

    return {
      total_views: totalViews,
      total_clicks: totalClicks,
      total_add_to_cart: totalAddToCarts,
      total_purchases: totalPurchases,
      click_through_rate: clickThroughRate,
      conversion_rate: conversionRate,
      add_to_cart_rate: addToCartRate,
      revenue_generated: revenueGenerated,
      average_order_value: averageOrderValue,
      top_performing_products: topPerformingProducts,
      performance_by_context: contextPerformance,
      performance_by_time: performanceByTime
    }
  }

  // Export data for analysis
  exportData(): RecommendationEvent[] {
    return [...this.events]
  }

  // Clear all analytics data
  clearData(): void {
    this.events = []
    localStorage.removeItem(this.storageKey)
  }
}

export const recommendationAnalytics = new RecommendationAnalyticsService()
