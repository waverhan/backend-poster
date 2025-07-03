import type { Category, Product, Branch } from '../types'
import type { Order, OrderFormData, OrderItem } from '@/stores/orders'

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api`
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

class BackendApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    
    const categories = await this.request<Category[]>('/categories')
    
    return categories
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
  async getProducts(categoryId?: string, branchId?: string): Promise<Product[]> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (branchId) params.append('branchId', branchId)

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
  async getBranches(): Promise<Branch[]> {
    
    const branches = await this.request<Branch[]>('/branches')
    
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

  async syncInventory(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/inventory', {
      method: 'POST',
    })
    
    return result
  }

  async syncImages(): Promise<{ success: boolean; message: string; stats: any }> {
    
    const result = await this.request<{ success: boolean; message: string; stats: any }>('/sync/images', {
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
  async createOrder(orderData: OrderFormData, items: OrderItem[], deliveryFee: number): Promise<Order> {
    
    const order = await this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        items,
        delivery_fee: deliveryFee
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

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const result = await this.request<{ status: string; message: string }>('/health')
    return result
  }

  // Get full image URL with fallback
  getImageUrl(imagePath: string, posterProductId?: string): string {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath

    // For local images, we'll let the browser handle 404s and fallback in the component
    return `${BACKEND_BASE_URL}${imagePath}`
  }

  // Get fallback Poster image URL
  getPosterImageUrl(posterProductId: string): string {
    if (!posterProductId) return ''
    // Use the actual Poster API format - we'll need to fetch this from the API
    // For now, return a placeholder that will trigger the image error handler
    return `https://joinposter.com/upload/pos_cdb_214175/menu/product_placeholder_${posterProductId}.jpeg`
  }
}

export const backendApi = new BackendApiService()
export default backendApi
