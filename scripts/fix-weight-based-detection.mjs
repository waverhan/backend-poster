import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixWeightBasedDetection() {
  try {
    console.log('🔄 Fixing weight-based product detection using Poster API ingredient_unit...')

    // Get all products with attributes
    const products = await prisma.product.findMany({
      where: {
        attributes: { not: null }
      },
      select: {
        id: true,
        name: true,
        price: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true,
        attributes: true
      }
    })

    console.log(`🔍 Found ${products.length} products with attributes`)

    let fixedCount = 0
    let weightBasedCount = 0
    let pieceBasedCount = 0

    for (const product of products) {
      try {
        // Parse attributes to get ingredient_unit
        const attrs = JSON.parse(product.attributes)
        const ingredientUnit = attrs.ingredient_unit

        // Check if product name indicates it's a beverage (should not be weight-based even with kg unit)
        const name = product.name.toLowerCase()
        const isBeverage = name.includes('пиво') || name.includes('вино') || name.includes('сидр') ||
                          name.includes('beer') || name.includes('wine') || name.includes('cocktail') ||
                          name.includes('коктейль') || name.includes('напій') || name.includes('drink')

        // Determine if product should be weight-based
        const shouldBeWeightBased = ingredientUnit === 'kg' && !isBeverage
        const isCurrentlyWeightBased = product.custom_quantity !== null && product.custom_unit !== null

        console.log(`📦 ${product.name}:`)
        console.log(`   ingredient_unit: ${ingredientUnit}`)
        console.log(`   isBeverage: ${isBeverage}`)
        console.log(`   shouldBeWeightBased: ${shouldBeWeightBased}`)
        console.log(`   isCurrentlyWeightBased: ${isCurrentlyWeightBased}`)

        if (shouldBeWeightBased && !isCurrentlyWeightBased) {
          // Product should be weight-based but isn't - fix it
          await prisma.product.update({
            where: { id: product.id },
            data: {
              custom_quantity: 0.05, // 50g portions
              custom_unit: 'г',
              quantity_step: 1
            }
          })
          console.log(`   ✅ Fixed: Set as weight-based (50g portions)`)
          fixedCount++
          weightBasedCount++

        } else if (!shouldBeWeightBased && isCurrentlyWeightBased) {
          // Product should be piece-based but is weight-based - fix it
          await prisma.product.update({
            where: { id: product.id },
            data: {
              custom_quantity: null,
              custom_unit: null,
              quantity_step: 1
            }
          })
          console.log(`   ✅ Fixed: Set as piece-based`)
          fixedCount++
          pieceBasedCount++

        } else {
          // Product is correctly configured
          if (shouldBeWeightBased) {
            console.log(`   ✓ Already correctly set as weight-based`)
            weightBasedCount++
          } else {
            console.log(`   ✓ Already correctly set as piece-based`)
            pieceBasedCount++
          }
        }

        console.log('')

      } catch (error) {
        console.log(`❌ Error processing ${product.name}:`, error.message)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`• Total products processed: ${products.length}`)
    console.log(`• Products fixed: ${fixedCount}`)
    console.log(`• Weight-based products: ${weightBasedCount}`)
    console.log(`• Piece-based products: ${pieceBasedCount}`)

    // Show some examples of the fixed products
    console.log('\n🔍 Verifying specific products mentioned in the issue...')
    const specificProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Індичка Джеркі' } },
          { name: { contains: 'Big Bob' } }
        ]
      },
      select: {
        name: true,
        price: true,
        custom_quantity: true,
        custom_unit: true,
        attributes: true
      }
    })

    specificProducts.forEach(product => {
      const attrs = product.attributes ? JSON.parse(product.attributes) : {}
      const isWeightBased = product.custom_quantity !== null
      console.log(`• ${product.name}:`)
      console.log(`  ingredient_unit: ${attrs.ingredient_unit || 'N/A'}`)
      console.log(`  Price: ${product.price} UAH ${isWeightBased ? 'per weight' : 'per piece'}`)
      console.log(`  Weight-based: ${isWeightBased ? 'Yes' : 'No'} ${isWeightBased === (attrs.ingredient_unit === 'kg') ? '✅' : '❌'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Failed to fix weight-based detection:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixWeightBasedDetection()
