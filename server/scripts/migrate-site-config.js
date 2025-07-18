#!/usr/bin/env node

/**
 * Migration script to add SiteConfig table and initialize with default values
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 Starting SiteConfig migration...')

    // Check if SiteConfig table exists and has data
    const existingConfig = await prisma.siteConfig.findFirst()
    
    if (existingConfig) {
      console.log('✅ SiteConfig already exists:', existingConfig.id)
      
      // Check if enable_dark_mode field exists, if not add it
      if (existingConfig.enable_dark_mode === undefined) {
        console.log('📝 Adding enable_dark_mode field...')
        await prisma.siteConfig.update({
          where: { id: existingConfig.id },
          data: { enable_dark_mode: true }
        })
        console.log('✅ Added enable_dark_mode field')
      }
    } else {
      console.log('📝 Creating default SiteConfig...')
      
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
        homepage_type: 'landing',
        hero_title: 'Найкращі напої та делікатеси',
        hero_subtitle: 'Швидка доставка свіжих продуктів по Києву з AI-помічником для вибору',
        hero_banner_url: '/hero-banner.jpg',
        hero_cta_text: 'Почати покупки',
        
        // Contact & Footer
        company_name: 'ТОВ "Опілля Шоп"',
        company_address: 'вул. Костянтина Данькевича, 10, Київ',
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
        delivery_base_fee: 99,
        delivery_base_distance_km: 2,
        delivery_extra_fee_per_km: 30,
        free_delivery_threshold: 1000,
        
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

      const newConfig = await prisma.siteConfig.create({
        data: defaultConfig
      })
      
      console.log('✅ Created default SiteConfig:', newConfig.id)
    }

    console.log('🎉 SiteConfig migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
