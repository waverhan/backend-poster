import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCurrentDatabase() {
  try {
    console.log('🔍 Checking current database content...')

    // Get all products
    const products = await prisma.product.findMany({
      take: 20,
      select: {
        name: true,
        display_name: true,
        price: true,
        poster_product_id: true
      }
    })

    console.log(`📦 Found ${products.length} products in current database:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.display_name}) - ${product.price} UAH [Poster ID: ${product.poster_product_id || 'N/A'}]`)
    })

    // Check if these are test products or real Poster products
    const posterProducts = products.filter(p => p.poster_product_id)
    const testProducts = products.filter(p => !p.poster_product_id)

    console.log(`\n📊 Database analysis:`)
    console.log(`- Products with Poster ID: ${posterProducts.length}`)
    console.log(`- Test products (no Poster ID): ${testProducts.length}`)

    if (testProducts.length > 0) {
      console.log(`\n⚠️ Test products found:`)
      testProducts.forEach(p => console.log(`  - ${p.name}`))
    }

    // Get total count
    const totalCount = await prisma.product.count()
    console.log(`\n📈 Total products in database: ${totalCount}`)

  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentDatabase()
