import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addGiftSetInventory() {
  try {
    console.log('📦 Adding inventory for Подарунковий Набір Опілля gift set...')

    const productId = 'cmiqephft0001btecg5kjduk2'
    const quantity = 50 // Set 50 units available

    // Get all branches
    const branches = await prisma.branch.findMany({
      where: { is_active: true }
    })

    console.log(`Found ${branches.length} active branches`)

    const now = new Date()

    for (const branch of branches) {
      console.log(`Adding inventory for branch: ${branch.name}`)

      await prisma.productInventory.upsert({
        where: {
          product_id_branch_id: {
            product_id: productId,
            branch_id: branch.id
          }
        },
        update: {
          quantity: quantity,
          unit: 'pcs',
          last_updated: now,
          last_sync_at: now
        },
        create: {
          product_id: productId,
          branch_id: branch.id,
          quantity: quantity,
          unit: 'pcs',
          last_updated: now,
          last_sync_at: now
        }
      })

      console.log(`✅ Added ${quantity} units for ${branch.name}`)
    }

    console.log('\n✅ Inventory added successfully for all branches!')

    // Verify the inventory
    const inventory = await prisma.productInventory.findMany({
      where: { product_id: productId },
      include: { branch: true }
    })

    console.log('\n📊 Current inventory:')
    inventory.forEach(inv => {
      console.log(`  - ${inv.branch.name}: ${inv.quantity} ${inv.unit}`)
    })

  } catch (error) {
    console.error('❌ Error adding inventory:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addGiftSetInventory()

