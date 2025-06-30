import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        display_name: true,
        price: true,
        custom_quantity: true,
        custom_unit: true
      },
      orderBy: {
        display_name: 'asc'
      }
    })

    console.log('All products:')
    console.log('='.repeat(80))
    products.forEach(p => {
      const customInfo = p.custom_quantity ? ` [${p.custom_quantity}kg ${p.custom_unit}]` : ' [no custom quantity]'
      console.log(`- ${p.display_name} (${p.name}) - ${p.price} UAH${customInfo}`)
    })
    
    console.log(`\nTotal: ${products.length} products`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listProducts()
