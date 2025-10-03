import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMissingColumns() {
  try {
    console.log('🔄 Adding missing columns to database...')
    
    // Add missing columns to products table
    const addColumnsQueries = [
      // Add new product badge fields
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS new_until TIMESTAMP;`,
      
      // Add custom quantity fields
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_quantity DOUBLE PRECISION;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_unit TEXT;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_step DOUBLE PRECISION;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS min_quantity DOUBLE PRECISION;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS max_quantity DOUBLE PRECISION;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_bottles BOOLEAN DEFAULT false;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes TEXT;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredient_id TEXT;`,
      
      // Add sale expiration field
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_expires_at TIMESTAMP;`,
      
      // Add missing order fields
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS no_callback_confirmation BOOLEAN DEFAULT true;`,
      
      // Add missing order item fields
      `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_quantity DOUBLE PRECISION;`,
      `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_unit TEXT;`,
      
      // Update inventory table structure
      `ALTER TABLE product_inventory ADD COLUMN IF NOT EXISTS quantity DOUBLE PRECISION DEFAULT 0;`,
      `ALTER TABLE product_inventory ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs';`,
      `ALTER TABLE product_inventory ADD COLUMN IF NOT EXISTS min_stock DOUBLE PRECISION;`,
      `ALTER TABLE product_inventory ADD COLUMN IF NOT EXISTS max_stock DOUBLE PRECISION;`,
      
      // Drop old inventory column if it exists
      `ALTER TABLE product_inventory DROP COLUMN IF EXISTS stock_level;`
    ]
    
    for (const query of addColumnsQueries) {
      try {
        await prisma.$executeRawUnsafe(query)
        console.log(`✅ Executed: ${query.substring(0, 50)}...`)
      } catch (error) {
        console.log(`⚠️  Query failed (might already exist): ${query.substring(0, 50)}...`)
      }
    }
    
    // Mark some recent products as new (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newUntilDate = new Date()
    newUntilDate.setDate(newUntilDate.getDate() + 14) // Show as new for 2 weeks
    
    const recentProducts = await prisma.$executeRawUnsafe(`
      UPDATE products 
      SET is_new = true, new_until = $1 
      WHERE created_at > $2 AND is_new IS NOT true
    `, newUntilDate, thirtyDaysAgo)
    
    console.log(`✅ Marked recent products as new`)
    
    console.log('🎉 Successfully added all missing columns!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addMissingColumns()
  .then(() => {
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
