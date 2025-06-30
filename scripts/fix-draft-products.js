const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDraftProducts() {
  try {
    console.log('🔄 Fixing draft beverage products...')

    // Find products that should be draft beverages (contain "розлив" or have unit "L")
    const draftProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'розлив' } },
          { description: { contains: 'розлив' } },
          { name: { contains: 'Пиво' } },
          { name: { contains: 'пиво' } },
          { name: { contains: 'Сидр' } },
          { name: { contains: 'сидр' } },
          { name: { contains: 'Вино' } },
          { name: { contains: 'вино' } },
          { name: { contains: 'Квас' } },
          { name: { contains: 'квас' } }
        ]
      },
      include: {
        inventory: true
      }
    })

    console.log(`Found ${draftProducts.length} potential draft products`)

    let updatedCount = 0

    for (const product of draftProducts) {
      // Check if it's a draft beverage (has L unit in inventory or contains draft keywords)
      const isDraft = product.inventory.some(inv => inv.unit === 'L') ||
                     product.name.includes('розлив') ||
                     product.description?.includes('розлив')

      if (isDraft && !product.requires_bottles) {
        await prisma.product.update({
          where: { id: product.id },
          data: { requires_bottles: true }
        })

        console.log(`✅ Updated product: ${product.display_name} - now requires bottles`)
        updatedCount++
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} draft products to require bottle selection!`)

    // Also check for any products with "per L" pricing that should be draft
    const perLiterProducts = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: 'per L' } },
          { description: { contains: 'за літр' } },
          { description: { contains: 'за л' } }
        ]
      }
    })

    for (const product of perLiterProducts) {
      if (!product.requires_bottles) {
        await prisma.product.update({
          where: { id: product.id },
          data: { requires_bottles: true }
        })

        console.log(`✅ Updated per-liter product: ${product.display_name} - now requires bottles`)
        updatedCount++
      }
    }

    console.log(`\n🍺 Total products updated: ${updatedCount}`)
    console.log('🎯 Bottle selection should now work for all draft beverages!')

  } catch (error) {
    console.error('❌ Failed to fix draft products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDraftProducts()
