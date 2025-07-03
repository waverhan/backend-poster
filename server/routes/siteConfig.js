import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// Default site configuration
const defaultConfig = {
  // Branding
  site_name: 'Opillia Shop',
  site_description: 'Найкращі напої та делікатеси з доставкою по Києву',
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',

  // SEO
  seo_title: 'Opillia Shop - Найкращі напої та делікатеси',
  seo_description: 'Замовляйте найкращі напої, сири, м\'ясо та делікатеси з доставкою по Києву. Швидка доставка, свіжі продукти, AI-помічник для вибору.',
  seo_keywords: 'напої, сир, м\'ясо, делікатеси, доставка, Київ, пиво, вино, крафт',
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
  enable_ai_chat: true,
  enable_recommendations: true,
  enable_notifications: true,
  enable_dark_mode: true,

  // Theme
  primary_color: '#2563eb',
  secondary_color: '#64748b',
  accent_color: '#f59e0b'
}

// GET /api/site-config
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching site configuration...')

    // Try to get existing config from database
    let config = await prisma.siteConfig.findFirst()

    if (!config) {
      console.log('📝 No config found, creating default configuration...')
      // Create default config if none exists
      config = await prisma.siteConfig.create({
        data: defaultConfig
      })
    }

    console.log('✅ Site configuration fetched successfully')
    res.json(config)
  } catch (error) {
    console.error('❌ Error fetching site config:', error)
    res.status(500).json({ error: 'Failed to fetch site configuration' })
  }
})

// PUT /api/site-config
router.put('/', async (req, res) => {
  try {
    console.log('💾 Updating site configuration...', req.body)

    // Get existing config or create default
    let existingConfig = await prisma.siteConfig.findFirst()

    if (!existingConfig) {
      console.log('📝 No existing config, creating new one...')
      existingConfig = await prisma.siteConfig.create({
        data: defaultConfig
      })
    }

    // Update the configuration
    const updatedConfig = await prisma.siteConfig.update({
      where: { id: existingConfig.id },
      data: {
        ...req.body,
        updated_at: new Date()
      }
    })

    console.log('✅ Site configuration updated successfully')
    res.json(updatedConfig)
  } catch (error) {
    console.error('❌ Error updating site config:', error)
    res.status(500).json({ error: 'Failed to update site configuration' })
  }
})

export default router
