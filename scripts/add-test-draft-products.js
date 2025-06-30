const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestDraftProducts() {
  try {
    console.log('🔄 Adding test draft beverage products...')

    // Create a beer category if it doesn't exist
    let beerCategory = await prisma.category.findFirst({
      where: { name: 'Пиво' }
    })

    if (!beerCategory) {
      beerCategory = await prisma.category.create({
        data: {
          name: 'Пиво',
          display_name: 'Пиво',
          description: 'Пивні напої',
          is_active: true,
          sort_order: 1
        }
      })
      console.log('✅ Created beer category:', beerCategory.display_name)
    }

    // Create test draft products
    const draftProducts = [
      {
        name: 'Крафтове пиво Underwood Milky Mango',
        display_name: 'Крафтове пиво Underwood Milky Mango',
        description: 'Крафтове пиво з манго, розлив',
        price: 155.00,
        unit: 'L'
      },
      {
        name: 'Сидр яблучний розлив',
        display_name: 'Сидр яблучний розлив',
        description: 'Натуральний яблучний сидр, розлив',
        price: 120.00,
        unit: 'L'
      },
      {
        name: 'Вино червоне розлив',
        display_name: 'Вино червоне розлив',
        description: 'Домашнє червоне вино, розлив',
        price: 180.00,
        unit: 'L'
      },
      {
        name: 'Квас хлібний розлив',
        display_name: 'Квас хлібний розлив',
        description: 'Традиційний хлібний квас, розлив',
        price: 45.00,
        unit: 'L'
      }
    ]

    // Get first branch for inventory
    const firstBranch = await prisma.branch.findFirst()
    if (!firstBranch) {
      console.log('❌ No branches found. Please create a branch first.')
      return
    }

    for (const productData of draftProducts) {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      })

      if (existingProduct) {
        console.log(`⏭️ Product already exists: ${productData.name}`)
        continue
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          poster_product_id: `test-draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          category_id: beerCategory.id,
          name: productData.name,
          display_name: productData.display_name,
          description: productData.description,
          price: productData.price,
          is_active: true,
          requires_bottles: true, // Enable bottle selection for draft beverages
          sort_order: 0
        }
      })

      // Create inventory for the product
      await prisma.productInventory.create({
        data: {
          product_id: product.id,
          branch_id: firstBranch.id,
          quantity: 50.0, // 50 liters available
          unit: productData.unit
        }
      })

      console.log(`✅ Created draft product: ${product.display_name}`)
    }

    console.log('\n🎉 Test draft products added successfully!')
    console.log('🍺 You can now test the bottle selection system!')

  } catch (error) {
    console.error('❌ Failed to add test products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestDraftProducts()
