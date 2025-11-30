import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCustomQuantity() {
  try {
    console.log('🔍 Checking products with custom_quantity...\n')

    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        price: { gt: 0 }
      },
      select: {
        id: true,
        display_name: true,
        name: true,
        price: true,
        custom_quantity: true,
        custom_unit: true
      }
    })

    console.log(`Total products: ${products.length}\n`)

    // Filter weight-based products
    const weightBased = products.filter(p => p.custom_quantity && p.custom_unit)
    console.log(`Weight-based products: ${weightBased.length}\n`)

    if (weightBased.length > 0) {
      console.log('Weight-based products:')
      weightBased.forEach(p => {
        const displayPrice = (p.price * p.custom_quantity).toFixed(2)
        console.log(`  - ${p.display_name}: ${p.price} UAH/kg × ${p.custom_quantity} = ${displayPrice} UAH for ${Math.round(p.custom_quantity * 1000)}${p.custom_unit}`)
      })
    }

    // Check specific products
    console.log('\n\nSpecific products:')
    const specificProducts = ['Кукурудза мед-гірчиця', 'Арахіс сир', 'Фісташки']
    for (const name of specificProducts) {
      const product = products.find(p => p.display_name === name)
      if (product) {
        console.log(`✅ ${product.display_name}:`)
        console.log(`   - Price: ${product.price}`)
        console.log(`   - Custom Quantity: ${product.custom_quantity}`)
        console.log(`   - Custom Unit: ${product.custom_unit}`)
      } else {
        console.log(`❌ ${name}: NOT FOUND`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCustomQuantity()

