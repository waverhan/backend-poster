// Google Analytics Enhanced E-commerce Service
import type { Product, CartItem, Order } from '@/types'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface GAProduct {
  item_id: string
  item_name: string
  category: string
  quantity: number
  price: number
  currency?: string
  item_brand?: string
  item_variant?: string
  item_category2?: string
  item_category3?: string
}

export interface GAEcommerceEvent {
  currency: string
  value: number
  items: GAProduct[]
}

export interface GAPurchaseEvent extends GAEcommerceEvent {
  transaction_id: string
  shipping?: number
  tax?: number
  coupon?: string
}

class GoogleAnalyticsService {
  private isEnabled = false

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && typeof window.gtag === 'function'
  }

  // Convert product to GA format
  private formatProduct(product: Product, quantity: number = 1): GAProduct {
    return {
      item_id: product.id,
      item_name: product.name,
      category: product.category?.name || 'Uncategorized',
      quantity,
      price: product.price,
      currency: 'UAH',
      item_brand: 'Опілля',
      item_variant: product.weight_flag ? 'Weight-based' : 'Piece',
      item_category2: product.category?.name || undefined,
      item_category3: product.weight_flag ? 'По вазі' : 'Поштучно'
    }
  }

  // Convert cart item to GA format
  private formatCartItem(cartItem: CartItem): GAProduct {
    return {
      item_id: cartItem.product.id,
      item_name: cartItem.product.name,
      category: cartItem.product.category?.name || 'Uncategorized',
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      currency: 'UAH',
      item_brand: 'Опілля',
      item_variant: cartItem.product.weight_flag ? 'Weight-based' : 'Piece',
      item_category2: cartItem.product.category?.name || undefined,
      item_category3: cartItem.product.weight_flag ? 'По вазі' : 'Поштучно'
    }
  }

  // Track page view
  trackPageView(page_title: string, page_location?: string) {
    if (!this.isEnabled) return

    window.gtag('event', 'page_view', {
      page_title,
      page_location: page_location || window.location.href
    })
  }

  // Track product view
  trackViewItem(product: Product) {
    if (!this.isEnabled) return

    const gaProduct = this.formatProduct(product)
    
    window.gtag('event', 'view_item', {
      currency: 'UAH',
      value: product.price,
      items: [gaProduct]
    })
  }

  // Track product list view
  trackViewItemList(products: Product[], listName: string = 'Product List') {
    if (!this.isEnabled) return

    const items = products.map(product => this.formatProduct(product))
    
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items
    })
  }

  // Track add to cart
  trackAddToCart(product: Product, quantity: number = 1) {
    if (!this.isEnabled) return

    const gaProduct = this.formatProduct(product, quantity)
    
    window.gtag('event', 'add_to_cart', {
      currency: 'UAH',
      value: product.price * quantity,
      items: [gaProduct]
    })
  }

  // Track remove from cart
  trackRemoveFromCart(product: Product, quantity: number = 1) {
    if (!this.isEnabled) return

    const gaProduct = this.formatProduct(product, quantity)
    
    window.gtag('event', 'remove_from_cart', {
      currency: 'UAH',
      value: product.price * quantity,
      items: [gaProduct]
    })
  }

  // Track view cart
  trackViewCart(cartItems: CartItem[]) {
    if (!this.isEnabled) return

    const items = cartItems.map(item => this.formatCartItem(item))
    const value = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    window.gtag('event', 'view_cart', {
      currency: 'UAH',
      value,
      items
    })
  }

  // Track begin checkout
  trackBeginCheckout(cartItems: CartItem[]) {
    if (!this.isEnabled) return

    const items = cartItems.map(item => this.formatCartItem(item))
    const value = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    window.gtag('event', 'begin_checkout', {
      currency: 'UAH',
      value,
      items
    })
  }

  // Track purchase
  trackPurchase(order: Order, cartItems: CartItem[]) {
    if (!this.isEnabled) return

    const items = cartItems.map(item => this.formatCartItem(item))
    
    window.gtag('event', 'purchase', {
      transaction_id: order.id,
      currency: 'UAH',
      value: order.total_amount,
      shipping: order.delivery_fee || 0,
      tax: 0, // No tax in Ukraine for this type of business
      items
    })
  }

  // Track search
  trackSearch(searchTerm: string, resultsCount?: number) {
    if (!this.isEnabled) return

    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    })
  }

  // Track custom events
  trackCustomEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isEnabled) return

    window.gtag('event', eventName, parameters)
  }

  // Track user engagement
  trackEngagement(engagementType: string, details?: Record<string, any>) {
    if (!this.isEnabled) return

    window.gtag('event', 'engagement', {
      engagement_type: engagementType,
      ...details
    })
  }

  // Track conversion
  trackConversion(conversionType: string, value?: number, currency: string = 'UAH') {
    if (!this.isEnabled) return

    window.gtag('event', 'conversion', {
      conversion_type: conversionType,
      value,
      currency
    })
  }
}

export const googleAnalytics = new GoogleAnalyticsService()
export default googleAnalytics
