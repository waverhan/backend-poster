import fetch from 'node-fetch'

class PosterClientService {
  constructor() {
    // Use the Poster API token from environment variables
    this.apiToken = process.env.POSTER_TOKEN || '218047:05891220e474bad7f26b6eaa0be3f344'
    this.baseUrl = 'https://joinposter.com/api'
  }

  /**
   * Get all clients from Poster
   * @param {number} limit - Number of clients to fetch (default 100)
   * @param {number} offset - Offset for pagination (default 0)
   */
  async getClients(limit = 100, offset = 0) {
    try {
      const url = `${this.baseUrl}/clients.getClients?token=${this.apiToken}&num=${limit}&offset=${offset}`
      
      console.log(`📋 Fetching clients from Poster (limit: ${limit}, offset: ${offset})...`)
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Poster API error:', result.error)
        throw new Error(`Poster API error: ${result.error}`)
      }
      
      console.log(`✅ Retrieved ${result.response?.length || 0} clients from Poster`)
      return result.response || []
    } catch (error) {
      console.error('❌ Error fetching clients from Poster:', error)
      throw error
    }
  }

  /**
   * Find client by phone number
   * @param {string} phoneNumber - Phone number in international format (380XXXXXXXXX)
   */
  async findClientByPhone(phoneNumber) {
    try {
      // Clean phone number - remove + and ensure 380 format
      const cleanPhone = phoneNumber.replace(/^\+/, '')
      const formattedPhone = cleanPhone.startsWith('380') ? cleanPhone : `380${cleanPhone.substring(1)}`
      
      console.log(`🔍 Searching for client with phone: ${formattedPhone}`)
      
      // Get all clients (we might need to paginate if there are many)
      let allClients = []
      let offset = 0
      const limit = 100
      
      while (true) {
        const clients = await this.getClients(limit, offset)
        if (!clients || clients.length === 0) break
        
        allClients = allClients.concat(clients)
        
        // Check if we found the client in this batch
        const foundClient = clients.find(client => {
          if (!client.phone) return false
          const clientPhone = client.phone.replace(/[^\d]/g, '')
          return clientPhone === formattedPhone || clientPhone === cleanPhone
        })
        
        if (foundClient) {
          console.log(`✅ Found client: ${foundClient.client_name} (ID: ${foundClient.client_id})`)
          return foundClient
        }
        
        // If we got less than the limit, we've reached the end
        if (clients.length < limit) break
        
        offset += limit
      }
      
      console.log(`ℹ️ Client not found for phone: ${formattedPhone}`)
      return null
    } catch (error) {
      console.error('❌ Error finding client by phone:', error)
      throw error
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

      console.log(`👤 Creating new client in Poster:`, {
        name: newClient.client_name,
        phone: newClient.phone,
        email: newClient.email
      })

      const url = `${this.baseUrl}/clients.createClient?token=${this.apiToken}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient)
      })

      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Failed to create client in Poster:', result.error)
        throw new Error(`Failed to create client: ${result.error}`)
      }

      console.log(`✅ Client created successfully in Poster with ID: ${result.response}`)
      
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
      console.log(`📋 Getting client details for ID: ${clientId}`)
      
      const url = `${this.baseUrl}/clients.getClient?token=${this.apiToken}&client_id=${clientId}`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.error) {
        console.error('❌ Error getting client details:', result.error)
        throw new Error(`Failed to get client details: ${result.error}`)
      }
      
      console.log(`✅ Retrieved client details for: ${result.response.client_name}`)
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
      console.log(`💰 Updating bonus for client ${clientId}: ${bonusAmount} points`)
      
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

      console.log(`✅ Client bonus updated successfully`)
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
      
      console.log(`💰 Adding ${bonusToAdd} bonus points to client ${clientId} (current: ${currentBonus}, new: ${newBonus})`)
      
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
      
      console.log(`💰 Deducting ${bonusToDeduct} bonus points from client ${clientId} (current: ${currentBonus}, new: ${newBonus})`)
      
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
      console.log('🧪 Testing Poster API connection...')
      const clients = await this.getClients(1, 0)
      console.log('✅ Poster API connection successful')
      return { success: true, clientCount: clients.length }
    } catch (error) {
      console.error('❌ Poster API connection test failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new PosterClientService()
