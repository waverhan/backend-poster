import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPieceProducts() {
  try {
    console.log('🔄 Fixing products that should be sold by piece, not by weight...')

    // Products that should be sold by piece (not weight-based)
    const pieceProducts = [
      'Індичка Джеркі',
      'Арахіс Смажений Big Bob Кранч 55гр'
    ]

    let updatedCount = 0

    for (const productName of pieceProducts) {
      try {
        // Find the product by name (partial match)
        const product = await prisma.product.findFirst({
          where: { 
            name: { contains: productName }
          }
        })

        if (product) {
          console.log(`🔍 Found product: ${product.name}`)
          console.log(`   Current price: ${product.price} UAH`)
          console.log(`   Current custom_quantity: ${product.custom_quantity}`)
          console.log(`   Current custom_unit: ${product.custom_unit}`)

          // Reset to piece-based pricing
          await prisma.product.update({
            where: { id: product.id },
            data: {
              // Keep the current price as-is (it should be the piece price)
              custom_quantity: null,
              custom_unit: null,
              quantity_step: 1
            }
          })

          updatedCount++
          console.log(`✅ Fixed ${product.name}: Now sold by piece at ${product.price} UAH each`)
        } else {
          console.log(`⚠️ Product not found: ${productName}`)
        }
      } catch (error) {
        console.log(`❌ Error updating ${productName}:`, error.message)
      }
    }

    console.log(`\n✅ Updated ${updatedCount} products to be sold by piece`)
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const verifyProducts = await prisma.product.findMany({
      where: {
        OR: pieceProducts.map(name => ({ name: { contains: name } }))
      },
      select: {
        name: true,
        price: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true
      }
    })
    
    console.log('Updated products:')
    verifyProducts.forEach(product => {
      const isPiece = product.custom_quantity === null && product.custom_unit === null
      console.log(`• ${product.name}: ${product.price} UAH ${isPiece ? 'per piece ✅' : 'per weight ❌'}`)
    })

  } catch (error) {
    console.error('❌ Failed to fix piece products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPieceProducts()
