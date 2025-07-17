import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addWeightBasedProducts() {
  try {
    console.log('🔄 Adding weight-based test products...')

    // Get or create a category for snacks
    let snacksCategory = await prisma.category.findFirst({
      where: { name: 'Snacks' }
    })

    if (!snacksCategory) {
      snacksCategory = await prisma.category.create({
        data: {
          name: 'Snacks',
          display_name: 'Закуски',
          description: 'Snacks and appetizers',
          is_active: true,
          sort_order: 2
        }
      })
      console.log('✅ Created Snacks category')
    }

    // Get the first branch
    const firstBranch = await prisma.branch.findFirst({
      where: { is_active: true }
    })

    if (!firstBranch) {
      console.error('❌ No active branch found')
      return
    }

    // Weight-based products to create
    const weightBasedProducts = [
      {
        name: 'Павутинка кальмара',
        display_name: 'Павутинка кальмара',
        description: 'Squid web snacks',
        price: 1200, // 1200 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1,
        inventory_kg: 0.15 // 150g available (3 pieces of 50g)
      },
      {
        name: 'Креветка сушена класична',
        display_name: 'Креветка сушена класична',
        description: 'Classic dried shrimp',
        price: 1400, // 1400 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1,
        inventory_kg: 0.25 // 250g available (5 pieces of 50g)
      },
      {
        name: 'пласт кальмара',
        display_name: 'пласт кальмара',
        description: 'Squid fillet',
        price: 1100, // 1100 UAH per kg
        custom_quantity: 0.05, // 50g portions
        custom_unit: 'г',
        quantity_step: 1,
        inventory_kg: 0.2 // 200g available (4 pieces of 50g)
      }
    ]

    for (const productData of weightBasedProducts) {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      })

      if (existingProduct) {
        console.log(`⏭️ Product ${productData.name} already exists, skipping...`)
        continue
      }

      // Create the product
      const product = await prisma.product.create({
        data: {
          category_id: snacksCategory.id,
          name: productData.name,
          display_name: productData.display_name,
          description: productData.description,
          price: productData.price,
          is_active: true,
          custom_quantity: productData.custom_quantity,
          custom_unit: productData.custom_unit,
          quantity_step: productData.quantity_step,
          unit: 'kg' // Base unit is kg
        }
      })

      // Create inventory for the product
      await prisma.productInventory.create({
        data: {
          product_id: product.id,
          branch_id: firstBranch.id,
          quantity: productData.inventory_kg,
          unit: 'kg'
        }
      })

      const maxPieces = Math.floor(productData.inventory_kg / productData.custom_quantity)
      console.log(`✅ Created ${product.display_name}: ${productData.price} UAH/kg, ${productData.inventory_kg}kg available (${maxPieces} pieces max)`)
    }

    console.log('\n🎉 Weight-based test products added successfully!')
    console.log('\n🧪 Test scenarios:')
    console.log('• Павутинка кальмара: 1200 UAH/kg, 0.15kg available (3 pieces of 50g max)')
    console.log('• Креветка сушена: 1400 UAH/kg, 0.25kg available (5 pieces of 50g max)')
    console.log('• пласт кальмара: 1100 UAH/kg, 0.2kg available (4 pieces of 50g max)')

  } catch (error) {
    console.error('❌ Failed to add weight-based products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addWeightBasedProducts()
