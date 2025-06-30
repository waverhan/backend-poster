import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestInventory() {
  try {
    console.log('🔄 Adding test inventory data...')

    // Get all products and branches
    const products = await prisma.product.findMany({
      where: { is_active: true }
    })
    
    const branches = await prisma.branch.findMany({
      where: { is_active: true }
    })

    console.log(`Found ${products.length} products and ${branches.length} branches`)

    let inventoryCount = 0

    for (const product of products) {
      for (const branch of branches) {
        // Create different inventory scenarios for testing
        let quantity = 0
        let unit = 'pcs'

        if (product.custom_quantity && product.custom_unit) {
          // Weight-based products - set inventory in kg
          unit = 'kg'
          
          // Create different scenarios:
          if (product.name.includes('Ікряники')) {
            // Ікряники: Only 0.1kg available (enough for 2 pieces of 50g each)
            quantity = 0.1
          } else if (product.name.includes('Павутинка')) {
            // Павутинка: 0.15kg available (enough for 3 pieces of 50g each)
            quantity = 0.15
          } else if (product.name.includes('Креветка')) {
            // Креветка: 0.25kg available (enough for 5 pieces of 50g each)
            quantity = 0.25
          } else {
            // Other weight-based products: random amount between 0.05kg and 1kg
            quantity = Math.random() * 0.95 + 0.05
          }
        } else {
          // Regular products - set inventory in pieces
          unit = 'pcs'
          
          // Random quantity between 0 and 50 pieces
          quantity = Math.floor(Math.random() * 51)
        }

        // Create or update inventory
        await prisma.productInventory.upsert({
          where: {
            product_id_branch_id: {
              product_id: product.id,
              branch_id: branch.id
            }
          },
          update: {
            quantity,
            unit
          },
          create: {
            product_id: product.id,
            branch_id: branch.id,
            quantity,
            unit
          }
        })

        inventoryCount++
        
        if (product.custom_quantity) {
          console.log(`📦 ${product.display_name} in ${branch.name}: ${quantity}${unit} (${Math.floor(quantity / product.custom_quantity)} pieces available)`)
        } else {
          console.log(`📦 ${product.display_name} in ${branch.name}: ${quantity} ${unit}`)
        }
      }
    }

    console.log(`\n✅ Created ${inventoryCount} inventory records`)
    console.log('\n🧪 Test scenarios created:')
    console.log('• Ікряники: 0.1kg (2 pieces of 50g available)')
    console.log('• Павутинка: 0.15kg (3 pieces of 50g available)')
    console.log('• Креветка: 0.25kg (5 pieces of 50g available)')
    console.log('• Other products: Random quantities')
    console.log('\n🎯 Try adding 5 pieces of Ікряники to test inventory validation!')

  } catch (error) {
    console.error('❌ Failed to add test inventory:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestInventory()
