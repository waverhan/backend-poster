import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listProducts() {
  try {
    console.log('🔄 Listing products from database...')

    // Get first 20 products with basic fields
    const products = await prisma.product.findMany({
      take: 20,
      select: {
        name: true,
        display_name: true,
        price: true
      }
    })

    console.log(`📦 Found ${products.length} products:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.display_name}) - ${product.price} UAH`)
    })

    // Weight-based products that need price conversion (from screenshots)
    const weightBasedProductNames = [
      'ікра судака',
      'ікра тарані',
      'Ікряники',
      'анчоус ваг.'
    ]

    console.log(`\n🏋️ Weight-based products that need price conversion:`)
    for (const productName of weightBasedProductNames) {
      const product = products.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase()) ||
        p.display_name.toLowerCase().includes(productName.toLowerCase())
      )

      if (product) {
        const currentPrice = product.price
        const displayPrice = currentPrice * 10 // Convert from per-100g to per-kg
        console.log(`• ${product.display_name}: ${currentPrice} UAH/100g → should show ${displayPrice} UAH/kg`)
      } else {
        console.log(`• ${productName}: NOT FOUND`)
      }
    }

    // Search for specific products
    console.log('\n🔍 Searching for weight-based candidates...')
    const candidates = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'кра' } },
          { name: { contains: 'анчоус' } },
          { name: { contains: 'Арахіс' } },
          { name: { contains: 'ікра' } },
          { name: { contains: 'Ікра' } }
        ]
      },
      select: {
        name: true,
        display_name: true,
        price: true
      }
    })

    console.log(`🎯 Found ${candidates.length} potential weight-based products:`)
    candidates.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" - ${product.price} UAH`)
    })

  } catch (error) {
    console.error('❌ Failed to list products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listProducts()
