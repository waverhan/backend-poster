const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSpecificProducts() {
  try {
    console.log('🔄 Fixing specific products that should be sold by piece...')

    // Products that should be sold by piece (not weight-based)
    const pieceProducts = [
      'Індичка Джеркі',
      'Big Bob'
    ]

    let fixedCount = 0

    for (const productName of pieceProducts) {
      try {
        // Find products containing this name
        const products = await prisma.product.findMany({
          where: { 
            name: { contains: productName }
          },
          select: {
            id: true,
            name: true,
            price: true,
            custom_quantity: true,
            custom_unit: true,
            attributes: true
          }
        })

        console.log(`🔍 Found ${products.length} products matching "${productName}":`)

        for (const product of products) {
          console.log(`• ${product.name}`)
          console.log(`  Current price: ${product.price} UAH`)
          console.log(`  Current custom_quantity: ${product.custom_quantity}`)
          console.log(`  Current custom_unit: ${product.custom_unit}`)

          // Check ingredient_unit from attributes
          let ingredientUnit = 'N/A'
          if (product.attributes) {
            try {
              const attrs = JSON.parse(product.attributes)
              ingredientUnit = attrs.ingredient_unit || 'N/A'
            } catch (e) {
              console.log(`  ⚠️ Invalid attributes JSON`)
            }
          }
          console.log(`  ingredient_unit from Poster: ${ingredientUnit}`)

          // If ingredient_unit is not 'kg', this should be piece-based
          if (ingredientUnit !== 'kg' && product.custom_quantity !== null) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                custom_quantity: null,
                custom_unit: null,
                quantity_step: 1
              }
            })
            console.log(`  ✅ Fixed: Set as piece-based (ingredient_unit: ${ingredientUnit})`)
            fixedCount++
          } else if (ingredientUnit === 'kg' && product.custom_quantity === null) {
            console.log(`  ⚠️ This product has ingredient_unit=kg but is not weight-based. Check manually.`)
          } else {
            console.log(`  ✓ Already correctly configured`)
          }
          console.log('')
        }

      } catch (error) {
        console.log(`❌ Error processing ${productName}:`, error.message)
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} products`)

    // Verify the specific products
    console.log('\n🔍 Final verification:')
    const verifyProducts = await prisma.product.findMany({
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

    verifyProducts.forEach(product => {
      const isWeightBased = product.custom_quantity !== null
      let ingredientUnit = 'N/A'
      if (product.attributes) {
        try {
          const attrs = JSON.parse(product.attributes)
          ingredientUnit = attrs.ingredient_unit || 'N/A'
        } catch (e) {
          // ignore
        }
      }
      
      console.log(`• ${product.name}:`)
      console.log(`  Price: ${product.price} UAH ${isWeightBased ? 'per weight' : 'per piece'}`)
      console.log(`  ingredient_unit: ${ingredientUnit}`)
      console.log(`  Weight-based: ${isWeightBased ? 'Yes' : 'No'}`)
      
      // Check if configuration matches ingredient_unit
      const shouldBeWeightBased = ingredientUnit === 'kg'
      if (isWeightBased === shouldBeWeightBased) {
        console.log(`  Status: ✅ Correctly configured`)
      } else {
        console.log(`  Status: ❌ Incorrectly configured`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Failed to fix products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificProducts()
