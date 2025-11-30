const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Adding discount tables...')

  try {
    // Create default discounts
    const discounts = await prisma.discount.createMany({
      data: [
        {
          name: 'First Order Discount',
          type: 'first_order',
          description: '10% discount for first-time customers',
          discount_value: 10,
          discount_type: 'percentage',
          enabled: true
        },
        {
          name: 'Happy Hours',
          type: 'happy_hours',
          description: '15% discount Monday-Thursday 10:00-17:00',
          discount_value: 15,
          discount_type: 'percentage',
          day_of_week: '1,2,3,4', // Monday to Thursday
          start_time: '10:00',
          end_time: '17:00',
          enabled: true
        },
        {
          name: 'Free Delivery',
          type: 'free_delivery',
          description: 'Free delivery for orders 1500 UAH and above',
          discount_value: 0,
          discount_type: 'fixed_amount',
          min_order_amount: 1500,
          enabled: true
        },
        {
          name: 'Fixed Shipping Fee',
          type: 'fixed_shipping',
          description: '99 UAH fixed shipping for orders 700 UAH and above',
          discount_value: 99,
          discount_type: 'fixed_amount',
          min_order_amount: 700,
          enabled: true
        },
        {
          name: 'Beer Promo - Buy 1.5L Get 0.5L Free',
          type: 'beer_promo',
          description: 'Buy 1.5L get 0.5L free for bottled beer',
          discount_value: 0.5,
          discount_type: 'quantity',
          product_category: 'pivo-rozlyv',
          promo_type: 'buy_1_5_get_0_5',
          enabled: true
        },
        {
          name: 'Beer Promo - Buy 2L Get 1L Free',
          type: 'beer_promo',
          description: 'Buy 2L get 1L free for bottled beer',
          discount_value: 1,
          discount_type: 'quantity',
          product_category: 'pivo-rozlyv',
          promo_type: 'buy_2_get_1',
          enabled: true
        }
      ],
      skipDuplicates: true
    })

    console.log(`✅ Created ${discounts.count} default discounts`)
  } catch (error) {
    console.error('Error creating discounts:', error)
    throw error
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

