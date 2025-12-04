import { prisma } from '../services/database.js'

async function fixCorrectBundle() {
  try {
    console.log('🔧 Fixing the correct bundle product: Подарунковий Набір Опілля')

    const productId = 'cmiqephft0001btecg5kjduk2'
    
    const bundleItems = [
      { product_id: 'cmclpsxei000vstlkaebkdlwb', quantity: 1 }, // Бокал на нiжцi
      { product_id: 'cmclpwlgp0064stlkd54aahl6', quantity: 1 }, // Пиво Опілля `Корифей` 0,5 л
      { product_id: 'cmclpwc1x005qstlk16k7cazz', quantity: 1 }, // Пиво Опілля "Портер" 0,5л
      { product_id: 'cmclpwpi40068stlkuwitulv5', quantity: 1 }, // Пиво Опілля `Фірмове` 0,5 л
      { product_id: 'cmfw6heh3xnadxc2e6f5iwn14', quantity: 1 }  // Пиво Опілля Корифей Односолодове 0,5л
    ]

    // Update the product
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        is_bundle: true,
        bundle_items: JSON.stringify(bundleItems),
        poster_product_id: null // Use null to avoid unique constraint issues
      }
    })

    console.log('✅ Product updated successfully:')
    console.log('   ID:', updated.id)
    console.log('   Name:', updated.display_name)
    console.log('   is_bundle:', updated.is_bundle)
    console.log('   poster_product_id:', updated.poster_product_id)
    console.log('   bundle_items:', updated.bundle_items)

    // Also reset the wrong bundle product
    console.log('\n🔧 Resetting the wrong bundle product: бокал подарунковий набір')
    const wrongProductId = 'cmclpsyd6000ystlkzn5ajpo7'
    
    const resetProduct = await prisma.product.update({
      where: { id: wrongProductId },
      data: {
        is_bundle: false,
        bundle_items: null,
        poster_product_id: '1000000000' // Set back to original poster_product_id
      }
    })

    console.log('✅ Wrong product reset successfully:')
    console.log('   ID:', resetProduct.id)
    console.log('   Name:', resetProduct.display_name)
    console.log('   is_bundle:', resetProduct.is_bundle)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCorrectBundle()

