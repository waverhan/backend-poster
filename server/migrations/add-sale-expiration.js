import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSaleExpirationField() {
  console.log('🔥 Adding sale_expires_at field to products table...')

  try {
    // Check if the field already exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'sale_expires_at'
    `

    if (result.length > 0) {
      console.log('✅ sale_expires_at field already exists')
      return
    }

    // Add the field
    await prisma.$executeRaw`
      ALTER TABLE products 
      ADD COLUMN sale_expires_at TIMESTAMP
    `

    console.log('✅ Successfully added sale_expires_at field to products table')

    // Set some example sale expirations for testing
    const saleProducts = await prisma.product.findMany({
      where: {
        AND: [
          {
            original_price: {
              not: null
            }
          },
          {
            price: {
              lt: prisma.product.fields.original_price
            }
          }
        ]
      },
      take: 5 // Just first 5 for testing
    })

    if (saleProducts.length > 0) {
      console.log(`🔥 Setting test expiration dates for ${saleProducts.length} sale products...`)
      
      for (const product of saleProducts) {
        // Set expiration to 24 hours from now for testing
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { sale_expires_at: expirationDate }
        })
        
        console.log(`🔥 Set expiration for ${product.name} to ${expirationDate}`)
      }
    }

  } catch (error) {
    console.error('❌ Error adding sale_expires_at field:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addSaleExpirationField()
