import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// Default site configuration
const defaultConfig = {
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
  homepage_type: 'landing', // 'landing' or 'shop'
  hero_title: 'Найкращі напої та делікатеси',
  hero_subtitle: 'Швидка доставка свіжих продуктів по Києву з AI-помічником для вибору',
  hero_banner_url: '/hero-banner.jpg',
  hero_cta_text: 'Почати покупки',

  // Contact & Footer
  company_name: 'ТОВ "Опілля Шоп"',
  company_address: 'вул. Хрещатик, 1, Київ, 01001',
  company_phone: '+38 (097) 324 46 68',
  company_email: 'info@opillia.com.ua',
  company_website: 'https://opillia.com.ua',

  // Social Media
  facebook_url: 'https://facebook.com/opillia.com.ua',
  instagram_url: 'https://instagram.com/opillia.com.ua',
  telegram_url: 'https://t.me/opillia_shop',
  viber_url: 'viber://chat?number=%2B380973244668',

  // Business Settings
  currency: 'UAH',
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
  enable_untappd: true,
  enable_likes: true,
  enable_ai_chat: true,
  enable_recommendations: true,
  enable_notifications: true,
  enable_dark_mode: true,

  // Payment Settings
  enable_online_payment: false,
  wayforpay_merchant_account: '',
  wayforpay_merchant_secret: '',
  wayforpay_merchant_domain: 'opillia.com.ua',
  wayforpay_test_mode: true,

  // Theme
  primary_color: '#2563eb',
  secondary_color: '#64748b',
  accent_color: '#f59e0b'
}

// GET /api/site-config
router.get('/', async (req, res) => {
  try {
    

    // Try to get existing config from database
    let config = null

    try {
      config = await prisma.siteConfig.findFirst()
    } catch (dbError) {
      
    }

    if (!config) {
      
      try {
        // Create default config if none exists
        config = await prisma.siteConfig.create({
          data: defaultConfig
        })
      } catch (createError) {
        
        // Fallback to static config with enable_dark_mode
        config = { ...defaultConfig, id: 'default', enable_dark_mode: true }
      }
    }

    // Ensure enable_dark_mode field exists (for backward compatibility)
    if (config.enable_dark_mode === undefined) {
      config.enable_dark_mode = true
    }

    
    res.json(config)
  } catch (error) {
    console.error('❌ Error fetching site config:', error)
    // Fallback to default config with enable_dark_mode
    const fallbackConfig = { ...defaultConfig, id: 'default', enable_dark_mode: true }
    res.json(fallbackConfig)
  }
})

// PUT /api/site-config
router.put('/', async (req, res) => {
  try {
    

    let updatedConfig = null

    try {
      // Get existing config or create default
      let existingConfig = await prisma.siteConfig.findFirst()

      if (!existingConfig) {
        
        existingConfig = await prisma.siteConfig.create({
          data: defaultConfig
        })
      }

      // Update the configuration
      updatedConfig = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...req.body,
          updated_at: new Date()
        }
      })
    } catch (dbError) {
      
      // Fallback: return the updated config without saving to database
      updatedConfig = {
        ...defaultConfig,
        ...req.body,
        id: 'default',
        enable_dark_mode: req.body.enable_dark_mode !== undefined ? req.body.enable_dark_mode : true,
        updated_at: new Date().toISOString()
      }
    }

    
    res.json(updatedConfig)
  } catch (error) {
    console.error('❌ Error updating site config:', error)
    res.status(500).json({ error: 'Failed to update site configuration' })
  }
})

export default router
