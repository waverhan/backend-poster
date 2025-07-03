import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSampleAttributes() {
  try {
    // Find a beer product to add attributes to
    const beerProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'beer' } },
          { name: { contains: 'пиво' } },
          { name: { contains: 'Beer' } },
          { name: { contains: 'BEER' } },
          { display_name: { contains: 'beer' } },
          { display_name: { contains: 'пиво' } },
          { display_name: { contains: 'Beer' } },
          { display_name: { contains: 'BEER' } }
        ]
      }
    })

    if (!beerProduct) {
      console.log('No beer product found, using first product instead')
      const firstProduct = await prisma.product.findFirst()
      if (!firstProduct) {
        console.log('No products found in database')
        return
      }

      // Add sample attributes to first product
      const attributes = [
        { name: 'Міцність', value: '6.5', unit: '°', color: 'red' },
        { name: 'Гіркота', value: '22', unit: ' IBU', color: 'orange' },
        { name: 'Щільність', value: '14.7', unit: '%', color: 'blue' }
      ]

      await prisma.product.update({
        where: { id: firstProduct.id },
        data: {
          attributes: JSON.stringify(attributes)
        }
      })

      console.log(`✅ Added sample attributes to product: ${firstProduct.display_name}`)
      console.log('Attributes:', attributes)
    } else {
      // Add beer-specific attributes
      const beerAttributes = [
        { name: 'Міцність', value: '6.5', unit: '°', color: 'red' },
        { name: 'Гіркота', value: '22', unit: ' IBU', color: 'orange' },
        { name: 'Щільність', value: '14.7', unit: '%', color: 'blue' }
      ]

      await prisma.product.update({
        where: { id: beerProduct.id },
        data: {
          attributes: JSON.stringify(beerAttributes)
        }
      })

      console.log(`✅ Added beer attributes to product: ${beerProduct.display_name}`)
      console.log('Attributes:', beerAttributes)
    }

    // Add attributes to a few more products for variety
    const products = await prisma.product.findMany({
      take: 3,
      skip: 1
    })

    for (const product of products) {
      const sampleAttributes = [
        { name: 'Quality', value: '8.5', unit: '/10', color: 'green' },
        { name: 'Intensity', value: '7', unit: '/10', color: 'yellow' }
      ]

      await prisma.product.update({
        where: { id: product.id },
        data: {
          attributes: JSON.stringify(sampleAttributes)
        }
      })

      console.log(`✅ Added sample attributes to: ${product.display_name}`)
    }

  } catch (error) {
    console.error('Error adding sample attributes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleAttributes()
