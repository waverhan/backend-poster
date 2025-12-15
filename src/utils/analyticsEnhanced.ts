/**
 * Enhanced Analytics Tracking
 * Extends Google Analytics with additional event tracking
 */

import googleAnalytics from '@/services/googleAnalytics'

export class EnhancedAnalytics {
  // Track user interactions
  trackInteraction(category: string, action: string, label?: string, value?: number) {
    googleAnalytics.trackCustomEvent('user_interaction', {
      category,
      action,
      label,
      value
    })
  }

  // Track button clicks
  trackButtonClick(buttonName: string, location: string) {
    this.trackInteraction('Button', 'Click', `${buttonName} - ${location}`)
  }

  // Track link clicks
  trackLinkClick(linkText: string, destination: string) {
    this.trackInteraction('Link', 'Click', `${linkText} -> ${destination}`)
  }

  // Track form submissions
  trackFormSubmit(formName: string, success: boolean) {
    this.trackInteraction('Form', success ? 'Submit Success' : 'Submit Error', formName)
  }

  // Track form field interactions
  trackFormField(formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') {
    this.trackInteraction('Form Field', action, `${formName} - ${fieldName}`)
  }

  // Track scroll depth
  trackScrollDepth(depth: number) {
    const depthPercentage = Math.round(depth / 25) * 25 // Round to nearest 25%
    this.trackInteraction('Scroll', 'Depth', `${depthPercentage}%`, depthPercentage)
  }

  // Track time on page
  trackTimeOnPage(pageName: string, seconds: number) {
    const minutes = Math.floor(seconds / 60)
    this.trackInteraction('Time on Page', pageName, `${minutes} minutes`, seconds)
  }

  // Track filter usage
  trackFilterUsage(filterType: string, filterValue: string) {
    this.trackInteraction('Filter', 'Apply', `${filterType}: ${filterValue}`)
  }

  // Track sort usage
  trackSortUsage(sortBy: string, sortOrder: 'asc' | 'desc') {
    this.trackInteraction('Sort', 'Apply', `${sortBy} - ${sortOrder}`)
  }

  // Track product view duration
  trackProductViewDuration(productId: string, productName: string, seconds: number) {
    this.trackInteraction('Product View', 'Duration', `${productName} (${productId})`, seconds)
  }

  // Track cart abandonment
  trackCartAbandonment(cartValue: number, itemCount: number) {
    googleAnalytics.trackCustomEvent('cart_abandonment', {
      cart_value: cartValue,
      item_count: itemCount,
      currency: 'UAH'
    })
  }

  // Track checkout step
  trackCheckoutStep(step: number, stepName: string) {
    googleAnalytics.trackCustomEvent('checkout_progress', {
      checkout_step: step,
      checkout_option: stepName
    })
  }

  // Track payment method selection
  trackPaymentMethod(method: string) {
    googleAnalytics.trackCustomEvent('payment_method_selected', {
      payment_method: method
    })
  }

  // Track delivery method selection
  trackDeliveryMethod(method: 'delivery' | 'pickup', fee: number) {
    googleAnalytics.trackCustomEvent('delivery_method_selected', {
      delivery_method: method,
      delivery_fee: fee,
      currency: 'UAH'
    })
  }

  // Track errors
  trackError(errorType: string, errorMessage: string, errorLocation: string) {
    googleAnalytics.trackCustomEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      error_location: errorLocation
    })
  }

  // Track API errors
  trackApiError(endpoint: string, statusCode: number, errorMessage: string) {
    this.trackError('API Error', `${statusCode}: ${errorMessage}`, endpoint)
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    googleAnalytics.trackCustomEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit
    })
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, action: string) {
    this.trackInteraction('Feature', action, featureName)
  }

  // Track modal/dialog interactions
  trackModalInteraction(modalName: string, action: 'open' | 'close' | 'submit') {
    this.trackInteraction('Modal', action, modalName)
  }

  // Track navigation
  trackNavigation(from: string, to: string, method: 'click' | 'back' | 'forward') {
    this.trackInteraction('Navigation', method, `${from} -> ${to}`)
  }

  // Track outbound links
  trackOutboundLink(url: string, linkText: string) {
    googleAnalytics.trackCustomEvent('outbound_link', {
      link_url: url,
      link_text: linkText
    })
  }

  // Track social share
  trackSocialShare(platform: string, contentType: string, contentId: string) {
    googleAnalytics.trackCustomEvent('social_share', {
      platform,
      content_type: contentType,
      content_id: contentId
    })
  }
}

export const enhancedAnalytics = new EnhancedAnalytics()
export default enhancedAnalytics

