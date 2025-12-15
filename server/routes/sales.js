import express from 'express'
import { prisma } from '../index.js'

const router = express.Router()

// POST /api/sales/check-expired - Check for expired sales and revert prices
router.post('/check-expired', async (req, res) => {
  try {
    

    // Check if sale_expires_at field exists in the schema
    try {
      const schemaCheck = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'sale_expires_at'
      `

      if (schemaCheck.length === 0) {
        
        return res.json({
          success: true,
          expiredCount: 0,
          message: 'Sale expiration feature not yet implemented in database schema'
        })
      }
    } catch (schemaError) {
      
      return res.json({
        success: true,
        expiredCount: 0,
        message: 'Sale expiration feature not available'
      })
    }

    // Find products with expired sales
    const now = new Date()

    // First, get all products that might have expired sales
    const potentialExpiredProducts = await prisma.product.findMany({
      where: {
        AND: [
          {
            original_price: {
              not: null
            }
          },
          {
            sale_expires_at: {
              not: null,
              lte: now // Sale expiration time is less than or equal to now
            }
          }
        ]
      },
      include: {
        category: true
      }
    })

    // Filter products that are actually on sale (price < original_price)
    const expiredSaleProducts = potentialExpiredProducts.filter(product =>
      product.price < product.original_price
    )

    

    const revertedProducts = []

    // Revert prices for expired sales
    for (const product of expiredSaleProducts) {
      if (product.original_price && product.original_price > product.price) {
        

        const updatedProduct = await prisma.product.update({
          where: { id: product.id },
          data: {
            price: product.original_price,
            original_price: null, // Clear original price
            sale_expires_at: null // Clear expiration
          },
          include: {
            category: true
          }
        })

        revertedProducts.push(updatedProduct)
      }
    }

    res.json({
      success: true,
      message: `Reverted ${revertedProducts.length} expired sales`,
      expiredProducts: revertedProducts
    })

  } catch (error) {
    console.error('❌ Error checking expired sales:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check expired sales',
      message: error.message
    })
  }
})

// POST /api/sales/expire/:productId - Manually expire a sale for a specific product
router.post('/expire/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    if (!product.original_price || product.original_price <= product.price) {
      return res.status(400).json({
        success: false,
        error: 'Product is not currently on sale'
      })
    }

    

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        price: product.original_price,
        original_price: null,
        sale_expires_at: null
      }
    })

    res.json({
      success: true,
      message: `Sale expired for ${product.name}`,
      product: updatedProduct
    })

  } catch (error) {
    console.error('❌ Error expiring sale:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to expire sale',
      message: error.message
    })
  }
})

// POST /api/sales/set-expiration/:productId - Set sale expiration for a product
router.post('/set-expiration/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { sale_expires_at } = req.body

    if (!sale_expires_at) {
      return res.status(400).json({
        success: false,
        error: 'sale_expires_at is required'
      })
    }

    const expirationDate = new Date(sale_expires_at)
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format for sale_expires_at'
      })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        sale_expires_at: expirationDate
      }
    })

    

    res.json({
      success: true,
      message: `Sale expiration set for ${product.name}`,
      product: updatedProduct
    })

  } catch (error) {
    console.error('❌ Error setting sale expiration:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to set sale expiration',
      message: error.message
    })
  }
})

export default router
