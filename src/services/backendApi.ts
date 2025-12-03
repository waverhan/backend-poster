import type { Category, Product, Branch } from '../types'
import type { Order, OrderFormData, OrderItem } from '@/stores/orders'

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api`
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

class BackendApiService {
  public baseUrl = API_BASE_URL

  private getAuthToken(): string | null {
    // Try to get token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getAuthToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Categories
  async getCategories(includeInactive = false): Promise<Category[]> {
    const params = includeInactive ? '?includeInactive=true' : ''
    console.log(`🔗 Fetching categories from: ${API_BASE_URL}/categories${params}`)

    try {
      const categories = await this.request<Category[]>(`/categories${params}`)
      console.log(`✅ Backend API returned ${Array.isArray(categories) ? categories.length : 'non-array'} categories`)
      console.log('📋 Response type:', typeof categories, 'Is array:', Array.isArray(categories))

      if (!Array.isArray(categories)) {
        console.error('❌ Categories response is not an array:', categories)
        return []
      }

      return categories
    } catch (error) {
      console.error('❌ Backend API error fetching categories:', error)
      throw error
    }
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'product_count'>): Promise<Category> {
    
    const newCategory = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
    
    return newCategory
  }

  async updateCategory(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at' | 'product_count'>>): Promise<Category> {
    
    const updatedCategory = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    })
    
    return updatedCategory
  }

  // Products
  async getProducts(categoryId?: string, branchId?: string, includeInactive = false): Promise<Product[]> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (branchId) params.append('branchId', branchId)
    if (includeInactive) params.append('includeInactive', 'true')
    // Add cache-busting parameter to force fresh data
    params.append('_t', Date.now().toString())

    const queryString = params.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`

    const products = await this.request<Product[]>(endpoint)

    return products
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'quantity' | 'unit' | 'available'>): Promise<Product> {
    
    const newProduct = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
    
    return newProduct
  }

  async updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'quantity' | 'unit' | 'available'>>): Promise<Product> {

    const updatedProduct = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })

    return updatedProduct
  }

  async bulkEditProducts(bulkEditData: { productIds: string[], updates: any }): Promise<any> {

    const result = await this.request<any>('/products/bulk-edit', {
      method: 'POST',
      body: JSON.stringify(bulkEditData),
    })

    return result
  }

  async uploadProductImage(file: File): Promise<string> {
    

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.baseUrl}/upload/product-image`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    
    return result.imagePath
  }

  // Branches
  async getBranches(includeInactive = false): Promise<Branch[]> {
    const params = includeInactive ? '?includeInactive=true' : ''
    const branches = await this.request<Branch[]>(`/branches${params}`)

    return branches
  }

  async createBranch(branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    
    const newBranch = await this.request<Branch>('/branches', {
      method: 'POST',
      body: JSON.stringify(branch),
    })
    
    return newBranch
  }

  async updateBranch(id: string, branch: Partial<Omit<Branch, 'id' | 'created_at' | 'updated_at'>>): Promise<Branch> {
    
    const updatedBranch = await this.request<Branch>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branch),
    })
    
    return updatedBranch
  }

  // Sync operations
  async syncFullData(): Promise<{ success: boolean; message: string; stats: any }> {

    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/full', {
      method: 'POST',
    })

    return result
  }

  async syncProductsOnly(): Promise<{ success: boolean; message: string; stats: any }> {

    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/products-only', {
      method: 'POST',
    })

    return result
  }

  async syncPricesOnly(): Promise<{ success: boolean; message: string; stats: any }> {

    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/prices-only', {
      method: 'POST',
    })

    return result
  }

  async triggerInventorySync(): Promise<{ success: boolean; message: string }> {

    const result = await this.request<{ success: boolean; message: string }>('/sync/inventory', {
      method: 'POST',
    })

    return result
  }

  async getSyncStatus(): Promise<any> {

    const result = await this.request<any>('/inventory/sync/status/latest')

    return result
  }

  async getSyncHistory(limit: number = 10): Promise<any[]> {

    const result = await this.request<any[]>(`/inventory/sync/history?limit=${limit}`)

    return result
  }

  async syncInventory(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/inventory', {
      method: 'POST',
    })
    
    return result
  }

  async syncImages(): Promise<{ success: boolean; message: string; summary: any }> {

    const result = await this.request<{ success: boolean; message: string; summary: any }>('/sync/images-only', {
      method: 'POST',
    })

    return result
  }

  async fixImages(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/fix-images', {
      method: 'POST',
    })
    
    return result
  }

  async fixPrices(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/fix-prices', {
      method: 'POST',
    })
    
    return result
  }

  async fixImagesFromApi(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/fix-images-from-api', {
      method: 'POST',
    })
    
    return result
  }

  async downloadImages(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/download-images', {
      method: 'POST',
    })
    
    return result
  }

  // Orders
  async createOrder(orderData: OrderFormData, items: OrderItem[], deliveryFee: number, paymentMethod: 'cash' | 'online' = 'cash'): Promise<Order> {

    const order = await this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        items,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod
      }),
    })

    return order
  }

  async getOrders(): Promise<Order[]> {
    
    const orders = await this.request<Order[]>('/orders')
    
    return orders
  }

  async getOrder(id: string): Promise<Order> {
    
    const order = await this.request<Order>(`/orders/${id}`)
    
    return order
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    
    const order = await this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
    
    return order
  }

  async sendOrderToPoster(orderId: string): Promise<{ success: boolean; posterOrderId?: string; message: string }> {
    
    const result = await this.request<{ success: boolean; posterOrderId?: string; message: string }>(`/orders/${orderId}/send-to-poster`, {
      method: 'POST',
    })
    
    return result
  }

  // Inventory
  async getBranchInventory(branchId: string): Promise<any[]> {

    const inventory = await this.request<any[]>(`/inventory/branch/${branchId}`)

    return inventory
  }

  async getProductsInventory(productIds: string[], branchId: string): Promise<any[]> {

    const inventory = await this.request<any[]>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify({
        product_ids: productIds,
        branch_id: branchId
      }),
    })

    return inventory
  }

  async checkProductAvailability(productId: string, branchId: string, quantity: number = 1): Promise<any> {

    const result = await this.request<any>(`/inventory/check/${productId}/${branchId}?quantity=${quantity}`)

    return result
  }

  async getLowStockAlerts(branchId: string): Promise<any[]> {

    const result = await this.request<any[]>(`/inventory/low-stock/${branchId}`)

    return result
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const result = await this.request<{ status: string; message: string }>('/health')
    return result
  }

  // Get full image URL with fallback
  getImageUrl(imagePath: string, posterProductId?: string): string {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath

    // Handle different path formats
    let normalizedPath = imagePath

    // If path starts with 'products/', add '/images/' prefix
    if (imagePath.startsWith('products/')) {
      normalizedPath = `/images/${imagePath}`
    }
    // If path doesn't start with '/', add it
    else if (!imagePath.startsWith('/')) {
      normalizedPath = `/${imagePath}`
    }

    return `${BACKEND_BASE_URL}${normalizedPath}`
  }

  // Generate an optimized image URL that leverages the backend transformer when available
  getOptimizedImageUrl(
    imagePath: string,
    options: { width?: number; format?: 'webp' | 'avif' | 'jpeg' | 'png'; quality?: number } = {}
  ): string {
    if (!imagePath) return ''

    const baseUrl = this.getImageUrl(imagePath)
    const canTransform = imagePath.startsWith('/api/upload/minio-image')

    if (!canTransform || !baseUrl) {
      return baseUrl
    }

    try {
      const optimizedUrl = new URL(baseUrl)
      if (options.width) {
        optimizedUrl.searchParams.set('w', String(Math.round(options.width)))
      }
      if (options.format) {
        optimizedUrl.searchParams.set('format', options.format)
      }
      if (options.quality) {
        optimizedUrl.searchParams.set('q', String(Math.round(options.quality)))
      }
      return optimizedUrl.toString()
    } catch (error) {
      console.warn('Failed to build optimized image URL, falling back to original:', error)
      return baseUrl
    }
  }

  // Get Poster image URL with smart fallback
  getPosterImageUrl(posterProductId: string): string {
    if (!posterProductId) return ''

    // Try the most common Poster image patterns first
    const commonTimestamps = [
      '1707315138', '1678998630', '1678998675', '1678998721', '1688988756',
      '1678785050', '1678785078', '1717493132', '1678785093', '1678785064'
    ]

    // Return the most likely URL (first common timestamp with .png)
    return `https://joinposter.com/upload/pos_cdb_214175/menu/product_${commonTimestamps[0]}_${posterProductId}.png`
  }

  // Get all possible Poster image URLs for fallback
  getAllPosterImageUrls(posterProductId: string): string[] {
    if (!posterProductId) return []

    const timestamps = [
      '1707315138', '1678998630', '1678998675', '1678998721', '1688988756',
      '1678785050', '1678785078', '1717493132', '1678785093', '1678785064',
      '1689445896', '1678785128', '1678996480', '1678996934', '1679039883'
    ]
    const extensions = ['png', 'jpeg', 'jpg']
    const urls = []

    // Generate all possible combinations
    for (const timestamp of timestamps) {
      for (const ext of extensions) {
        urls.push(`https://joinposter.com/upload/pos_cdb_214175/menu/product_${timestamp}_${posterProductId}.${ext}`)
      }
    }

    // Also try without timestamp
    for (const ext of extensions) {
      urls.push(`https://joinposter.com/upload/pos_cdb_214175/menu/product_${posterProductId}.${ext}`)
    }

    return urls
  }

  // Generic HTTP methods for use by stores
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint)
    return { data }
  }

  async post<T>(endpoint: string, body: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return { data }
  }

  async put<T>(endpoint: string, body: any): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return { data }
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'DELETE',
    })
    return { data }
  }
}

export const backendApi = new BackendApiService()
export default backendApi
