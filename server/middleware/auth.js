import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      })
    }

    // Check if it's an admin token (starts with 'admin_token_')
    if (token.startsWith('admin_token_')) {
      // Admin token - create a mock admin user
      req.user = {
        id: 'admin',
        phone: '+380973244668',
        name: 'Administrator',
        email: 'admin@opillia.com.ua',
        role: 'admin',
        poster_client_id: null
      }
      return next()
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        poster_client_id: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    // Add user to request object
    req.user = user
    next()

  } catch (error) {
    console.error('❌ Token verification failed:', error)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    })
  }

  next()
}

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      req.user = null
      return next()
    }

    // Check if it's an admin token (starts with 'admin_token_')
    if (token.startsWith('admin_token_')) {
      // Admin token - create a mock admin user
      req.user = {
        id: 'admin',
        phone: '+380973244668',
        name: 'Administrator',
        email: 'admin@opillia.com.ua',
        role: 'admin',
        poster_client_id: null
      }
      return next()
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        poster_client_id: true
      }
    })

    req.user = user || null
    next()

  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null
    next()
  }
}
