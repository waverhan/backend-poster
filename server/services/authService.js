import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'
import smsFlyService from './smsFlyService.js'
import posterClientService from './posterClientService.js'

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    this.verificationCodes = new Map() // In production, use Redis or database
    this.codeExpiryTime = 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  /**
   * Send SMS verification code to phone number
   * @param {string} phoneNumber - Phone number in Ukrainian format
   */
  async sendVerificationCode(phoneNumber) {
    try {
      // Validate and format phone number
      const formattedPhone = smsFlyService.validatePhoneNumber(phoneNumber)
      
      // Generate verification code
      const verificationCode = smsFlyService.generateVerificationCode()
      
      // Store verification code with expiry
      const codeData = {
        code: verificationCode,
        phone: formattedPhone,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.codeExpiryTime,
        attempts: 0,
        maxAttempts: 3
      }
      
      this.verificationCodes.set(formattedPhone, codeData)
      
      console.log(`📱 Sending verification code to ${formattedPhone}: ${verificationCode}`)
      
      // Send SMS
      const smsResult = await smsFlyService.sendVerificationSMS(formattedPhone, verificationCode)
      
      // Clean up expired codes
      this.cleanupExpiredCodes()
      
      return {
        success: true,
        phone: formattedPhone,
        message: 'Verification code sent successfully',
        expiresIn: this.codeExpiryTime / 1000 // seconds
      }
    } catch (error) {
      console.error('❌ Error sending verification code:', error)
      throw error
    }
  }

  /**
   * Verify SMS code and authenticate user
   * @param {string} phoneNumber - Phone number
   * @param {string} code - Verification code
   * @param {string} name - User name (for new users)
   */
  async verifyCodeAndLogin(phoneNumber, code, name = null) {
    try {
      const formattedPhone = smsFlyService.validatePhoneNumber(phoneNumber)
      
      // Check if verification code exists and is valid
      const codeData = this.verificationCodes.get(formattedPhone)
      
      if (!codeData) {
        throw new Error('Verification code not found or expired')
      }
      
      if (Date.now() > codeData.expiresAt) {
        this.verificationCodes.delete(formattedPhone)
        throw new Error('Verification code expired')
      }
      
      if (codeData.attempts >= codeData.maxAttempts) {
        this.verificationCodes.delete(formattedPhone)
        throw new Error('Too many verification attempts')
      }
      
      if (codeData.code !== code) {
        codeData.attempts++
        throw new Error('Invalid verification code')
      }
      
      // Code is valid, remove it
      this.verificationCodes.delete(formattedPhone)
      
      console.log(`✅ Phone verification successful for ${formattedPhone}`)
      
      // Find or create user in our database
      let user = await this.findUserByPhone(formattedPhone)
      
      if (!user) {
        // Create new user
        user = await this.createUser(formattedPhone, name)
      }
      
      // Find or create client in Poster
      let posterClient = await posterClientService.findClientByPhone(formattedPhone)
      
      if (!posterClient && name) {
        // Create new client in Poster
        posterClient = await posterClientService.createClient({
          name: name,
          phone: formattedPhone,
          email: user.email || '',
          initialBonus: 0
        })
      }
      
      // Update user with Poster client ID if found
      if (posterClient && !user.poster_client_id) {
        user = await this.updateUserPosterClientId(user.id, posterClient.client_id)
      }
      
      // Generate JWT token
      const token = this.generateJWT(user)
      
      // Get current bonus information
      const bonusInfo = posterClient ? {
        bonusPoints: parseFloat(posterClient.bonus) || 0,
        totalPaidSum: parseFloat(posterClient.total_payed_sum) || 0
      } : {
        bonusPoints: 0,
        totalPaidSum: 0
      }
      
      return {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          posterClientId: user.poster_client_id,
          ...bonusInfo
        },
        token,
        isNewUser: !posterClient
      }
    } catch (error) {
      console.error('❌ Error verifying code and login:', error)
      throw error
    }
  }

  /**
   * Find user by phone number in our database
   */
  async findUserByPhone(phoneNumber) {
    try {
      const user = await prisma.user.findUnique({
        where: { phone: phoneNumber }
      })
      return user
    } catch (error) {
      console.error('❌ Error finding user by phone:', error)
      throw error
    }
  }

  /**
   * Create new user in our database
   */
  async createUser(phoneNumber, name = null) {
    try {
      const userData = {
        phone: phoneNumber,
        name: name || `User ${phoneNumber.slice(-4)}`,
        email: null,
        role: 'user'
      }
      
      console.log(`👤 Creating new user: ${userData.name} (${phoneNumber})`)
      
      const user = await prisma.user.create({
        data: userData
      })
      
      return user
    } catch (error) {
      console.error('❌ Error creating user:', error)
      throw error
    }
  }

  /**
   * Update user with Poster client ID
   */
  async updateUserPosterClientId(userId, posterClientId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { poster_client_id: posterClientId }
      })
      return user
    } catch (error) {
      console.error('❌ Error updating user Poster client ID:', error)
      throw error
    }
  }

  /**
   * Generate JWT token
   */
  generateJWT(user) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      posterClientId: user.poster_client_id
    }
    
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' })
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret)
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Get user profile with bonus information
   */
  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        throw new Error('User not found')
      }
      
      let bonusInfo = { bonusPoints: 0, totalPaidSum: 0 }
      
      if (user.poster_client_id) {
        try {
          const posterClient = await posterClientService.getClientDetails(user.poster_client_id)
          bonusInfo = {
            bonusPoints: parseFloat(posterClient.bonus) || 0,
            totalPaidSum: parseFloat(posterClient.total_payed_sum) || 0
          }
        } catch (error) {
          console.error('⚠️ Error getting Poster client details:', error)
        }
      }
      
      return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        posterClientId: user.poster_client_id,
        ...bonusInfo
      }
    } catch (error) {
      console.error('❌ Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Clean up expired verification codes
   */
  cleanupExpiredCodes() {
    const now = Date.now()
    for (const [phone, codeData] of this.verificationCodes.entries()) {
      if (now > codeData.expiresAt) {
        this.verificationCodes.delete(phone)
      }
    }
  }

  /**
   * Check if phone number has pending verification
   */
  hasPendingVerification(phoneNumber) {
    const formattedPhone = smsFlyService.validatePhoneNumber(phoneNumber)
    const codeData = this.verificationCodes.get(formattedPhone)
    return codeData && Date.now() < codeData.expiresAt
  }
}

export default new AuthService()
