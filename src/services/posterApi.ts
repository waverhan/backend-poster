import type {
  Branch,
  Category,
  Product,
  PosterSpot,
  PosterCategory,
  PosterProduct,
  PosterStorage,
  PosterInventoryItem,
  ApiResponse
} from '@/types'

// Poster API Configuration
const POSTER_API_BASE = '/api/poster' // Use proxy instead of direct URL
const POSTER_TOKEN = '218047:05891220e474bad7f26b6eaa0be3f344'

class PosterApiService {
  private baseUrl = POSTER_API_BASE
  private token = POSTER_TOKEN

  /**
   * Make a request to Poster API
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const urlParams = new URLSearchParams({
      token: this.token,
      ...params
    })

    const url = `${this.baseUrl}/${endpoint}?${urlParams.toString()}`

    

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Poster API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      

      if (data.error) {
        throw new Error(`Poster API error: ${data.error}`)
      }

      return data
    } catch (error) {
      console.error('Poster API request failed:', error)
      throw error
    }
  }

  /**
   * Get all branches from warehouses/storages (each warehouse represents a branch)
   */
  async getBranches(): Promise<Branch[]> {
    

    const response = await this.request<{ response: PosterStorage[] }>('storage.getStorages')

    

    if (!response.response || !Array.isArray(response.response)) {
      throw new Error('Invalid storages response from Poster API')
    }

    // Convert warehouses/storages to branches
    const branches = response.response.map(storage => ({
      id: storage.storage_id,
      poster_id: storage.storage_id,
      name: storage.storage_name || `Warehouse ${storage.storage_id}`,
      address: `Warehouse Location ${storage.storage_id}`, // Can be configured manually in admin
      phone: '+38 (097) 324 46 68', // Default phone from user requirements
      latitude: 50.4501, // Default Kyiv coordinates - can be configured per warehouse
      longitude: 30.5234,
      delivery_available: true,
      pickup_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    
    return branches
  }



  /**
   * Get single storage/branch by ID
   */
  async getBranch(storageId: string): Promise<Branch | null> {
    try {
      const branches = await this.getBranches()
      return branches.find(branch => branch.id === storageId) || null
    } catch (error) {
      console.error('Failed to fetch branch from Poster API:', error)
      return null
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    
    const response = await this.request<{ response: PosterCategory[] }>('menu.getCategories')

    if (!response.response || !Array.isArray(response.response)) {
      console.error('❌ Invalid categories response structure:', response)
      throw new Error('Invalid categories response from Poster API')
    }

    const categories = response.response.map((category, index) => {
      // Debug: Log first few categories
      if (index < 3) {
        
      }

      return {
        id: category.category_id,
        poster_id: category.category_id,
        name: category.category_name,
        display_name: category.category_name,
        sort_order: category.sort_order || 0,
        is_active: true
      }
    })

    
    return categories
  }



  // Helper function to check if a product is weight-based using ingredient_unit
  private isWeightBasedProduct(product: any): boolean {
    const name = (product.product_name || '').toLowerCase()

    // Exclude beverages even if they have ingredient_unit = kg
    const isBeverage = name.includes('пиво') || name.includes('вино') || name.includes('сидр') ||
                      name.includes('beer') || name.includes('wine') || name.includes('cocktail') ||
                      name.includes('коктейль') || name.includes('напій') || name.includes('drink')

    if (isBeverage) {
      return false // Beverages are never weight-based, even with kg unit
    }

    // Only check ingredient_unit from Poster API - if it's 'kg' and not a beverage, it's weight-based
    return product.ingredient_unit === 'kg'
  }

  // Helper function to check if a product needs price conversion (beverages with kg unit)
  private needsPriceConversion(product: any): boolean {
    const name = (product.product_name || '').toLowerCase()

    // Check if it's a beverage with ingredient_unit = kg (these need price conversion)
    const isBeverage = name.includes('пиво') || name.includes('вино') || name.includes('сидр') ||
                      name.includes('beer') || name.includes('wine') || name.includes('cocktail') ||
                      name.includes('коктейль') || name.includes('напій') || name.includes('drink')

    return (isBeverage && product.ingredient_unit === 'kg') || this.isWeightBasedProduct(product)
  }

  // Helper function to convert price from per-100g to per-kg/per-liter for display
  private convertPrice(price: number, product: any): number {
    if (this.needsPriceConversion(product)) {
      return price * 10 // Convert from per-100g to per-kg or per-liter
    }
    return price
  }

  /**
   * Get products by category
   */
  async getProducts(categoryId?: string): Promise<Product[]> {
    

    const params: Record<string, string> = {
      type: 'products'
    }

    if (categoryId) {
      params.category_id = categoryId
    }

    const response = await this.request<{ response: PosterProduct[] }>('menu.getProducts', params)

    if (!response.response || !Array.isArray(response.response)) {
      console.error('❌ Invalid products response structure:', response)
      throw new Error('Invalid products response from Poster API')
    }

    const products = response.response.map((product, index) => {
      // Parse price correctly - handle kopecks (price in kopecks, divide by 100)
      let parsedPrice = 0

      // Try multiple price fields from Poster API
      const priceFields = ['product_price', 'price', 'cost', 'product_cost']
      for (const field of priceFields) {
        if (product[field] && parseFloat(product[field]) > 0) {
          parsedPrice = parseFloat(product[field]) / 100 // Convert kopecks to UAH
          break
        }
      }

      // Debug: Log price and category for first few products
      if (index < 3) {
        // Debug logging removed for production
      }

      // Construct proper Poster image URL
      let imageUrl = undefined
      let displayImageUrl = undefined

      // Check for photo field (API uses 'photo' not 'product_photo')
      const photoPath = product.photo || product.product_photo
      if (photoPath) {
        // If it's already a full URL, use it
        if (photoPath.startsWith('http')) {
          imageUrl = photoPath
          displayImageUrl = photoPath
        } else {
          // Remove leading slash if present and construct the full Poster URL
          const cleanPath = photoPath.startsWith('/') ? photoPath.substring(1) : photoPath
          imageUrl = `https://joinposter.com/${cleanPath}`
          displayImageUrl = imageUrl
        }
      }

      // Convert price for products that need conversion (weight-based or beverages with kg unit)
      const displayPrice = this.convertPrice(parsedPrice, product)
      const isWeightBased = this.isWeightBasedProduct(product)
      const needsConversion = this.needsPriceConversion(product)

      // Log price conversion for products that need it
      if (needsConversion) {
        const ingredientUnit = product.ingredient_unit ? ` [ingredient_unit: ${product.ingredient_unit}]` : ''
        const productType = isWeightBased ? 'Weight-based' : 'Beverage'
        const unitType = isWeightBased ? 'kg' : 'L'
        
      }

      return {
        id: product.product_id,
        poster_product_id: product.product_id,
        category_id: categoryId || product.category_id || '1', // Always use the categoryId parameter when provided
        name: product.product_name,
        display_name: product.product_name,
        description: product.ingredients || '',
        price: displayPrice,
        image_url: imageUrl,
        display_image_url: displayImageUrl,
        quantity: product.out === '1' ? 0 : 999, // Will be updated with real inventory
        unit: isWeightBased ? 'kg' : 'pcs',
        available: product.out !== '1',
        is_active: product.out !== '1',
        custom_quantity: isWeightBased ? 0.05 : null, // 50g portions for weight-based products
        custom_unit: isWeightBased ? 'г' : null,
        quantity_step: isWeightBased ? 1 : null, // Step by 1 for weight-based (50g increments)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    return products
  }



  /**
   * Get single product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const products = await this.getProducts()
      return products.find(p => p.id === productId) || null
    } catch (error) {
      console.error('Failed to fetch product from Poster API:', error)
      throw error
    }
  }

  /**
   * Get storage/inventory data for all branches
   */
  async getStorages(): Promise<PosterStorage[]> {
    try {
      
      const response = await this.request<{ response: PosterStorage[] }>('storage.getStorages')

      

      if (!response.response || !Array.isArray(response.response)) {
        console.warn('⚠️ Invalid storages response')
        return []
      }

      
      return response.response
    } catch (error) {
      console.error('❌ Failed to fetch storages from Poster API:', error)
      return []
    }
  }

  /**
   * Get storage data for specific branch (since branches are storages now)
   */
  async getStoragesBySpot(storageId: string): Promise<PosterStorage[]> {
    try {
      const allStorages = await this.getStorages()
      // Return the specific storage as an array
      const storage = allStorages.find(s => s.storage_id === storageId)
      return storage ? [storage] : []
    } catch (error) {
      console.error('Failed to fetch storage:', error)
      throw error
    }
  }

  /**
   * Get inventory leftovers for specific storage
   */
  async getInventory(storageId: string): Promise<PosterInventoryItem[]> {
    
    const response = await this.request<{ response: PosterInventoryItem[] }>('storage.getStorageLeftovers', { storage_id: storageId })

    

    if (!response.response || !Array.isArray(response.response)) {
      console.warn('⚠️ Invalid inventory response')
      return []
    }

    // Log sample inventory item to understand structure
    if (response.response.length > 0) {
      
    }

    
    return response.response
  }

  /**
   * Get products with real inventory for specific storage/branch
   */
  async getProductsWithInventory(storageId: string, categoryId?: string): Promise<Product[]> {
    

    // Get products
    const products = await this.getProducts(categoryId)

    // Get inventory for this specific storage
    const inventory = await this.getInventory(storageId)

    if (inventory.length === 0) {
      console.warn(`No inventory found for storage ${storageId}, returning products with default quantities`)
      // Return products with default quantities when no inventory data
      return products.filter(product => product.available).map(product => ({
        ...product,
        quantity: 10, // Default reasonable quantity
        unit: 'pcs',
        branch_id: storageId
      }))
    }

    // Create inventory maps for quick lookup - try both ID and name matching
    const inventoryMapById = new Map<string, { quantity: number, unit: string }>()
    const inventoryMapByName = new Map<string, { quantity: number, unit: string }>()

    inventory.forEach(item => {
      const quantity = parseFloat(item.storage_ingredient_left) || 0
      const unit = item.ingredient_unit || 'pcs'

      // Map by ingredient_id
      inventoryMapById.set(item.ingredient_id, { quantity, unit })

      // Map by ingredient_name (normalized)
      const normalizedName = item.ingredient_name?.toLowerCase().trim()
      if (normalizedName) {
        inventoryMapByName.set(normalizedName, { quantity, unit })
      }
    })

    
    

    // Update products with real inventory quantities and units
    const productsWithInventory = products.map(product => {
      // Try multiple matching strategies
      let inventoryData = null
      let matchMethod = 'none'

      // 1. Try matching by product ID
      if (inventoryMapById.has(product.id)) {
        inventoryData = inventoryMapById.get(product.id)
        matchMethod = 'id'
      }

      // 2. Try matching by product name (normalized)
      if (!inventoryData) {
        const normalizedProductName = product.display_name?.toLowerCase().trim()
        if (normalizedProductName && inventoryMapByName.has(normalizedProductName)) {
          inventoryData = inventoryMapByName.get(normalizedProductName)
          matchMethod = 'name_exact'
        }
      }

      // 3. Try partial name matching
      if (!inventoryData && product.display_name) {
        const productName = product.display_name.toLowerCase().trim()
        for (const [ingredientName, data] of inventoryMapByName.entries()) {
          if (ingredientName.includes(productName) || productName.includes(ingredientName)) {
            inventoryData = data
            matchMethod = 'name_partial'
            break
          }
        }
      }

      // Debug inventory matching for first few products
      if (products.indexOf(product) < 3) {
        
      }

      // Use inventory data or defaults
      const quantity = inventoryData?.quantity || 0
      let unit = inventoryData?.unit || 'pcs'

      // Smart unit conversion based on product type and ingredient unit
      let displayQuantity = quantity
      let displayUnit = unit

      // Determine product type from name for better unit mapping
      const productName = product.display_name.toLowerCase()
      const isBeer = productName.includes('пиво') || productName.includes('beer')
      const isWine = productName.includes('вино') || productName.includes('wine') || productName.includes('сидр')
      const isDraft = productName.includes('розл') || productName.includes('draft') || productName.includes('кег')
      const isBottled = productName.includes('бут') || productName.includes('bottle') || productName.includes('0,') || productName.includes('0.') || productName.includes('л.')

      if (unit === 'kg') {
        // Log weight-based products detected via inventory unit
        

        if (isBeer && isDraft) {
          // Draft beer: convert kg to liters (approximate 1kg = 1L for beer)
          displayQuantity = Math.round(quantity * 100) / 100
          displayUnit = 'L'
        } else if (isWine || (isBeer && !isDraft)) {
          // Wine or other liquids: convert kg to liters
          displayQuantity = Math.round(quantity * 100) / 100
          displayUnit = 'L'
        } else {
          // Food items: keep as kg
          displayQuantity = Math.round(quantity * 100) / 100
          displayUnit = 'kg'
        }
      } else if (unit === 'p') {
        if (isBeer || isWine || isBottled) {
          // Bottles/cans: show as bottles
          displayQuantity = Math.floor(quantity)
          displayUnit = 'bottles'
        } else {
          // Other items: show as pieces
          displayQuantity = Math.floor(quantity)
          displayUnit = 'pcs'
        }
      } else if (unit === 'l' || unit === 'л') {
        displayQuantity = Math.round(quantity * 100) / 100
        displayUnit = 'L'
      } else if (unit === 'г' || unit === 'гр' || unit === 'g') {
        // Convert grams to kg if over 1000g
        if (quantity >= 1000) {
          displayQuantity = Math.round((quantity / 1000) * 100) / 100
          displayUnit = 'kg'
        } else {
          displayQuantity = Math.floor(quantity)
          displayUnit = 'g'
        }
      } else {
        // Default handling for unknown units
        displayQuantity = Math.floor(quantity)
        displayUnit = unit || 'pcs'
      }

      return {
        ...product,
        quantity: displayQuantity,
        unit: displayUnit,
        available: quantity > 0 && product.available,
        branch_id: storageId
      }
    })

    // Filter to show only available products with stock
    const availableProducts = productsWithInventory.filter(product => product.available && product.quantity > 0)

    return availableProducts
  }

  /**
   * Create order in Poster POS
   */
  async createOrder(orderData: any): Promise<any> {
    try {
      // This would be implemented based on Poster's order creation API
      // For now, we'll simulate the response
      

      return {
        success: true,
        order_id: `poster_${Date.now()}`,
        message: 'Order created successfully'
      }
    } catch (error) {
      console.error('Failed to create order in Poster API:', error)
      throw error
    }
  }

  /**
   * Get order status from Poster POS
   */
  async getOrderStatus(posterOrderId: string): Promise<any> {
    try {
      // This would be implemented based on Poster's order status API
      

      return {
        order_id: posterOrderId,
        status: 'confirmed',
        estimated_time: '30 minutes'
      }
    } catch (error) {
      console.error('Failed to get order status from Poster API:', error)
      throw error
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      
      await this.request('application.getConfig')
      
      return true
    } catch (error) {
      console.error('❌ Poster API connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const posterApi = new PosterApiService()
export default posterApi
