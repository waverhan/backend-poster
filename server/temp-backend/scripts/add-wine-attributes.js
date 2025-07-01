import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addWineAttributes() {
  try {
    // Find wine products
    const wineProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'wine' } },
          { name: { contains: 'вино' } },
          { name: { contains: 'Wine' } },
          { name: { contains: 'WINE' } },
          { display_name: { contains: 'wine' } },
          { display_name: { contains: 'вино' } },
          { display_name: { contains: 'Wine' } },
          { display_name: { contains: 'WINE' } }
        ]
      },
      take: 3
    })

    if (wineProducts.length > 0) {
      for (const wine of wineProducts) {
        const wineAttributes = [
          { name: 'Alcohol', value: '12.5', unit: '%', color: 'red' },
          { name: 'Sweetness', value: 'Dry', unit: '', color: 'green' },
          { name: 'Body', value: 'Medium', unit: '', color: 'blue' },
          { name: 'Vintage', value: '2021', unit: '', color: 'yellow' }
        ]

        await prisma.product.update({
          where: { id: wine.id },
          data: {
            attributes: JSON.stringify(wineAttributes)
          }
        })

        console.log(`✅ Added wine attributes to: ${wine.display_name}`)
      }
    }

    // Find cider products
    const ciderProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'cider' } },
          { name: { contains: 'сидр' } },
          { name: { contains: 'Cider' } },
          { name: { contains: 'CIDER' } },
          { display_name: { contains: 'cider' } },
          { display_name: { contains: 'сидр' } },
          { display_name: { contains: 'Cider' } },
          { display_name: { contains: 'CIDER' } }
        ]
      },
      take: 2
    })

    if (ciderProducts.length > 0) {
      for (const cider of ciderProducts) {
        const ciderAttributes = [
          { name: 'Alcohol', value: '4.5', unit: '%', color: 'orange' },
          { name: 'Sweetness', value: 'Semi-Sweet', unit: '', color: 'yellow' },
          { name: 'Carbonation', value: 'High', unit: '', color: 'blue' }
        ]

        await prisma.product.update({
          where: { id: cider.id },
          data: {
            attributes: JSON.stringify(ciderAttributes)
          }
        })

        console.log(`✅ Added cider attributes to: ${cider.display_name}`)
      }
    }

    // Add attributes to some random products for variety
    const randomProducts = await prisma.product.findMany({
      take: 5,
      skip: 10
    })

    const attributeVariations = [
      [
        { name: 'Quality', value: '9.2', unit: '/10', color: 'green' },
        { name: 'Popularity', value: '85', unit: '%', color: 'blue' }
      ],
      [
        { name: 'Freshness', value: 'A+', unit: '', color: 'green' },
        { name: 'Origin', value: 'Local', unit: '', color: 'yellow' }
      ],
      [
        { name: 'Strength', value: '7.8', unit: '/10', color: 'red' },
        { name: 'Smoothness', value: '8.5', unit: '/10', color: 'blue' }
      ]
    ]

    for (let i = 0; i < randomProducts.length; i++) {
      const product = randomProducts[i]
      const attributes = attributeVariations[i % attributeVariations.length]

      await prisma.product.update({
        where: { id: product.id },
        data: {
          attributes: JSON.stringify(attributes)
        }
      })

      console.log(`✅ Added variety attributes to: ${product.display_name}`)
    }

    console.log('\n🎉 Successfully added attributes to multiple products!')

  } catch (error) {
    console.error('Error adding wine attributes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addWineAttributes()
