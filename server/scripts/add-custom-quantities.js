import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCustomQuantities() {
  console.log('🔄 Adding custom quantities to products...')

  try {
    // Define custom quantities for different product types
    const productUpdates = [
      // Snacks - typically sold in small portions (50g, 100g)
      {
        namePattern: 'ікряник',
        custom_quantity: 0.05, // 50g
        custom_unit: 'г',
        quantity_step: 0.05,
        min_quantity: 0.05,
        max_quantity: 0.5
      },
      {
        namePattern: 'ікра',
        custom_quantity: 0.1, // 100g
        custom_unit: 'г',
        quantity_step: 0.05,
        min_quantity: 0.05,
        max_quantity: 1.0
      },
      // Beer and beverages - typically sold in 0.5L portions
      {
        namePattern: 'пиво',
        custom_quantity: 0.5, // 500ml
        custom_unit: 'мл',
        quantity_step: 0.5,
        min_quantity: 0.5,
        max_quantity: 5.0
      },
      {
        namePattern: 'квас',
        custom_quantity: 0.5, // 500ml
        custom_unit: 'мл',
        quantity_step: 0.5,
        min_quantity: 0.5,
        max_quantity: 3.0
      },
      // Wine - typically sold in 0.75L bottles
      {
        namePattern: 'вино',
        custom_quantity: 0.75, // 750ml
        custom_unit: 'мл',
        quantity_step: 0.75,
        min_quantity: 0.75,
        max_quantity: 3.0
      },
      // Cider - typically sold in 0.5L portions
      {
        namePattern: 'сидр',
        custom_quantity: 0.5, // 500ml
        custom_unit: 'мл',
        quantity_step: 0.5,
        min_quantity: 0.5,
        max_quantity: 2.0
      }
    ]

    let updatedCount = 0

    for (const update of productUpdates) {
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

        console.log(`✅ Updated ${product.display_name}: ${update.custom_quantity}kg (${update.custom_unit})`)
        updatedCount++
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} products with custom quantities`)

    // Show summary of products with custom quantities
    const productsWithCustomQuantities = await prisma.product.findMany({
      where: {
        custom_quantity: { not: null }
      },
      select: {
        id: true,
        display_name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true,
        price: true
      }
    })

    console.log('\n📊 Products with custom quantities:')
    console.log('='.repeat(80))
    productsWithCustomQuantities.forEach(product => {
      console.log(`${product.display_name}:`)
      console.log(`  - Quantity: ${product.custom_quantity}kg (${product.custom_unit})`)
      console.log(`  - Step: ${product.quantity_step}kg`)
      console.log(`  - Price: ${product.price} UAH`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error adding custom quantities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addCustomQuantities()
