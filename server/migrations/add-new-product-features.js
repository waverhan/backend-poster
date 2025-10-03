import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNewProductFeatures() {
  try {
    console.log('🔄 Adding new product features (new badge & sale expiration)...')

    // Add is_new column
    try {
      await prisma.$executeRaw`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false`
      console.log('✅ Added is_new column')
    } catch (error) {
      console.log('⚠️ is_new column might already exist:', error.message)
    }

    // Add new_until column
    try {
      await prisma.$executeRaw`ALTER TABLE products ADD COLUMN IF NOT EXISTS new_until TIMESTAMP`
      console.log('✅ Added new_until column')
    } catch (error) {
      console.log('⚠️ new_until column might already exist:', error.message)
    }

    // Add sale_expires_at column
    try {
      await prisma.$executeRaw`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_expires_at TIMESTAMP`
      console.log('✅ Added sale_expires_at column')
    } catch (error) {
      console.log('⚠️ sale_expires_at column might already exist:', error.message)
    }

    // Update existing products to have default values
    const updateResult = await prisma.$executeRaw`
      UPDATE products 
      SET is_new = false 
      WHERE is_new IS NULL
    `
    console.log(`✅ Updated ${updateResult} products with default is_new value`)

    console.log('🎉 New product features migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
addNewProductFeatures()
  .then(() => {
    console.log('✅ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
