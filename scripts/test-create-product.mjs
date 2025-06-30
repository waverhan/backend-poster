import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCreateProduct() {
  try {
    console.log('🔄 Testing product creation with custom fields...')

    // First, create a category
    const category = await prisma.category.create({
      data: {
        name: 'Test Snacks',
        display_name: 'Test Snacks',
        is_active: true
      }
    })

    console.log('✅ Created category:', category.name)

    // Try to create a product with custom fields
    const product = await prisma.product.create({
      data: {
        category_id: category.id,
        name: 'Test Weight Product',
        display_name: 'Test Weight Product',
        description: 'Test product with weight-based pricing',
        price: 800,
        is_active: true,
        custom_quantity: 0.05,
        custom_unit: 'г',
        quantity_step: 1
      }
    })

    console.log('✅ Created product with custom fields:')
    console.log(JSON.stringify(product, null, 2))

  } catch (error) {
    console.error('❌ Failed to create product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateProduct()
