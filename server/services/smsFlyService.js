import fetch from 'node-fetch'

class SmsFlyService {
  constructor() {
    this.apiKey = process.env.SMS_FLY_API_KEY || 'y4gofJyEnJ7NP9znmkN1ACk5XwROzlma'
    this.apiUrl = 'https://sms-fly.ua/api/v2/api.php'
    this.senderName = 'OpilliaShop'
  }

  /**
   * Get available sender names from SMS-Fly
   */
  async getSources() {
    try {
      const requestData = {
        auth: {
          key: this.apiKey
        },
        action: 'GETSOURCES',
        data: {
          channels: ['sms', 'viber']
        }
      }

      console.log('📱 Getting SMS-Fly sources...')
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success === 1) {
        console.log('✅ SMS-Fly sources retrieved:', result.data)
        return result.data
      } else {
        console.error('❌ Failed to get SMS-Fly sources:', result)
        throw new Error('Failed to get SMS sources')
      }
    } catch (error) {
      console.error('❌ SMS-Fly getSources error:', error)
      throw error
    }
  }

  /**
   * Send SMS verification code
   * @param {string} phoneNumber - Phone number in international format (380XXXXXXXXX)
   * @param {string} verificationCode - 4-digit verification code
   */
  async sendVerificationSMS(phoneNumber, verificationCode) {
    try {
      // Ensure phone number is in correct format (without +)
      const cleanPhone = phoneNumber.replace(/^\+/, '')
      
      const message = `Kod podtverzhdenija OPILLIA: ${verificationCode}`
      
      const requestData = {
        auth: {
          key: this.apiKey
        },
        action: 'SENDMESSAGE',
        data: {
          recipient: cleanPhone,
          channels: ['sms'],
          sms: {
            source: this.senderName,
            ttl: 5, // 5 minutes TTL
            flash: 0,
            text: message
          }
        }
      }

      console.log(`📱 Sending SMS verification to ${cleanPhone}...`)
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success === 1) {
        console.log(`✅ SMS sent successfully to ${cleanPhone}`)
        return {
          success: true,
          messageId: result.data?.messageId,
          phone: cleanPhone,
          message: message
        }
      } else {
        console.error('❌ Failed to send SMS:', result)
        throw new Error(`SMS sending failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ SMS-Fly sendVerificationSMS error:', error)
      throw error
    }
  }

  /**
   * Send SMS with Viber fallback
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} verificationCode - 4-digit verification code
   */
  async sendVerificationWithViber(phoneNumber, verificationCode) {
    try {
      const cleanPhone = phoneNumber.replace(/^\+/, '')
      const message = `Kod podtverzhdenija OPILLIA: ${verificationCode}`
      
      const requestData = {
        auth: {
          key: this.apiKey
        },
        action: 'SENDMESSAGE',
        data: {
          recipient: cleanPhone,
          channels: ['viber', 'sms'], // Try Viber first, fallback to SMS
          viber: {
            source: this.senderName,
            ttl: 5,
            text: message
          },
          sms: {
            source: this.senderName,
            ttl: 5,
            flash: 0,
            text: message
          }
        }
      }

      console.log(`📱 Sending verification (Viber+SMS) to ${cleanPhone}...`)
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success === 1) {
        console.log(`✅ Message sent successfully to ${cleanPhone}`)
        return {
          success: true,
          messageId: result.data?.messageId,
          phone: cleanPhone,
          message: message
        }
      } else {
        console.error('❌ Failed to send message:', result)
        throw new Error(`Message sending failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ SMS-Fly sendVerificationWithViber error:', error)
      throw error
    }
  }

  /**
   * Generate 4-digit verification code
   */
  generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   */
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Check if it's a valid Ukrainian number
    const ukrainianPattern = /^(\+?380|0)[0-9]{9}$/
    
    if (ukrainianPattern.test(cleaned)) {
      // Convert to international format without +
      if (cleaned.startsWith('0')) {
        return '380' + cleaned.substring(1)
      } else if (cleaned.startsWith('+380')) {
        return cleaned.substring(1)
      } else if (cleaned.startsWith('380')) {
        return cleaned
      }
    }
    
    throw new Error('Invalid Ukrainian phone number format')
  }

  /**
   * Test SMS-Fly connection
   */
  async testConnection() {
    try {
      console.log('🧪 Testing SMS-Fly connection...')
      const sources = await this.getSources()
      
      if (sources.sms && sources.sms.includes(this.senderName)) {
        console.log(`✅ SMS-Fly connection successful. Sender "${this.senderName}" is available.`)
        return { success: true, senderAvailable: true, sources }
      } else {
        console.log(`⚠️ SMS-Fly connected but sender "${this.senderName}" not found in available sources:`, sources.sms)
        return { success: true, senderAvailable: false, sources }
      }
    } catch (error) {
      console.error('❌ SMS-Fly connection test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new SmsFlyService()
