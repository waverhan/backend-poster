import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...')
    
    // Check if the columns exist in the products table
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log('\n📋 Products table columns:')
    console.log('='.repeat(80))
    result.forEach(column => {
      console.log(`${column.column_name.padEnd(25)} | ${column.data_type.padEnd(20)} | ${column.is_nullable}`)
    })
    
    // Check if we can query products with new fields
    console.log('\n🧪 Testing product query with new fields...')
    try {
      const products = await prisma.product.findMany({
        take: 1,
        select: {
          id: true,
          name: true,
          is_new: true,
          new_until: true,
          sale_expires_at: true,
          custom_quantity: true,
          custom_unit: true,
          quantity_step: true
        }
      })
      console.log('✅ Successfully queried products with new fields!')
      console.log('Sample product:', products[0])
    } catch (error) {
      console.log('❌ Failed to query products with new fields:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseSchema()
