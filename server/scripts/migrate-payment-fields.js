#!/usr/bin/env node

// Migration script to add payment fields to existing database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migratePaymentFields() {
  try {
    console.log('🔄 Starting payment fields migration...')

    // Check if payment fields already exist in Order table
    try {
      await prisma.$queryRaw`SELECT payment_method FROM "orders" LIMIT 1`
      console.log('✅ Payment fields already exist in Order table')
    } catch (error) {
      console.log('📝 Adding payment fields to Order table...')
      
      // Add payment fields to Order table
      await prisma.$executeRaw`
        ALTER TABLE "orders" 
        ADD COLUMN IF NOT EXISTS "payment_method" TEXT DEFAULT 'cash',
        ADD COLUMN IF NOT EXISTS "payment_status" TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS "payment_transaction_id" TEXT,
        ADD COLUMN IF NOT EXISTS "payment_details" TEXT
      `
      
      console.log('✅ Payment fields added to Order table')
    }

    // Check if payment fields already exist in SiteConfig table
    try {
      await prisma.$queryRaw`SELECT enable_online_payment FROM "site_config" LIMIT 1`
      console.log('✅ Payment fields already exist in SiteConfig table')
    } catch (error) {
      console.log('📝 Adding payment fields to SiteConfig table...')
      
      // Add payment fields to SiteConfig table
      await prisma.$executeRaw`
        ALTER TABLE "site_config" 
        ADD COLUMN IF NOT EXISTS "enable_online_payment" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "wayforpay_merchant_account" TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS "wayforpay_merchant_secret" TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS "wayforpay_merchant_domain" TEXT DEFAULT 'opillia.com.ua',
        ADD COLUMN IF NOT EXISTS "wayforpay_test_mode" BOOLEAN DEFAULT true
      `
      
      console.log('✅ Payment fields added to SiteConfig table')
    }

    // Update existing orders to have default payment values
    const orderUpdateResult = await prisma.$executeRaw`
      UPDATE "orders" 
      SET 
        "payment_method" = 'cash',
        "payment_status" = 'pending'
      WHERE 
        "payment_method" IS NULL 
        OR "payment_status" IS NULL
    `
    
    console.log(`✅ Updated ${orderUpdateResult} existing orders with default payment values`)

    // Update existing site config to have default payment values
    const configUpdateResult = await prisma.$executeRaw`
      UPDATE "site_config" 
      SET 
        "enable_online_payment" = false,
        "wayforpay_merchant_account" = '',
        "wayforpay_merchant_secret" = '',
        "wayforpay_merchant_domain" = 'opillia.com.ua',
        "wayforpay_test_mode" = true
      WHERE 
        "enable_online_payment" IS NULL
    `
    
    console.log(`✅ Updated ${configUpdateResult} site config records with default payment values`)

    console.log('🎉 Payment fields migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migratePaymentFields()
  .then(() => {
    console.log('✅ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
