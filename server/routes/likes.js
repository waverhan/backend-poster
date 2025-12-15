import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get like status for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { user_id } = req.query

    // Get total likes count
    const totalLikes = await prisma.productLike.count({
      where: { product_id: productId }
    })

    // Check if user has liked this product
    let userHasLiked = false
    if (user_id) {
      const userLike = await prisma.productLike.findFirst({
        where: {
          product_id: productId,
          user_id: user_id
        }
      })
      userHasLiked = !!userLike
    }

    res.json({
      product_id: productId,
      total_likes: totalLikes,
      user_has_liked: userHasLiked
    })

  } catch (error) {
    console.error('Error getting product likes:', error)
    res.status(500).json({
      error: 'Failed to get product likes',
      details: error.message
    })
  }
})

// Toggle like for a product
router.post('/product/:productId/toggle', async (req, res) => {
  try {
    const { productId } = req.params
    const { user_id, session_id } = req.body

    // Use user_id if available, otherwise use session_id for anonymous users
    const identifier = user_id || session_id

    if (!identifier) {
      return res.status(400).json({
        error: 'user_id or session_id is required'
      })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      })
    }

    // Check if user has already liked this product
    const existingLike = await prisma.productLike.findFirst({
      where: {
        product_id: productId,
        OR: [
          { user_id: user_id },
          { session_id: session_id }
        ]
      }
    })

    let action = ''
    let totalLikes = 0

    if (existingLike) {
      // Remove like
      await prisma.productLike.delete({
        where: { id: existingLike.id }
      })
      action = 'unliked'
    } else {
      // Add like
      await prisma.productLike.create({
        data: {
          product_id: productId,
          user_id: user_id || null,
          session_id: session_id || null
        }
      })
      action = 'liked'
    }

    // Get updated total likes count
    totalLikes = await prisma.productLike.count({
      where: { product_id: productId }
    })

    res.json({
      success: true,
      action,
      product_id: productId,
      total_likes: totalLikes,
      user_has_liked: action === 'liked'
    })

  } catch (error) {
    console.error('Error toggling product like:', error)
    res.status(500).json({
      error: 'Failed to toggle product like',
      details: error.message
    })
  }
})

// Get most liked products
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const popularProducts = await prisma.productLike.groupBy({
      by: ['product_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: parseInt(limit)
    })

    // Get product details
    const productIds = popularProducts.map(p => p.product_id)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        is_active: true
      },
      include: {
        category: true
      }
    })

    // Combine with like counts
    const result = popularProducts.map(like => {
      const product = products.find(p => p.id === like.product_id)
      return {
        product,
        like_count: like._count.id
      }
    }).filter(item => item.product) // Only include products that exist and are active

    res.json({
      popular_products: result
    })

  } catch (error) {
    console.error('Error getting popular products:', error)
    res.status(500).json({
      error: 'Failed to get popular products',
      details: error.message
    })
  }
})

// Get likes statistics
router.get('/stats', async (req, res) => {
  try {
    // Total likes count
    const totalLikes = await prisma.productLike.count()

    // Products with likes
    const productsWithLikes = await prisma.productLike.groupBy({
      by: ['product_id'],
      _count: {
        id: true
      }
    })

    // Top 10 most liked products
    const topLiked = await prisma.productLike.groupBy({
      by: ['product_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get product details for top liked
    const topProductIds = topLiked.map(p => p.product_id)
    const topProducts = await prisma.product.findMany({
      where: {
        id: { in: topProductIds }
      },
      select: {
        id: true,
        display_name: true,
        price: true
      }
    })

    const topLikedWithDetails = topLiked.map(like => {
      const product = topProducts.find(p => p.id === like.product_id)
      return {
        product_id: like.product_id,
        product_name: product?.display_name || 'Unknown',
        like_count: like._count.id
      }
    })

    res.json({
      total_likes: totalLikes,
      products_with_likes: productsWithLikes.length,
      top_liked_products: topLikedWithDetails
    })

  } catch (error) {
    console.error('Error getting likes statistics:', error)
    res.status(500).json({
      error: 'Failed to get likes statistics',
      details: error.message
    })
  }
})

export default router
