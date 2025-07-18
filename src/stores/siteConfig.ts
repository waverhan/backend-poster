import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SiteConfig } from '@/types'

export const useSiteConfigStore = defineStore('siteConfig', () => {
  // State
  const config = ref<SiteConfig | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Default configuration
  const defaultConfig: Omit<SiteConfig, 'id' | 'created_at' | 'updated_at'> = {
    // Branding
    site_name: 'Опілля',
    site_description: 'Найкращі напої та делікатеси з доставкою по Києву',
    logo_url: '/logo.png',
    favicon_url: '/favicon.ico',

    // SEO
    seo_title: 'Опілля - Найкращі напої та делікатеси з доставкою по Києву',
    seo_description: 'Замовляйте найкращі напої, сири, м\'ясо та делікатеси з доставкою по Києву. Швидка доставка, свіжі продукти, AI-помічник для вибору.',
    seo_keywords: 'напої, сир, м\'ясо, делікатеси, доставка, Київ, пиво, вино, крафт, Опілля',
    og_image_url: '/og-image.jpg',

    // Homepage
    homepage_type: 'landing' as const, // Default to landing page
    hero_title: 'Найкращі напої та делікатеси',
    hero_subtitle: 'Швидка доставка свіжих продуктів по Києву з AI-помічником для вибору',
    hero_banner_url: '/hero-banner.jpg',
    hero_cta_text: 'Почати покупки',

    // Contact & Footer
    company_name: 'ТОВ "Опілля Шоп"',
    company_address: 'вул. Хрещатик, 1, Київ, 01001',
    company_phone: '+380 44 123 45 67',
    company_email: 'info@opillia.shop',
    company_website: 'https://opillia.shop',

    // Social Media
    facebook_url: 'https://facebook.com/opillia.shop',
    instagram_url: 'https://instagram.com/opillia.shop',
    telegram_url: 'https://t.me/opillia_shop',
    viber_url: 'viber://chat?number=%2B380441234567',

    // Business Settings
    currency: '₴',
    timezone: 'Europe/Kiev',
    language: 'uk',
    min_order_amount: 300,

    // Delivery Pricing
    delivery_base_fee: 99, // Base delivery fee
    delivery_base_distance_km: 2, // Base distance included
    delivery_extra_fee_per_km: 30, // Extra fee per km beyond base
    free_delivery_threshold: 1000, // Free delivery above this amount

    // Features
    enable_reviews: true,
    enable_ai_chat: true,
    enable_recommendations: true,
    enable_notifications: true,
    enable_dark_mode: true,

    // Theme
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    accent_color: '#f59e0b'
  }

  // Getters
  const currentConfig = computed(() => config.value || {
    ...defaultConfig,
    id: 'default',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  const isConfigured = computed(() => config.value !== null)

  // Actions
  const fetchConfig = async (force = false) => {
    if (!force && config.value && lastFetched.value) {
      const timeSinceLastFetch = Date.now() - lastFetched.value.getTime()
      if (timeSinceLastFetch < 5 * 60 * 1000) { // 5 minutes cache
        return config.value
      }
    }

    isLoading.value = true
    error.value = null

    try {
      // Try to fetch from backend API
      const response = await fetch('/api/site-config')
      if (response.ok) {
        const fetchedConfig = await response.json()
        config.value = fetchedConfig
        lastFetched.value = new Date()
        saveToStorage()
        
      } else {
        throw new Error('Failed to fetch config from API')
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch config from API, using stored/default config')

      // Try to load from localStorage
      loadFromStorage()

      // If still no config, use default
      if (!config.value) {
        
        // Don't set config.value to keep using computed default
      }
    } finally {
      isLoading.value = false
    }

    return currentConfig.value
  }

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    isLoading.value = true
    error.value = null

    try {
      // Update backend API
      const response = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        config.value = updatedConfig
        lastFetched.value = new Date()
        saveToStorage()
        
        return updatedConfig
      } else {
        throw new Error('Failed to update config')
      }
    } catch (err) {
      console.error('❌ Failed to update site config:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update configuration'

      // Update locally for immediate UI feedback
      if (config.value) {
        config.value = { ...config.value, ...updates, updated_at: new Date().toISOString() }
        saveToStorage()
      }

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetToDefaults = async () => {
    const resetConfig = {
      ...defaultConfig,
      id: config.value?.id || 'default',
      created_at: config.value?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      await updateConfig(resetConfig)
    } catch (err) {
      // Even if API fails, reset locally
      config.value = resetConfig
      saveToStorage()
    }
  }

  // Persistence
  const saveToStorage = () => {
    try {
      if (config.value) {
        const configData = {
          config: config.value,
          lastFetched: lastFetched.value?.toISOString()
        }
        localStorage.setItem('pwa-pos-site-config', JSON.stringify(configData))
      }
    } catch (error) {
      console.error('Failed to save site config to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-site-config')
      if (stored) {
        const configData = JSON.parse(stored)
        config.value = configData.config
        lastFetched.value = configData.lastFetched ? new Date(configData.lastFetched) : null
        
      }
    } catch (error) {
      console.error('Failed to load site config from storage:', error)
      config.value = null
      lastFetched.value = null
    }
  }

  // Initialize
  const initialize = async () => {
    loadFromStorage()
    await fetchConfig()
  }

  // Apply theme colors to CSS variables
  const applyTheme = () => {
    const root = document.documentElement
    const cfg = currentConfig.value

    root.style.setProperty('--color-primary', cfg.primary_color)
    root.style.setProperty('--color-secondary', cfg.secondary_color)
    root.style.setProperty('--color-accent', cfg.accent_color)
  }

  // Update document title and meta tags
  const updateDocumentMeta = () => {
    const cfg = currentConfig.value

    // Update title
    document.title = cfg.seo_title

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', cfg.seo_description)
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', cfg.seo_keywords)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', cfg.seo_title)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', cfg.seo_description)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', cfg.og_image_url)
    }

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = cfg.favicon_url
    }
  }

  return {
    // State
    config,
    isLoading,
    error,
    lastFetched,

    // Getters
    currentConfig,
    isConfigured,
    defaultConfig,

    // Actions
    fetchConfig,
    updateConfig,
    resetToDefaults,
    initialize,
    applyTheme,
    updateDocumentMeta,

    // Persistence
    saveToStorage,
    loadFromStorage
  }
})
