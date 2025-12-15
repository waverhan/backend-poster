import fetch from 'node-fetch'

class SmsFlyService {
  constructor() {
    this.apiKey = process.env.SMS_FLY_API_KEY || 'y4gofJyEnJ7NP9znmkN1ACk5XwROzlma'
    this.apiUrl = 'https://sms-fly.ua/api/v2/api.php'
    this.senderName = 'OpilliaShop'
    this.requestTimeout = 30000 // 30 seconds timeout for API requests
  }

  /**
   * Create fetch request with timeout
   */
  async fetchWithTimeout(url, options, timeout = this.requestTimeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - SMS service is not responding')
      }
      throw error
    }
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

      

      const response = await this.fetchWithTimeout(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success === 1) {
        
        return result.data
      } else {
        console.error('❌ Failed to get SMS-Fly sources:', result)
        throw new Error(`SMS-Fly API error: ${result.error || 'Unknown error'}`)
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

      const response = await this.fetchWithTimeout(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success === 1) {
        return {
          success: true,
          messageId: result.data?.messageID, // Note: API returns messageID, not messageId
          phone: cleanPhone,
          message: message,
          smsStatus: result.data?.sms?.status,
          cost: result.data?.sms?.cost
        }
      } else {
        console.error('❌ Failed to send SMS:', result)
        // Handle specific SMS-Fly error codes
        const errorCode = result.error || 'UNKNOWN'
        const errorMessage = this.getErrorMessage(errorCode)
        throw new Error(`SMS sending failed: ${errorMessage} (${errorCode})`)
      }
    } catch (error) {
      console.error('❌ SMS-Fly sendVerificationSMS error:', error)

      // Provide user-friendly error messages
      if (error.message.includes('timeout')) {
        throw new Error('SMS service timeout. Please try again.')
      } else if (error.message.includes('HTTP 403')) {
        throw new Error('SMS service authentication failed. Please contact support.')
      } else if (error.message.includes('HTTP 400')) {
        throw new Error('Invalid phone number format.')
      } else if (error.message.includes('INSUFFICIENTFUNDS')) {
        throw new Error('SMS service temporarily unavailable. Please contact support.')
      }

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

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success === 1) {
        
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
   * Get user-friendly error message for SMS-Fly error codes
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      'INVREQUEST': 'Invalid request format',
      'INVACTION': 'Invalid action specified',
      'INVRECIPIENT': 'Invalid phone number',
      'INVTEXT': 'Invalid message text',
      'INVBUTTON': 'Invalid button format',
      'INVIMAGEURL': 'Invalid image URL',
      'INVROUTE': 'Message cannot be sent to this number',
      'INVSOURCE': 'Invalid sender name',
      'INVCHANNELS': 'Invalid channels specified',
      'INVSMSMESSAGE': 'SMS message not specified',
      'INVVIBERMESSAGE': 'Viber message not specified',
      'INVMSGID': 'Invalid message ID',
      'INSUFFICIENTFUNDS': 'Insufficient funds for SMS sending'
    }

    return errorMessages[errorCode] || 'Unknown SMS service error'
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
      const sources = await this.getSources()

      if (sources.sms && sources.sms.includes(this.senderName)) {
        return { success: true, senderAvailable: true, sources }
      } else {
        // Try to use the first available SMS source if our preferred one is not available
        if (sources.sms && sources.sms.length > 0) {
          const availableSender = sources.sms[0]
          
          this.senderName = availableSender
          return { success: true, senderAvailable: true, sources, senderChanged: true, newSender: availableSender }
        }
        return { success: true, senderAvailable: false, sources }
      }
    } catch (error) {
      console.error('❌ SMS-Fly connection test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new SmsFlyService()
