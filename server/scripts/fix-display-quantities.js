import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDisplayQuantities() {
  try {
    console.log('🔧 Fixing display quantities to show user-friendly units...\n')
    
    // Update products to show proper display quantities
    const updates = [
      // Snacks - show in grams (50г, 100г, etc.)
      {
        namePattern: 'ікряник',
        custom_quantity: 50, // 50г
        custom_unit: 'г',
        quantity_step: 50,
        min_quantity: 50,
        max_quantity: 500
      },
      {
        namePattern: 'Анчоус',
        custom_quantity: 50, // 50г
        custom_unit: 'г',
        quantity_step: 50,
        min_quantity: 50,
        max_quantity: 500
      },
      {
        namePattern: 'ікра',
        custom_quantity: 100, // 100г
        custom_unit: 'г',
        quantity_step: 50,
        min_quantity: 50,
        max_quantity: 1000
      },
      // Beer and beverages - show in liters (0.5L, 1L, 1.5L, 2L, etc.)
      {
        namePattern: 'пиво',
        custom_quantity: 0.5, // 0.5L
        custom_unit: 'L',
        quantity_step: 0.5,
        min_quantity: 0.5,
        max_quantity: 5.0
      },
      {
        namePattern: 'квас',
        custom_quantity: 0.5, // 0.5L
        custom_unit: 'L',
        quantity_step: 0.5,
        min_quantity: 0.5,
        max_quantity: 3.0
      }
    ]

    let updatedCount = 0

    for (const update of updates) {
      // Find products matching the pattern
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: update.namePattern } },
            { display_name: { contains: update.namePattern } }
          ]
        }
      })

      console.log(`📦 Found ${products.length} products matching "${update.namePattern}"`)

      // Update each matching product
      for (const product of products) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            custom_quantity: update.custom_quantity,
            custom_unit: update.custom_unit,
            quantity_step: update.quantity_step,
            min_quantity: update.min_quantity,
            max_quantity: update.max_quantity
          }
        })

        console.log(`✅ Updated ${product.display_name}: ${update.custom_quantity}${update.custom_unit} (step: ${update.quantity_step}${update.custom_unit})`)
        updatedCount++
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with user-friendly display quantities!`)
    
    // Show updated products
    console.log('\n📋 Updated products:')
    const updatedProducts = await prisma.product.findMany({
      where: {
        custom_quantity: { not: null }
      },
      select: {
        display_name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true,
        min_quantity: true,
        max_quantity: true
      }
    })

    updatedProducts.forEach(p => {
      console.log(`- ${p.display_name}: ${p.custom_quantity}${p.custom_unit} (${p.min_quantity}-${p.max_quantity}${p.custom_unit}, step: ${p.quantity_step}${p.custom_unit})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDisplayQuantities()
