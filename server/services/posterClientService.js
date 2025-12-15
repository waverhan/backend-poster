import fetch from 'node-fetch'

class PosterClientService {
  constructor() {
    // Use the Poster API token from environment variables
    this.apiToken = process.env.POSTER_TOKEN || '218047:05891220e474bad7f26b6eaa0be3f344'
    this.baseUrl = 'https://joinposter.com/api'
  }

  /**
   * Create fetch request with timeout
   */
  async fetchWithTimeout(url, options = {}, timeout = 10000) {
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
        throw new Error('Poster API timeout - service is not responding')
      }
      throw error
    }
  }

  /**
   * Get all clients from Poster
   * @param {number} limit - Number of clients to fetch (default 100)
   * @param {number} offset - Offset for pagination (default 0)
   */
  async getClients(limit = 100, offset = 0) {
    try {
      const url = `${this.baseUrl}/clients.getClients?token=${this.apiToken}&num=${limit}&offset=${offset}`

      const response = await this.fetchWithTimeout(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        console.error('❌ Poster API error:', result.error)
        throw new Error(`Poster API error: ${result.error}`)
      }

      
      return result.response || []
    } catch (error) {
      console.error('❌ Error fetching clients from Poster:', error)
      throw error
    }
  }

  /**
   * Find client by phone number (with timeout and limited search)
   * @param {string} phoneNumber - Phone number in international format (380XXXXXXXXX)
   */
  async findClientByPhone(phoneNumber) {
    try {
      // Clean phone number - remove + and ensure 380 format
      const cleanPhone = phoneNumber.replace(/^\+/, '')
      const formattedPhone = cleanPhone.startsWith('380') ? cleanPhone : `380${cleanPhone.substring(1)}`

      

      // Limit search to prevent long delays - only search first 500 clients
      const maxClients = 500
      let searchedCount = 0
      let offset = 0
      const limit = 100

      while (searchedCount < maxClients) {
        try {
          // Add timeout for each batch
          const clients = await Promise.race([
            this.getClients(limit, offset),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Batch timeout')), 5000) // 5 second timeout per batch
            )
          ])

          if (!clients || clients.length === 0) break

          searchedCount += clients.length

          // Check if we found the client in this batch
          const foundClient = clients.find(client => {
            if (!client.phone) return false
            const clientPhone = client.phone.replace(/[^\d]/g, '')
            return clientPhone === formattedPhone || clientPhone === cleanPhone
          })

          if (foundClient) {
            return foundClient
          }

          // If we got less than the limit, we've reached the end
          if (clients.length < limit) break

          offset += limit
        } catch (error) {
          console.warn(`⚠️ Batch search failed at offset ${offset}:`, error.message)
          break // Stop searching on error
        }
      }

      return null
    } catch (error) {
      console.error('❌ Error finding client by phone:', error)
      // Don't throw error - return null to allow login without Poster client
      return null
    }
  }

  /**
   * Create new client in Poster
   * @param {Object} clientData - Client information
   */
  async createClient(clientData) {
    try {
      const {
        name,
        phone,
        email = '',
        birthday = null,
        sex = 0, // 0 - not specified, 1 - male, 2 - female
        groupId = 7, // Default client group
        initialBonus = 0
      } = clientData

      // Clean and format phone number
      const cleanPhone = phone.replace(/^\+/, '')
      const formattedPhone = cleanPhone.startsWith('380') ? `+${cleanPhone}` : `+380${cleanPhone.substring(1)}`

      const newClient = {
        client_name: name,
        client_sex: sex,
        client_groups_id_client: groupId,
        phone: formattedPhone,
        email: email,
        bonus: initialBonus,
        total_payed_sum: 0
      }

      // Add birthday if provided
      if (birthday) {
        newClient.birthday = birthday
      }

      

      const url = `${this.baseUrl}/clients.createClient?token=${this.apiToken}`

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Failed to create client in Poster:', result.error)
        throw new Error(`Failed to create client: ${result.error}`)
      }

      
      
      // Return the created client data
      return {
        client_id: result.response,
        ...newClient,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Error creating client in Poster:', error)
      throw error
    }
  }

  /**
   * Get client details including bonus information
   * @param {string} clientId - Poster client ID
   */
  async getClientDetails(clientId) {
    try {
      
      
      const url = `${this.baseUrl}/clients.getClient?token=${this.apiToken}&client_id=${clientId}`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Error getting client details:', result.error)
        throw new Error(`Failed to get client details: ${result.error}`)
      }
      
      
      return result.response
    } catch (error) {
      console.error('❌ Error getting client details:', error)
      throw error
    }
  }

  /**
   * Update client bonus points
   * @param {string} clientId - Poster client ID
   * @param {number} bonusAmount - New bonus amount
   */
  async updateClientBonus(clientId, bonusAmount) {
    try {
      
      
      const url = `${this.baseUrl}/clients.updateClient?token=${this.apiToken}`
      
      const updateData = {
        client_id: clientId,
        bonus: bonusAmount
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Failed to update client bonus:', result.error)
        throw new Error(`Failed to update bonus: ${result.error}`)
      }

      
      return result.response
    } catch (error) {
      console.error('❌ Error updating client bonus:', error)
      throw error
    }
  }

  /**
   * Add bonus points to client
   * @param {string} clientId - Poster client ID
   * @param {number} bonusToAdd - Bonus points to add
   */
  async addBonusPoints(clientId, bonusToAdd) {
    try {
      // First get current client details
      const client = await this.getClientDetails(clientId)
      const currentBonus = parseFloat(client.bonus) || 0
      const newBonus = currentBonus + bonusToAdd

      return await this.updateClientBonus(clientId, newBonus)
    } catch (error) {
      console.error('❌ Error adding bonus points:', error)
      throw error
    }
  }

  /**
   * Deduct bonus points from client
   * @param {string} clientId - Poster client ID
   * @param {number} bonusToDeduct - Bonus points to deduct
   */
  async deductBonusPoints(clientId, bonusToDeduct) {
    try {
      // First get current client details
      const client = await this.getClientDetails(clientId)
      const currentBonus = parseFloat(client.bonus) || 0
      
      if (currentBonus < bonusToDeduct) {
        throw new Error(`Insufficient bonus points. Current: ${currentBonus}, Required: ${bonusToDeduct}`)
      }
      
      const newBonus = currentBonus - bonusToDeduct

      return await this.updateClientBonus(clientId, newBonus)
    } catch (error) {
      console.error('❌ Error deducting bonus points:', error)
      throw error
    }
  }

  /**
   * Calculate bonus points for purchase amount
   * @param {number} purchaseAmount - Purchase amount in UAH
   * @param {number} bonusRate - Bonus rate (default 1% = 0.01)
   */
  calculateBonusPoints(purchaseAmount, bonusRate = 0.01) {
    return Math.floor(purchaseAmount * bonusRate)
  }

  /**
   * Test Poster API connection
   */
  async testConnection() {
    try {
      
      const clients = await this.getClients(1, 0)
      
      return { success: true, clientCount: clients.length }
    } catch (error) {
      console.error('❌ Poster API connection test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new PosterClientService()
