import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixArahisQuantity() {
  try {
    console.log('🔄 Updating Арахіс products to 100g portions (instead of 50g)...\n')

    // Products to update - only those with 50g that should be 100g
    const productsToUpdate = [
      'Арахіс сир',
      'Арахіс солоний'
    ]

    let updatedCount = 0

    for (const productName of productsToUpdate) {
      const product = await prisma.product.findFirst({
        where: { name: { contains: productName } }
      })

      if (product) {
        const oldQuantity = product.custom_quantity
        const oldPrice = product.price

        // Just update custom_quantity from 0.05 to 0.1, price stays the same
        // Price is already 250 UAH/kg, so:
        // - Old: 250 * 0.05 = 12.5 UAH for 50g
        // - New: 250 * 0.1 = 25 UAH for 100g

        await prisma.product.update({
          where: { id: product.id },
          data: {
            custom_quantity: 0.1 // 100g instead of 50g
          }
        })

        const oldDisplayPrice = (oldPrice * oldQuantity).toFixed(2)
        const newDisplayPrice = (oldPrice * 0.1).toFixed(2)
        console.log(`✅ ${product.display_name}:`)
        console.log(`   - Quantity: ${oldQuantity}kg (50g) → 0.1kg (100g)`)
        console.log(`   - Price per kg: ${oldPrice} UAH (unchanged)`)
        console.log(`   - Display price: ${oldDisplayPrice} UAH for 50g → ${newDisplayPrice} UAH for 100g\n`)

        updatedCount++
      } else {
        console.log(`⚠️ Product not found: ${productName}\n`)
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} Арахіс products!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixArahisQuantity()

