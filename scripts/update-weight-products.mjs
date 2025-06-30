import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateWeightBasedProducts() {
  try {
    console.log('🔄 Updating products with weight-based pricing...')

    // Define weight-based products with their custom quantities
    const weightBasedProducts = [
      {
        name: 'Ікряники',
        price: 800, // 800 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1
      },
      {
        name: 'анчоус ваг.',
        price: 1560, // 1560 UAH per kg (current 78 UAH for 50g)
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1
      },
      {
        name: 'Арахіс бекон',
        price: 500, // 500 UAH per kg (current 25 UAH for 50g)
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1
      },
      {
        name: 'Арахіс сир',
        price: 500, // 500 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1
      },
      {
        name: 'Арахіс солоний',
        price: 500, // 500 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1
      }
    ]

    let updatedCount = 0

    for (const productData of weightBasedProducts) {
      // Find the product by name
      const product = await prisma.product.findFirst({
        where: { name: productData.name }
      })

      if (product) {
        // Update the product with weight-based pricing
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: productData.price,
            custom_quantity: productData.custom_quantity,
            custom_unit: productData.custom_unit,
            quantity_step: productData.quantity_step
          }
        })

        updatedCount++
        console.log(`✅ Updated ${productData.name}: ${productData.price} UAH/kg, ${productData.custom_quantity * 1000}g portions`)
      } else {
        console.log(`⚠️ Product not found: ${productData.name}`)
      }
    }

    console.log(`\n✅ Updated ${updatedCount} products with weight-based pricing`)
    console.log('\n🧪 Test scenarios:')
    console.log('• Ікряники: 800 UAH/kg = 40 UAH per 50g')
    console.log('• анчоус ваг.: 1560 UAH/kg = 78 UAH per 50g')
    console.log('• Арахіс products: 500 UAH/kg = 25 UAH per 50g')
    console.log('\n🎯 Now you can test the price calculation and inventory validation!')

  } catch (error) {
    console.error('❌ Failed to update weight-based products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateWeightBasedProducts()
