import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addProductSubtitle() {
  try {
    console.log('Adding subtitle column to products table...')
    
    // Add subtitle column to products table
    await prisma.$executeRaw`
      ALTER TABLE products 
      ADD COLUMN subtitle TEXT;
    `
    
    console.log('✅ Successfully added subtitle column to products table')
    
  } catch (error) {
    if (error.message.includes('duplicate column name') || 
        error.message.includes('already exists')) {
      console.log('ℹ️ Subtitle column already exists in products table')
    } else {
      console.error('❌ Error adding subtitle column:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addProductSubtitle()
    .then(() => {
      console.log('Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

export { addProductSubtitle }
