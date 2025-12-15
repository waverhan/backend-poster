/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to Google Analytics
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Metric interface
interface Metric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType?: string
}

// Send metric to Google Analytics
function sendToAnalytics(metric: Metric) {
  if (typeof window.gtag === 'undefined') return

  // Send to Google Analytics as an event
  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: getMetricRating(metric)
  })

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: getMetricRating(metric),
      delta: metric.delta
    })
  }
}

// Get metric rating (good, needs-improvement, poor)
function getMetricRating(metric: Metric): string {
  const { name, value } = metric

  switch (name) {
    case 'CLS':
      if (value <= 0.1) return 'good'
      if (value <= 0.25) return 'needs-improvement'
      return 'poor'
    case 'INP': // Interaction to Next Paint (replaces FID)
      if (value <= 200) return 'good'
      if (value <= 500) return 'needs-improvement'
      return 'poor'
    case 'LCP':
      if (value <= 2500) return 'good'
      if (value <= 4000) return 'needs-improvement'
      return 'poor'
    case 'FCP':
      if (value <= 1800) return 'good'
      if (value <= 3000) return 'needs-improvement'
      return 'poor'
    case 'TTFB':
      if (value <= 800) return 'good'
      if (value <= 1800) return 'needs-improvement'
      return 'poor'
    default:
      return 'unknown'
  }
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  // Only run in production
  if (import.meta.env.DEV) {
    console.log('[Web Vitals] Monitoring enabled in development mode')
  }

  // Track all Core Web Vitals (using web-vitals v5 API)
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onINP(sendToAnalytics) // Replaces FID in web-vitals v5
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Export for manual tracking
export { getCLS, getFID, getFCP, getLCP, getTTFB }

