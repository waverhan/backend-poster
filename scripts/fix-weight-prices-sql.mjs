import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixWeightBasedPricesSQL() {
  try {
    console.log('🔄 Fixing weight-based product prices using SQL (converting from per 100g to per kg)...')

    // Weight-based products that need price conversion
    const weightBasedProducts = [
      'ікра мінтая',
      'ікра судака', 
      'ікра тарані',
      'Ікряники',
      'анчоус ваг.',
      'Арахіс бекон',
      'Арахіс сир', 
      'Арахіс солоний',
      'Індичка Джеркі'
    ]

    let updatedCount = 0

    for (const productName of weightBasedProducts) {
      try {
        // First, get the current price
        const result = await prisma.$queryRaw`
          SELECT name, price FROM products WHERE name = ${productName}
        `
        
        if (result.length > 0) {
          const currentPrice = result[0].price
          const newPrice = currentPrice * 10
          
          // Update price and set weight-based fields using raw SQL
          await prisma.$executeRaw`
            UPDATE products 
            SET 
              price = ${newPrice},
              custom_quantity = 0.05,
              custom_unit = 'г',
              quantity_step = 1
            WHERE name = ${productName}
          `
          
          updatedCount++
          console.log(`✅ ${productName}: ${currentPrice} UAH/100g → ${newPrice} UAH/kg (50g = ${(newPrice * 0.05).toFixed(2)} UAH)`)
        } else {
          console.log(`⚠️ Product not found: ${productName}`)
        }
      } catch (error) {
        console.log(`❌ Error updating ${productName}:`, error.message)
      }
    }

    console.log(`\n✅ Updated ${updatedCount} weight-based products`)
    console.log('\n🧪 Price conversion examples:')
    console.log('• ікра судака: 170 UAH/100g → 1700 UAH/kg (50g = 85 UAH)')
    console.log('• Ікряники: 80 UAH/100g → 800 UAH/kg (50g = 40 UAH)')
    console.log('• анчоус ваг.: 78 UAH/100g → 780 UAH/kg (50g = 39 UAH)')
    console.log('\n🎯 Now the prices correctly show per kg with 50g portion pricing!')

    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const updatedProducts = await prisma.$queryRaw`
      SELECT name, price, custom_quantity, custom_unit 
      FROM products 
      WHERE custom_quantity IS NOT NULL
      LIMIT 5
    `
    
    console.log('Updated products:')
    updatedProducts.forEach(product => {
      console.log(`• ${product.name}: ${product.price} UAH/kg, ${product.custom_quantity}kg per ${product.custom_unit}`)
    })

  } catch (error) {
    console.error('❌ Failed to fix weight-based prices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixWeightBasedPricesSQL()
