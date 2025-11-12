import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '../index.js'
import smsFlyService from './smsFlyService.js'
import posterClientService from './posterClientService.js'

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
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

      // Check if there's already a recent code for this phone (1 minute cooldown)
      const existingCode = await prisma.verificationCode.findUnique({
        where: { phone: formattedPhone }
      })

      if (existingCode && (Date.now() - existingCode.createdAt.getTime()) < 60000) {
        throw new Error('Please wait 1 minute before requesting a new code')
      }

      // Generate verification code
      const verificationCode = smsFlyService.generateVerificationCode()

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + this.codeExpiryTime)

      // Store or update verification code in database
      await prisma.verificationCode.upsert({
        where: { phone: formattedPhone },
        update: {
          code: verificationCode,
          attempts: 0,
          expiresAt: expiresAt,
          updatedAt: new Date()
        },
        create: {
          phone: formattedPhone,
          code: verificationCode,
          attempts: 0,
          expiresAt: expiresAt
        }
      })

      console.log(`📱 Sending verification code to ${formattedPhone}: ${verificationCode}`)

      // Send SMS with timeout handling
      const smsResult = await Promise.race([
        smsFlyService.sendVerificationSMS(formattedPhone, verificationCode),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMS sending timeout')), 25000) // 25 second timeout
        )
      ])

      console.log('📱 SMS sending result:', smsResult)

      return {
        success: true,
        phone: formattedPhone,
        message: 'Verification code sent successfully',
        expiresIn: this.codeExpiryTime / 1000, // seconds
        smsStatus: smsResult.smsStatus
      }
    } catch (error) {
      console.error('❌ Error sending verification code:', error)

      // Provide user-friendly error messages
      if (error.message.includes('timeout')) {
        throw new Error('SMS service is temporarily slow. Please try again.')
      } else if (error.message.includes('wait 1 minute')) {
        throw new Error('Please wait 1 minute before requesting a new code')
      }

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
      const codeData = await prisma.verificationCode.findUnique({
        where: { phone: formattedPhone }
      })

      if (!codeData) {
        throw new Error('Verification code not found or expired')
      }

      if (Date.now() > codeData.expiresAt.getTime()) {
        // Delete expired code
        await prisma.verificationCode.delete({
          where: { phone: formattedPhone }
        })
        throw new Error('Verification code expired')
      }

      if (codeData.attempts >= 3) { // Max 3 attempts
        await prisma.verificationCode.delete({
          where: { phone: formattedPhone }
        })
        throw new Error('Too many verification attempts')
      }

      if (codeData.code !== code) {
        // Increment attempts
        await prisma.verificationCode.update({
          where: { phone: formattedPhone },
          data: { attempts: codeData.attempts + 1 }
        })
        throw new Error('Invalid verification code')
      }

      // Code is valid, delete it
      await prisma.verificationCode.delete({
        where: { phone: formattedPhone }
      })
      
      console.log(`✅ Phone verification successful for ${formattedPhone}`)
      
      // Find or create user in our database
      let user = await this.findUserByPhone(formattedPhone)

      if (!user) {
        // Create new user - require name for new users
        if (!name || name.trim() === '') {
          throw new Error('Name is required for new users')
        }
        user = await this.createUser(formattedPhone, name.trim())
      }

      // Start background Poster API sync (don't wait for it)
      this.syncPosterClientInBackground(user, formattedPhone, name)

      // Get current Poster client info if available
      let posterClient = null
      if (user.poster_client_id) {
        try {
          posterClient = await Promise.race([
            posterClientService.getClientDetails(user.poster_client_id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Poster API timeout')), 5000) // 5 second timeout for existing client
            )
          ])
        } catch (error) {
          console.warn('⚠️ Failed to get existing Poster client details:', error.message)
        }
      }
      
      // Generate JWT token
      const token = this.generateJWT(user)
      
      // Get current bonus information
      const bonusInfo = posterClient ? {
        bonusPoints: parseFloat(posterClient.bonus) || 0,
        totalPaidSum: (parseFloat(posterClient.total_payed_sum) || 0) / 100 // Convert kopecks to hryvnias
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
        isNewUser: !posterClient,
        requiresPasswordSetup: user.force_password_setup || !user.is_password_set
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
  async createUser(phoneNumber, name) {
    try {
      const userData = {
        phone: phoneNumber,
        name: name,
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
   * Sync user with Poster client in background (non-blocking)
   */
  async syncPosterClientInBackground(user, phoneNumber, name) {
    // Run in background without blocking the login response
    setImmediate(async () => {
      try {
        console.log(`🔄 Starting background Poster sync for user ${user.id}`)

        // Find existing client in Poster
        let posterClient = await Promise.race([
          posterClientService.findClientByPhone(phoneNumber),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Poster API timeout')), 15000) // 15 second timeout for background
          )
        ])

        if (!posterClient && name) {
          // Create new client in Poster
          console.log(`👤 Creating new Poster client for ${name}`)
          posterClient = await Promise.race([
            posterClientService.createClient({
              name: name,
              phone: phoneNumber,
              email: user.email || '',
              initialBonus: 0
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Poster API timeout')), 15000) // 15 second timeout
            )
          ])
        }

        // Update user with Poster client ID if found
        if (posterClient && !user.poster_client_id) {
          await this.updateUserPosterClientId(user.id, posterClient.client_id)
          console.log(`✅ Background Poster sync completed for user ${user.id}`)
        } else if (posterClient) {
          console.log(`ℹ️ User ${user.id} already has Poster client ID`)
        } else {
          console.log(`ℹ️ No Poster client found/created for user ${user.id}`)
        }
      } catch (error) {
        console.warn(`⚠️ Background Poster sync failed for user ${user.id}:`, error.message)
        // Don't throw error - this is background operation
      }
    })
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
      
      let bonusInfo = {
        bonusPoints: 0,
        totalPaidSum: 0,
        hasPosterClient: false,
        posterSyncStatus: 'not_synced'
      }

      if (user.poster_client_id) {
        try {
          // Add timeout for Poster API call
          const posterClient = await Promise.race([
            posterClientService.getClientDetails(user.poster_client_id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Poster API timeout')), 5000) // 5 second timeout
            )
          ])

          bonusInfo = {
            bonusPoints: parseFloat(posterClient.bonus) || 0,
            totalPaidSum: (parseFloat(posterClient.total_payed_sum) || 0) / 100,
            hasPosterClient: true,
            posterSyncStatus: 'synced',
            posterClientName: posterClient.client_name
          }
        } catch (error) {
          console.warn('⚠️ Failed to get bonus info from Poster:', error.message)
          bonusInfo.posterSyncStatus = 'sync_failed'
          bonusInfo.hasPosterClient = true // We have ID but can't fetch details
        }
      } else {
        // Check if background sync is still in progress
        bonusInfo.posterSyncStatus = 'syncing'
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
  async hasPendingVerification(phoneNumber) {
    try {
      const formattedPhone = smsFlyService.validatePhoneNumber(phoneNumber)
      const codeData = await prisma.verificationCode.findUnique({
        where: { phone: formattedPhone }
      })
      return codeData && Date.now() < codeData.expiresAt.getTime()
    } catch (error) {
      console.error('❌ Error checking pending verification:', error)
      return false
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - Whether password matches
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }

  /**
   * Set password for user
   * @param {string} userId - User ID
   * @param {string} password - Plain text password
   */
  async setUserPassword(userId, password) {
    try {
      const hashedPassword = await this.hashPassword(password)

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password_hash: hashedPassword,
          is_password_set: true,
          force_password_setup: false
        }
      })

      console.log(`🔐 Password set for user: ${userId}`)
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('❌ Error setting password:', error)
      throw new Error('Failed to set password')
    }
  }

  /**
   * Login with phone and password
   * @param {string} phoneNumber - Phone number
   * @param {string} password - Password
   */
  async loginWithPassword(phoneNumber, password) {
    try {
      const formattedPhone = smsFlyService.validatePhoneNumber(phoneNumber)

      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone: formattedPhone }
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.is_password_set || !user.password_hash) {
        throw new Error('Password not set. Please use SMS verification.')
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password_hash)
      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      // Generate JWT token
      const token = this.generateJWT(user)

      // Get user profile with bonus info
      const profile = await this.getUserProfile(user.id)

      console.log(`🔐 Password login successful for user: ${user.id}`)

      return {
        success: true,
        token,
        user: profile,
        requiresPasswordSetup: user.force_password_setup
      }
    } catch (error) {
      console.error('❌ Password login error:', error)
      throw error
    }
  }
}

export default new AuthService()
