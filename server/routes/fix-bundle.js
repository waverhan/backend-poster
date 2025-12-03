import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// POST /api/fix-bundle - Fix the gift box bundle product
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Fixing gift box bundle product...')

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

    // Define the bundle items (5 products)
    const bundleItems = [
      { product_id: 'cm3rvqxqy0001rvqy0001rvqy', quantity: 1 }, // Example product 1
      { product_id: 'cm3rvqxqy0002rvqy0002rvqy', quantity: 1 }, // Example product 2
      { product_id: 'cm3rvqxqy0003rvqy0003rvqy', quantity: 1 }, // Example product 3
      { product_id: 'cm3rvqxqy0004rvqy0004rvqy', quantity: 1 }, // Example product 4
      { product_id: 'cm3rvqxqy0005rvqy0005rvqy', quantity: 1 }  // Example product 5
    ]

    // Update the gift box to be a bundle
    const updated = await prisma.product.update({
      where: { id: giftBox.id },
      data: {
        is_bundle: true,
        bundle_items: JSON.stringify(bundleItems),
        poster_product_id: '' // Ensure it has empty poster_product_id so sync won't overwrite it
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

