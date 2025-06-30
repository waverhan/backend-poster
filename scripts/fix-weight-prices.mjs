import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixWeightBasedPrices() {
  try {
    console.log('🔄 Fixing weight-based product prices (converting from per 100g to per kg)...')

    // Weight-based products that need price conversion and custom quantity setup
    const weightBasedProducts = [
      // Seafood products (per 100g in POS, need *10 for per kg)
      'ікра мінтая',
      'ікра судака', 
      'ікра тарані',
      'Ікряники',
      'анчоус ваг.',
      
      // Nuts and snacks (per 100g in POS, need *10 for per kg)
      'Арахіс бекон',
      'Арахіс сир', 
      'Арахіс солоний',
      'Арахіс Смажений Big Bob Кранч 55гр',
      
      // Other weight-based products
      'Індичка Джеркі'
    ]

    let updatedCount = 0

    for (const productName of weightBasedProducts) {
      // Find the product by name (case-insensitive)
      const product = await prisma.product.findFirst({
        where: { 
          OR: [
            { name: productName },
            { name: { equals: productName, mode: 'insensitive' } }
          ]
        }
      })

      if (product) {
        const oldPrice = product.price
        const newPrice = oldPrice * 10 // Convert from per 100g to per kg
        
        // Update the product with corrected price and weight-based settings
        await prisma.product.update({
          where: { id: product.id },
          data: {
            price: newPrice,
            // Set up for 50g portions (0.05 kg)
            custom_quantity: 0.05,
            custom_unit: 'г',
            quantity_step: 1
          }
        })

        updatedCount++
        console.log(`✅ ${productName}: ${oldPrice} UAH/100g → ${newPrice} UAH/kg (50g portions = ${(newPrice * 0.05).toFixed(2)} UAH each)`)
      } else {
        console.log(`⚠️ Product not found: ${productName}`)
      }
    }

    console.log(`\n✅ Updated ${updatedCount} weight-based products`)
    console.log('\n🧪 Price conversion examples:')
    console.log('• ікра судака: 170 UAH/100g → 1700 UAH/kg (50g = 85 UAH)')
    console.log('• Ікряники: 80 UAH/100g → 800 UAH/kg (50g = 40 UAH)')
    console.log('• анчоус ваг.: 78 UAH/100g → 780 UAH/kg (50g = 39 UAH)')
    console.log('\n🎯 Now the prices correctly show per kg with 50g portion pricing!')

  } catch (error) {
    console.error('❌ Failed to fix weight-based prices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixWeightBasedPrices()
