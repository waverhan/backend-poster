import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// POST /api/fix-bundle - Fix the gift box bundle product
// Body: { product_id: "xxx", bundle_items: [{ product_id: "xxx", quantity: 1 }, ...] }
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Fixing gift box bundle product...')

    const { product_id, bundle_items } = req.body

    if (!product_id) {
      return res.status(400).json({
        success: false,
        error: 'product_id is required in request body'
      })
    }

    if (!bundle_items || !Array.isArray(bundle_items) || bundle_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'bundle_items array is required in request body',
        example: {
          product_id: 'cmiqephft0001btecg5kjduk2',
          bundle_items: [
            { product_id: 'xxx', quantity: 1 },
            { product_id: 'yyy', quantity: 1 }
          ]
        }
      })
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with ID: ${product_id}`
      })
    }

    console.log(`📦 Found product: ${product.display_name} (ID: ${product.id})`)
    console.log(`📝 Setting ${bundle_items.length} bundle items`)

    // Update the product to be a bundle
    // Set poster_product_id to null (not empty string) to avoid unique constraint issues
    // since poster_product_id has a unique constraint and empty string counts as a value
    const updated = await prisma.product.update({
      where: { id: product_id },
      data: {
        is_bundle: true,
        bundle_items: JSON.stringify(bundle_items),
        poster_product_id: null // Use null instead of empty string for unique constraint
      }
    })

    console.log(`✅ Product updated successfully`)
    console.log(`   is_bundle: ${updated.is_bundle}`)
    console.log(`   bundle_items: ${updated.bundle_items}`)

    res.json({
      success: true,
      message: 'Bundle product fixed successfully',
      product: {
        id: updated.id,
        display_name: updated.display_name,
        is_bundle: updated.is_bundle,
        bundle_items: JSON.parse(updated.bundle_items || '[]')
      }
    })

  } catch (error) {
    console.error('❌ Error fixing bundle product:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fix bundle product',
      message: error.message
    })
  }
})

export default router

