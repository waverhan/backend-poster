import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// POST /api/404-errors - Track a 404 error
router.post('/', async (req, res) => {
  try {
    const { requested_url, referrer, user_agent, ip_address } = req.body

    if (!requested_url) {
      return res.status(400).json({ error: 'requested_url is required' })
    }

    // Check if this URL already exists
    const existing = await prisma.notFoundError.findFirst({
      where: { requested_url }
    })

    if (existing) {
      // Update existing record
      const updated = await prisma.notFoundError.update({
        where: { id: existing.id },
        data: {
          count: existing.count + 1,
          last_seen: new Date(),
          referrer: referrer || existing.referrer,
          user_agent: user_agent || existing.user_agent,
          ip_address: ip_address || existing.ip_address
        }
      })
      return res.json(updated)
    }

    // Create new record
    const notFoundError = await prisma.notFoundError.create({
      data: {
        requested_url,
        referrer,
        user_agent,
        ip_address
      }
    })

    res.status(201).json(notFoundError)
  } catch (error) {
    console.error('Error tracking 404 error:', error)
    res.status(500).json({ error: 'Failed to track 404 error' })
  }
})

// GET /api/404-errors - Get all 404 errors with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = 'count' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOrder = sort === 'recent' ? 'desc' : 'desc'
    const sortBy = sort === 'recent' ? 'last_seen' : 'count'

    const [errors, total] = await Promise.all([
      prisma.notFoundError.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.notFoundError.count()
    ])

    res.json({
      data: errors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching 404 errors:', error)
    res.status(500).json({ error: 'Failed to fetch 404 errors' })
  }
})

// GET /api/404-errors/stats - Get 404 statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await prisma.notFoundError.count()
    const totalRequests = await prisma.notFoundError.aggregate({
      _sum: { count: true }
    })

    const topErrors = await prisma.notFoundError.findMany({
      take: 10,
      orderBy: { count: 'desc' }
    })

    const recentErrors = await prisma.notFoundError.findMany({
      take: 10,
      orderBy: { last_seen: 'desc' }
    })

    res.json({
      total_unique_urls: total,
      total_requests: totalRequests._sum.count || 0,
      top_errors: topErrors,
      recent_errors: recentErrors
    })
  } catch (error) {
    console.error('Error fetching 404 stats:', error)
    res.status(500).json({ error: 'Failed to fetch 404 stats' })
  }
})

// DELETE /api/404-errors/:id - Delete a 404 error record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.notFoundError.delete({
      where: { id }
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting 404 error:', error)
    res.status(500).json({ error: 'Failed to delete 404 error' })
  }
})

// DELETE /api/404-errors - Clear all 404 errors
router.delete('/', async (req, res) => {
  try {
    const result = await prisma.notFoundError.deleteMany({})
    res.json({ deleted: result.count })
  } catch (error) {
    console.error('Error clearing 404 errors:', error)
    res.status(500).json({ error: 'Failed to clear 404 errors' })
  }
})

export default router

