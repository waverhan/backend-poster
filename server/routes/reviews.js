import express from 'express'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const router = express.Router()
const prisma = new PrismaClient()

// reCAPTCHA v2 verification
async function verifyRecaptcha(token) {
  try {
    const secretKey = '6LfM8N4rAAAAADWA0xvW03V7r6HP1PXuO9KyHRiO'
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: token
      }
    })
    
    return response.data.success
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

// Submit a new review
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      order_id,
      rating,
      title,
      comment,
      email,
      phone,
      recaptcha_response
    } = req.body

    // Validate required fields
    if (!product_id || !rating || !email) {
      return res.status(400).json({
        error: 'Missing required fields: product_id, rating, email'
      })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      })
    }

    // Verify reCAPTCHA
    if (!recaptcha_response) {
      return res.status(400).json({
        error: 'reCAPTCHA verification required'
      })
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptcha_response)
    if (!isRecaptchaValid) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed'
      })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      })
    }

    // Check if order exists and is valid (if order_id provided)
    let verified_purchase = false
    if (order_id) {
      const order = await prisma.order.findFirst({
        where: {
          id: order_id,
          items: {
            some: {
              product_id: product_id
            }
          }
        }
      })

      if (order) {
        verified_purchase = true
      }
    }

    // Extract customer name from email (simple approach)
    const customer_name = email.split('@')[0]

    // Create the review
    const review = await prisma.review.create({
      data: {
        product_id,
        order_id: order_id || null,
        customer_name,
        customer_email: email,
        customer_phone: phone || null,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
        verified_purchase,
        status: 'approved' // Auto-approve for now, can be changed to 'pending'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true
          }
        }
      }
    })

    res.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('Error creating review:', error)
    res.status(500).json({
      error: 'Failed to create review',
      details: error.message
    })
  }
})

// Get reviews for a product
router.get('/', async (req, res) => {
  try {
    const {
      product_id,
      page = 1,
      limit = 10,
      rating,
      verified_only,
      sort_by = 'newest'
    } = req.query

    if (!product_id) {
      return res.status(400).json({
        error: 'product_id is required'
      })
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build where clause
    const where = {
      product_id,
      status: 'approved'
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    if (verified_only === 'true') {
      where.verified_purchase = true
    }

    // Build order clause
    let orderBy = {}
    switch (sort_by) {
      case 'oldest':
        orderBy = { created_at: 'asc' }
        break
      case 'highest_rating':
        orderBy = { rating: 'desc' }
        break
      case 'lowest_rating':
        orderBy = { rating: 'asc' }
        break
      case 'most_helpful':
        orderBy = { helpful_votes: 'desc' }
        break
      default: // newest
        orderBy = { created_at: 'desc' }
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip: offset,
      take: limitNum,
      include: {
        response: true
      }
    })

    // Get total count
    const total = await prisma.review.count({ where })

    res.json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({
      error: 'Failed to fetch reviews',
      details: error.message
    })
  }
})

// Get review statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const reviews = await prisma.review.findMany({
      where: {
        product_id: productId,
        status: 'approved'
      },
      select: {
        rating: true
      }
    })

    if (reviews.length === 0) {
      return res.json({
        product_id: productId,
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      })
    }

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      ratingDistribution[review.rating]++
    })

    res.json({
      product_id: productId,
      total_reviews: totalReviews,
      average_rating: parseFloat(averageRating.toFixed(1)),
      rating_distribution: ratingDistribution
    })

  } catch (error) {
    console.error('Error fetching review stats:', error)
    res.status(500).json({
      error: 'Failed to fetch review stats',
      details: error.message
    })
  }
})

// Get recent reviews
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query

    const reviews = await prisma.review.findMany({
      where: {
        status: 'approved'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: parseInt(limit),
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true,
            display_image_url: true
          }
        }
      }
    })

    res.json({
      reviews
    })

  } catch (error) {
    console.error('Error fetching recent reviews:', error)
    res.status(500).json({
      error: 'Failed to fetch recent reviews',
      details: error.message
    })
  }
})

// Import Untappd reviews for a product (admin endpoint)
router.post('/import-untappd/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { untappd_beer_id } = req.body

    if (!untappd_beer_id) {
      return res.status(400).json({
        error: 'untappd_beer_id is required'
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

    // Fetch Untappd reviews
    const untappdUrl = `https://untappd.com/b/beer/${untappd_beer_id}`
    console.log(`Fetching Untappd reviews from: ${untappdUrl}`)

    const response = await axios.get(untappdUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const importedReviews = []

    // Extract reviews from the HTML structure you provided
    $('#main-stream .item[id*="checkin_"]').each((i, el) => {
      if (i >= 3) return false // Only import first 3 reviews

      const $item = $(el)

      // Extract user info
      const userName = $item.find('.text .user').first().text().trim() || 'Anonymous'
      const userAvatar = $item.find('.avatar-holder img').attr('src') || ''

      // Extract rating
      let rating = 0
      const ratingElement = $item.find('.caps[data-rating]')
      if (ratingElement.length) {
        const ratingValue = ratingElement.attr('data-rating')
        if (ratingValue) {
          rating = Math.round(parseFloat(ratingValue)) // Convert to 1-5 scale
        }
      }

      // Extract comment
      const comment = $item.find('.checkin-comment .comment-text').text().trim()

      // Extract date
      let createdAt = new Date()
      const timeElement = $item.find('.time[data-gregtime]')
      if (timeElement.length) {
        const gregTime = timeElement.attr('data-gregtime')
        if (gregTime) {
          createdAt = new Date(gregTime)
        }
      }

      // Only import reviews with meaningful comments and ratings
      if (comment && comment.length > 10 && rating > 0) {
        importedReviews.push({
          userName,
          userAvatar,
          rating,
          comment,
          createdAt
        })
      }
    })

    // Save reviews to database
    const savedReviews = []
    for (const reviewData of importedReviews) {
      try {
        const review = await prisma.review.create({
          data: {
            product_id: productId,
            customer_name: reviewData.userName,
            customer_email: `${reviewData.userName.toLowerCase().replace(/\s+/g, '')}@untappd.imported`,
            rating: reviewData.rating,
            comment: reviewData.comment,
            verified_purchase: false,
            status: 'approved',
            created_at: reviewData.createdAt
          }
        })
        savedReviews.push(review)
      } catch (error) {
        console.error('Error saving review:', error)
      }
    }

    res.json({
      success: true,
      imported_count: savedReviews.length,
      reviews: savedReviews
    })

  } catch (error) {
    console.error('Error importing Untappd reviews:', error)
    res.status(500).json({
      error: 'Failed to import Untappd reviews',
      details: error.message
    })
  }
})

// Test endpoint to create reviews without reCAPTCHA (for development)
router.post('/test', async (req, res) => {
  try {
    const {
      product_id,
      rating,
      title,
      comment,
      customer_name,
      email
    } = req.body

    // Validate required fields
    if (!product_id || !rating || !email) {
      return res.status(400).json({
        error: 'Missing required fields: product_id, rating, email'
      })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      })
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        product_id,
        customer_name: customer_name || email.split('@')[0],
        customer_email: email,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
        verified_purchase: false,
        status: 'approved'
      }
    })

    res.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('Error creating test review:', error)
    res.status(500).json({
      error: 'Failed to create review',
      details: error.message
    })
  }
})

export default router
