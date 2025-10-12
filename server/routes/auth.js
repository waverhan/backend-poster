import express from 'express'
import authService from '../services/authService.js'
import smsFlyService from '../services/smsFlyService.js'
import posterClientService from '../services/posterClientService.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const router = express.Router()

// GET /api/auth/test-sms - Test SMS-Fly connection (development only)
router.get('/test-sms', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint not available in production' })
    }

    console.log('🧪 Testing SMS-Fly connection...')
    const testResult = await smsFlyService.testConnection()

    res.json({
      success: testResult.success,
      message: testResult.success ? 'SMS-Fly connection successful' : 'SMS-Fly connection failed',
      details: testResult
    })
  } catch (error) {
    console.error('❌ SMS test error:', error)
    res.status(500).json({
      error: 'SMS test failed',
      details: error.message
    })
  }
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = authService.verifyJWT(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// POST /api/auth/send-code - Send SMS verification code
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    // Validate phone number format
    try {
      smsFlyService.validatePhoneNumber(phone)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid phone number format' })
    }

    // Check if there's already a pending verification
    if (authService.hasPendingVerification(phone)) {
      return res.status(429).json({ 
        error: 'Verification code already sent. Please wait before requesting a new one.' 
      })
    }

    const result = await authService.sendVerificationCode(phone)
    
    res.json({
      success: true,
      message: 'Verification code sent successfully',
      phone: result.phone,
      expiresIn: result.expiresIn
    })
  } catch (error) {
    console.error('❌ Send code error:', error)
    res.status(500).json({ 
      error: 'Failed to send verification code',
      details: error.message 
    })
  }
})

// POST /api/auth/verify-code - Verify SMS code and login
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code, name } = req.body

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required' })
    }

    const result = await authService.verifyCodeAndLogin(phone, code, name)

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token,
      isNewUser: result.isNewUser
    })
  } catch (error) {
    console.error('❌ Verify code error:', error)
    res.status(400).json({
      error: 'Verification failed',
      details: error.message
    })
  }
})

// GET /api/auth/profile - Get user profile with bonus information
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const profile = await authService.getUserProfile(userId)

    res.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('❌ Get profile error:', error)
    res.status(500).json({
      error: 'Failed to get profile',
      details: error.message
    })
  }
})

// GET /api/auth/profile - Get user profile with bonus information
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user.userId)
    
    res.json({
      success: true,
      user: profile
    })
  } catch (error) {
    console.error('❌ Get profile error:', error)
    res.status(500).json({ 
      error: 'Failed to get user profile',
      details: error.message 
    })
  }
})

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body
    
    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    })
    
    // If user has Poster client ID, update Poster client too
    if (updatedUser.poster_client_id && name) {
      try {
        await posterClientService.updateClient(updatedUser.poster_client_id, {
          client_name: name,
          ...(email && { email })
        })
      } catch (error) {
        console.error('⚠️ Failed to update Poster client:', error)
      }
    }
    
    // Get updated profile with bonus info
    const profile = await authService.getUserProfile(req.user.userId)
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: profile
    })
  } catch (error) {
    console.error('❌ Update profile error:', error)
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    })
  }
})

// GET /api/auth/bonus - Get current bonus information
router.get('/bonus', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    })
    
    if (!user || !user.poster_client_id) {
      return res.json({
        success: true,
        bonusPoints: 0,
        totalPaidSum: 0,
        message: 'No bonus account found'
      })
    }
    
    const posterClient = await posterClientService.getClientDetails(user.poster_client_id)
    
    res.json({
      success: true,
      bonusPoints: parseFloat(posterClient.bonus) || 0,
      totalPaidSum: (parseFloat(posterClient.total_payed_sum) || 0) / 100, // Convert kopecks to hryvnias
      clientName: posterClient.client_name,
      phone: posterClient.phone
    })
  } catch (error) {
    console.error('❌ Get bonus error:', error)
    res.status(500).json({ 
      error: 'Failed to get bonus information',
      details: error.message 
    })
  }
})

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // We could implement a token blacklist here if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// GET /api/auth/test-services - Test SMS and Poster services (development only)
router.get('/test-services', async (req, res) => {
  try {
    console.log('🧪 Testing authentication services...')
    
    // Test SMS-Fly connection
    const smsTest = await smsFlyService.testConnection()
    
    // Test Poster API connection
    const posterTest = await posterClientService.testConnection()
    
    res.json({
      success: true,
      services: {
        smsFly: smsTest,
        poster: posterTest
      }
    })
  } catch (error) {
    console.error('❌ Service test error:', error)
    res.status(500).json({
      error: 'Service test failed',
      details: error.message
    })
  }
})

// POST /api/auth/set-password - Set password for user
router.post('/set-password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      })
    }

    const result = await authService.setUserPassword(req.user.userId, password)

    res.json({
      success: true,
      message: 'Password set successfully'
    })
  } catch (error) {
    console.error('❌ Set password error:', error)
    res.status(500).json({
      error: 'Failed to set password',
      details: error.message
    })
  }
})

// POST /api/auth/check-user - Check if user exists and has password
router.post('/check-user', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      })
    }

    // Format phone number
    const formattedPhone = smsFlyService.validatePhoneNumber(phone)

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
      select: {
        id: true,
        is_password_set: true,
        force_password_setup: true
      }
    })

    res.json({
      exists: !!user,
      hasPassword: user?.is_password_set || false,
      requiresSetup: user?.force_password_setup || false
    })
  } catch (error) {
    console.error('❌ Check user error:', error)
    res.status(500).json({
      error: 'Failed to check user',
      details: error.message
    })
  }
})

// POST /api/auth/login-password - Login with phone and password
router.post('/login-password', async (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        error: 'Phone and password are required'
      })
    }

    const result = await authService.loginWithPassword(phone, password)

    res.json(result)
  } catch (error) {
    console.error('❌ Password login error:', error)

    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found. Please register first.'
      })
    }

    if (error.message === 'Password not set. Please use SMS verification.') {
      return res.status(400).json({
        error: 'Password not set',
        requiresSmsLogin: true
      })
    }

    if (error.message === 'Invalid password') {
      return res.status(401).json({
        error: 'Invalid password'
      })
    }

    res.status(500).json({
      error: 'Login failed',
      details: error.message
    })
  }
})

export { authenticateToken }
export default router
