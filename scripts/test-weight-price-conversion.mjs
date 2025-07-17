import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to check if a product is weight-based using stored attributes
function isWeightBasedProduct(product) {
  // Only check stored ingredient_unit from Poster API - no fallback to name-based detection
  if (product.attributes) {
    try {
      const attrs = JSON.parse(product.attributes)
      return attrs.ingredient_unit === 'kg'
    } catch (e) {
      // Invalid JSON, return false (not weight-based)
      return false
    }
  }

  // No attributes or ingredient_unit data - not weight-based
  return false
}

// Helper function to convert price from per-100g to per-kg for display
function convertWeightBasedPrice(price, product) {
  if (isWeightBasedProduct(product)) {
    return price * 10 // Convert from per-100g to per-kg
  }
  return price
}

async function testWeightPriceConversion() {
  try {
    console.log('🧪 Testing weight-based price conversion logic...')

    // Test cases based on the screenshots
    const testProducts = [
      { name: 'анчоус ваг.', price: 78 },
      { name: 'Арахіс бекон', price: 45 },
      { name: 'Арахіс сир', price: 50 },
      { name: 'Пиво звичайне', price: 55 }, // Non-weight-based for comparison
      { name: 'Вино червоне', price: 180 }  // Non-weight-based for comparison
    ]

    console.log('\n📊 Price conversion test results:')
    console.log('='.repeat(80))

    testProducts.forEach(product => {
      const isWeightBased = isWeightBasedProduct(product.name)
      const convertedPrice = convertWeightBasedPrice(product.price, product.name)
      const conversionApplied = convertedPrice !== product.price

      console.log(`${isWeightBased ? '🏋️' : '📦'} ${product.name}:`)
      console.log(`   Original: ${product.price} UAH${isWeightBased ? '/100g' : ''}`)
      console.log(`   Display:  ${convertedPrice} UAH${isWeightBased ? '/kg' : ''}`)
      console.log(`   Weight-based: ${isWeightBased ? 'YES' : 'NO'}`)
      console.log(`   Conversion: ${conversionApplied ? 'APPLIED' : 'NOT NEEDED'}`)
      
      if (isWeightBased) {
        const portionPrice = (convertedPrice * 0.05).toFixed(2) // 50g portion
        console.log(`   50g portion: ${portionPrice} UAH`)
      }
      console.log('')
    })

    console.log('✅ Price conversion logic test completed!')
    console.log('\n🎯 Expected behavior:')
    console.log('• Weight-based products (анчоус, арахіс) should show prices multiplied by 10')
    console.log('• Regular products (пиво, вино) should show original prices')
    console.log('• Weight-based products should display "per kg" instead of "per 100g"')
    console.log('• 50g portions should be calculated as (price_per_kg * 0.05)')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testWeightPriceConversion()
