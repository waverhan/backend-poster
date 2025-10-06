interface LikeStatus {
  product_id: string
  total_likes: number
  user_has_liked: boolean
}

interface LikeToggleResponse {
  success: boolean
  action: 'liked' | 'unliked'
  product_id: string
  total_likes: number
  user_has_liked: boolean
}

interface PopularProduct {
  product: any
  like_count: number
}

class LikeService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/likes`
  }

  // Generate a session ID for anonymous users
  private getSessionId(): string {
    let sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  // Get like status for a product
  async getProductLikeStatus(productId: string, userId?: string): Promise<LikeStatus> {
    try {
      const params = new URLSearchParams()
      if (userId) {
        params.append('user_id', userId)
      }

      const response = await fetch(`${this.baseUrl}/product/${productId}?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting product like status:', error)
      throw error
    }
  }

  // Toggle like for a product
  async toggleProductLike(productId: string, userId?: string): Promise<LikeToggleResponse> {
    try {
      const sessionId = this.getSessionId()
      
      const response = await fetch(`${this.baseUrl}/product/${productId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error toggling product like:', error)
      throw error
    }
  }

  // Get popular products (most liked)
  async getPopularProducts(limit: number = 10): Promise<PopularProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/popular?limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.popular_products || []
    } catch (error) {
      console.error('Error getting popular products:', error)
      throw error
    }
  }
}

export default new LikeService()
