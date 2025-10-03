import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNewProductFields() {
  console.log('🔄 Adding new product fields (is_new, new_until)...')

  try {
    // Add the new fields to the products table
    await prisma.$executeRaw`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS new_until TIMESTAMP
    `

    console.log('✅ Successfully added new product fields!')

    // Optionally mark recently created products as new (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUntilDate = new Date()
    newUntilDate.setDate(newUntilDate.getDate() + 14) // Show as new for 14 days

    const recentProducts = await prisma.product.updateMany({
      where: {
        created_at: {
          gte: sevenDaysAgo
        },
        poster_product_id: null // Only manually created products
      },
      data: {
        is_new: true,
        new_until: newUntilDate
      }
    })

    console.log(`✅ Marked ${recentProducts.count} recent products as new!`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
addNewProductFields()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
