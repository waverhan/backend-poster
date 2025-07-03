import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCustomQuantities() {
  try {
    console.log('🔍 Checking products with custom quantities...\n')

    // Check products with custom quantities
    const customProducts = await prisma.product.findMany({
      where: {
        custom_quantity: { not: null }
      },
      select: {
        id: true,
        name: true,
        display_name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true,
        min_quantity: true,
        max_quantity: true
      }
    })

    console.log(`Found ${customProducts.length} products with custom quantities:`)
    customProducts.forEach(p => {
      console.log(`- ${p.display_name}:`)
      console.log(`  custom_quantity: ${p.custom_quantity}`)
      console.log(`  custom_unit: ${p.custom_unit}`)
      console.log(`  quantity_step: ${p.quantity_step}`)
      console.log(`  min_quantity: ${p.min_quantity}`)
      console.log(`  max_quantity: ${p.max_quantity}`)
      console.log('')
    })

    // Check specific products mentioned by user
    console.log('🔍 Checking specific products (Анчоус, ікра)...\n')

    const specificProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Анчоус' } },
          { name: { contains: 'ікра' } },
          { display_name: { contains: 'Анчоус' } },
          { display_name: { contains: 'ікра' } }
        ]
      },
      select: {
        id: true,
        name: true,
        display_name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true,
        min_quantity: true,
        max_quantity: true
      }
    })

    console.log(`Found ${specificProducts.length} matching products:`)
    specificProducts.forEach(p => {
      console.log(`- ${p.display_name}:`)
      console.log(`  custom_quantity: ${p.custom_quantity}`)
      console.log(`  custom_unit: ${p.custom_unit}`)
      console.log(`  quantity_step: ${p.quantity_step}`)
      console.log(`  min_quantity: ${p.min_quantity}`)
      console.log(`  max_quantity: ${p.max_quantity}`)
      console.log('')
    })

    // Check inventory for these products
    console.log('🔍 Checking inventory for these products...\n')

    for (const product of specificProducts) {
      const inventory = await prisma.productInventory.findMany({
        where: { product_id: product.id },
        include: {
          branch: {
            select: { name: true }
          }
        }
      })

      console.log(`Inventory for ${product.display_name}:`)
      if (inventory.length === 0) {
        console.log('  ❌ No inventory records found')
      } else {
        inventory.forEach(inv => {
          console.log(`  - ${inv.branch.name}: ${inv.quantity} ${inv.unit}`)
        })
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCustomQuantities()
