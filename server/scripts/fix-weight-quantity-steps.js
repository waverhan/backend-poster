import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixWeightQuantitySteps() {
  console.log('🔧 Fixing quantity_step for weight-based products...')

  try {
    // Get all weight-based products (products with custom_quantity)
    const weightBasedProducts = await prisma.product.findMany({
      where: {
        custom_quantity: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true
      }
    })

    console.log(`📊 Found ${weightBasedProducts.length} weight-based products`)

    let updatedCount = 0

    for (const product of weightBasedProducts) {
      // For weight-based products, quantity_step should always be 1 (representing 1 piece)
      if (product.quantity_step !== 1) {
        console.log(`🔄 Updating ${product.name}: quantity_step ${product.quantity_step} → 1`)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity_step: 1 }
        })
        
        updatedCount++
      } else {
        console.log(`✅ ${product.name}: quantity_step already correct (1)`)
      }
    }

    console.log(`✅ Updated ${updatedCount} products`)
    console.log('🎉 Weight-based product quantity steps fixed!')

  } catch (error) {
    console.error('❌ Error fixing quantity steps:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixWeightQuantitySteps()
