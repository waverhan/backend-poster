import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createGiftSet() {
  try {
    console.log('🎁 Creating Подарунковий Набір Опілля gift set...')

    // Product IDs from the database
    const bundleItems = [
      { product_id: 'cmclpsxei000vstlkaebkdlwb', quantity: 1 }, // Бокал на нiжцi - 99 UAH
      { product_id: 'cmclpwlgp0064stlkd54aahl6', quantity: 1 }, // Пиво Опілля `Корифей` 0,5 л (скло) - 39 UAH
      { product_id: 'cmclpwc1x005qstlk16k7cazz', quantity: 1 }, // Пиво Опілля "Портер" 0,5л. скло - 51 UAH
      { product_id: 'cmclpwpi40068stlkuwitulv5', quantity: 1 }, // Пиво Опілля `Фірмове` 0,5 л (скло) - 45 UAH
      { product_id: 'cmfw6heh3xnadxc2e6f5iwn14', quantity: 1 }  // Пиво світле "Опілля Корифей Односолодове" - 46 UAH
    ]

    // Calculate total price: 99 + 39 + 51 + 45 + 46 = 280 UAH
    const totalPrice = 280
    // Set gift set price with discount (e.g., 10% off)
    const giftSetPrice = 250

    const giftSet = await prisma.product.create({
      data: {
        category_id: 'cmclpsjhk0006stlkmznhnuqw', // У пляшці/банці category
        name: 'Подарунковий Набір Опілля',
        display_name: 'Подарунковий Набір Опілля',
        slug: 'podarunkovyi-nabir-opillya',
        description: 'Подарунковий набір включає: бокал на ніжці та 4 види пива Опілля (Корифей, Портер, Фірмове, Корифей Односолодове) по 0,5л у склі. Ідеальний подарунок для справжніх цінителів якісного пива!',
        subtitle: 'Бокал + 4 види пива 0,5л',
        price: giftSetPrice,
        original_price: totalPrice,
        image_url: 'https://opillia.com.ua/wp-content/uploads/2024/11/gift-set.jpg', // You'll need to upload an image
        display_image_url: 'https://opillia.com.ua/wp-content/uploads/2024/11/gift-set.jpg',
        is_active: true,
        is_bundle: true,
        bundle_items: JSON.stringify(bundleItems),
        is_new: true,
        new_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Show as new for 30 days
        sort_order: 1 // Show at the top
      }
    })

    console.log('✅ Gift set created successfully!')
    console.log('📦 Product ID:', giftSet.id)
    console.log('🏷️  Name:', giftSet.display_name)
    console.log('💰 Price:', giftSet.price, 'UAH (original:', totalPrice, 'UAH)')
    console.log('📦 Bundle items:', bundleItems.length)
    console.log('\nBundle contains:')
    console.log('  1. Бокал на нiжцi - 99 UAH')
    console.log('  2. Пиво Опілля `Корифей` 0,5 л (скло) - 39 UAH')
    console.log('  3. Пиво Опілля "Портер" 0,5л. скло - 51 UAH')
    console.log('  4. Пиво Опілля `Фірмове` 0,5 л (скло) - 45 UAH')
    console.log('  5. Пиво світле "Опілля Корифей Односолодове" 0,5л. скло - 46 UAH')
    console.log('\n🎉 Total savings: 30 UAH (10% discount)')

  } catch (error) {
    console.error('❌ Error creating gift set:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createGiftSet()

