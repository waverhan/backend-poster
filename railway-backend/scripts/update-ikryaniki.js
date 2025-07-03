import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateIkryaniki() {
  try {
    // First find the product
    const product = await prisma.product.findFirst({
      where: { name: 'Ікряники' }
    })

    if (!product) {
      console.log('❌ Product Ікряники not found')
      return
    }

    // Update Ікряники with custom quantity
    const result = await prisma.product.update({
      where: { id: product.id },
      data: {
        custom_quantity: 0.05, // 50g
        custom_unit: 'г',
        quantity_step: 0.05,
        min_quantity: 0.05,
        max_quantity: 0.5
      }
    })

    console.log('✅ Updated Ікряники with custom quantity: 0.05kg (50г)')
    console.log('Product details:', {
      name: result.display_name,
      price: result.price,
      custom_quantity: result.custom_quantity,
      custom_unit: result.custom_unit
    })
  } catch (error) {
    console.error('❌ Error updating Ікряники:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateIkryaniki()
