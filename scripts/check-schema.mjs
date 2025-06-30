import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSchema() {
  try {
    console.log('🔄 Checking database schema...')

    // Get a sample product to see what fields are available
    const sampleProduct = await prisma.product.findFirst()
    
    if (sampleProduct) {
      console.log('📋 Available product fields:')
      console.log(Object.keys(sampleProduct))
      console.log('\n📄 Sample product:')
      console.log(JSON.stringify(sampleProduct, null, 2))
    } else {
      console.log('❌ No products found in database')
    }

  } catch (error) {
    console.error('❌ Failed to check schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSchema()
