import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { prisma } from '../services/database.js'

const router = express.Router()

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/site')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for site image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const type = req.body.type || 'image'
    const sanitizedType = type.replace(/[^a-zA-Z0-9]/g, '_')
    cb(null, `${sanitizedType}_${timestamp}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Default site configuration
const defaultConfig = {
  // Branding
  site_name: 'Опілля',
  site_description: 'Найкращі напої з доставкою по Києву',
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',

  // SEO
  seo_title: 'Опілля - Найкращі напої з доставкою',
  seo_description: 'Замовляйте найкращі напої з доставкою по Києву. Швидка доставка, свіжі продукти, AI-помічник для вибору.',
  seo_keywords: 'напої, доставка, Київ, пиво, вино, крафт, Опілля',
  og_image_url: '/og-image.jpg',

  // Homepage
  homepage_type: 'landing', // 'landing' or 'shop'
  hero_title: 'Найкращі напої з доставкою',
  hero_subtitle: 'Швидка доставка свіжих напоїв по Києву з AI-помічником для вибору',
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
  show_fallback_banner: false, // Don't show fallback banner by default

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
      if (config) {
        
      }
    } catch (dbError) {
      console.error('❌ Database error fetching site config:', dbError.message)
    }

    if (!config) {
      
      try {
        // Create default config if none exists
        config = await prisma.siteConfig.create({
          data: defaultConfig
        })
        
      } catch (createError) {
        console.error('❌ Error creating default config:', createError.message)
        // Fallback to static config with enable_dark_mode
        config = { ...defaultConfig, id: 'default', enable_dark_mode: true }
      }
    }

    // Ensure enable_dark_mode field exists (for backward compatibility)
    if (config.enable_dark_mode === undefined) {
      config.enable_dark_mode = true
    }

    // Convert DateTime objects to ISO strings for JSON serialization
    if (config.created_at && typeof config.created_at === 'object' && config.created_at.toISOString) {
      config.created_at = config.created_at.toISOString()
    }
    if (config.updated_at && typeof config.updated_at === 'object' && config.updated_at.toISOString) {
      config.updated_at = config.updated_at.toISOString()
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

      // Filter out invalid fields (id, created_at, updated_at should not be updated)
      const updateData = {}
      const validFields = Object.keys(defaultConfig)

      for (const key of Object.keys(req.body)) {
        if (validFields.includes(key) && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          updateData[key] = req.body[key]
        }
      }

      // Update the configuration
      updatedConfig = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: updateData
      })
      
    } catch (dbError) {
      console.error('❌ Database error updating site config:', dbError.message)
      console.error('❌ Error details:', dbError)
      throw dbError
    }

    // Convert DateTime objects to ISO strings for JSON serialization
    if (updatedConfig.created_at) {
      updatedConfig.created_at = updatedConfig.created_at.toISOString()
    }
    if (updatedConfig.updated_at) {
      updatedConfig.updated_at = updatedConfig.updated_at.toISOString()
    }

    res.json(updatedConfig)
  } catch (error) {
    console.error('❌ Error updating site config:', error)
    res.status(500).json({ error: 'Failed to update site configuration', details: error.message })
  }
})

// POST /api/site-config/upload-image - Upload site images (logo, favicon, hero banner)
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const imageUrl = `/images/site/${req.file.filename}`

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('❌ Error uploading site image:', error)
    res.status(500).json({ error: 'Failed to upload image', details: error.message })
  }
})

export default router
