import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBundleInventory() {
  try {
    console.log('🔄 Finding Подарунковий Набір Опілля product...')
    
    // Find the product
    const product = await prisma.product.findFirst({
      where: { 
        name: { contains: 'Подарунковий Набір Опілля' }
      },
      select: { id: true, name: true, is_active: true }
    })

    if (!product) {
      console.log('❌ Product not found!')
      return
    }

    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`)

    // Make sure product is active
    if (!product.is_active) {
      console.log('🔄 Activating product...')
      await prisma.product.update({
        where: { id: product.id },
        data: { is_active: true }
      })
      console.log('✅ Product activated')
    }

    // Get all active branches
    const branches = await prisma.branch.findMany({
      where: { is_active: true },
      select: { id: true, name: true }
    })

    console.log(`📦 Updating inventory for ${branches.length} branches...`)

    // Update inventory for each branch
    for (const branch of branches) {
      await prisma.productInventory.upsert({
        where: {
          product_id_branch_id: {
            product_id: product.id,
            branch_id: branch.id
          }
        },
        create: {
          product_id: product.id,
          branch_id: branch.id,
          quantity: 10000,
          unit: 'pcs'
        },
        update: {
          quantity: 10000,
          unit: 'pcs'
        }
      })
      console.log(`  ✅ ${branch.name}: 10000 pcs`)
    }

    console.log('🎉 Inventory update completed successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBundleInventory()

