import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// POST /api/fix-bundle - Fix the gift box bundle product
// Body: { bundle_items: [{ product_id: "xxx", quantity: 1 }, ...] }
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Fixing gift box bundle product...')

    const { bundle_items } = req.body

    if (!bundle_items || !Array.isArray(bundle_items) || bundle_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'bundle_items array is required in request body',
        example: {
          bundle_items: [
            { product_id: 'xxx', quantity: 1 },
            { product_id: 'yyy', quantity: 1 }
          ]
        }
      })
    }

    // Find the gift box product
    const giftBox = await prisma.product.findFirst({
      where: {
        display_name: {
          contains: 'Подарунковий Набір',
          mode: 'insensitive'
        }
      }
    })

    if (!giftBox) {
      return res.status(404).json({
        success: false,
        error: 'Gift box product not found'
      })
    }

    console.log(`📦 Found gift box: ${giftBox.display_name} (ID: ${giftBox.id})`)
    console.log(`📝 Setting ${bundle_items.length} bundle items`)

    // Update the gift box to be a bundle
    // Set poster_product_id to null (not empty string) to avoid unique constraint issues
    // since poster_product_id has a unique constraint and empty string counts as a value
    const updated = await prisma.product.update({
      where: { id: giftBox.id },
      data: {
        is_bundle: true,
        bundle_items: JSON.stringify(bundle_items),
        poster_product_id: null // Use null instead of empty string for unique constraint
      }
    })

    console.log(`✅ Gift box updated successfully`)
    console.log(`   is_bundle: ${updated.is_bundle}`)
    console.log(`   bundle_items: ${updated.bundle_items}`)

    res.json({
      success: true,
      message: 'Gift box bundle product fixed successfully',
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

