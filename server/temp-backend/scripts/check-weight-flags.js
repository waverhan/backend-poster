import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWeightFlags() {
  try {
    console.log('🔍 Checking Weight_Flag in product attributes...')
    
    // Get weight-based products
    const weightProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'ікра' } },
          { name: { contains: 'анчоус' } },
          { name: { contains: 'арахіс' } }
        ]
      },
      select: {
        name: true,
        price: true,
        attributes: true
      },
      take: 10
    })

    console.log(`📦 Found ${weightProducts.length} potential weight-based products:`)
    
    weightProducts.forEach(product => {
      console.log(`\n• ${product.name} - ${product.price} UAH`)
      
      if (product.attributes) {
        try {
          const attrs = JSON.parse(product.attributes)
          console.log(`  Attributes:`, attrs)
          
          if (attrs.Weight_Flag) {
            console.log(`  🏋️ Weight_Flag: ${attrs.Weight_Flag}`)
          } else {
            console.log(`  ⚠️ No Weight_Flag found`)
          }
        } catch (e) {
          console.log(`  ❌ Invalid JSON attributes: ${product.attributes}`)
        }
      } else {
        console.log(`  ⚠️ No attributes stored`)
      }
    })

  } catch (error) {
    console.error('❌ Error checking weight flags:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWeightFlags()
