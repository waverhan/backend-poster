import type { Review, ReviewFormData, ReviewFilters, ReviewStats, ReviewSummary } from '@/types/review'

class ReviewService {
  private baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/reviews`

  // Submit a new review
  async submitReview(reviewData: ReviewFormData): Promise<Review> {
    const formData = new FormData()

    formData.append('product_id', reviewData.product_id)
    formData.append('order_id', reviewData.order_id)
    formData.append('rating', reviewData.rating.toString())
    formData.append('email', reviewData.email)
    formData.append('phone', reviewData.phone)

    if (reviewData.title) formData.append('title', reviewData.title)
    if (reviewData.comment) formData.append('comment', reviewData.comment)
    if (reviewData.recaptcha_response) formData.append('recaptcha_response', reviewData.recaptcha_response)

    // Add images if any (currently disabled)
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to submit review')
    }

    return response.json()
  }

  // Get reviews for a product
  async getProductReviews(productId: string, filters: ReviewFilters = {}): Promise<{
    reviews: Review[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams({
      product_id: productId,
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 10).toString()
    })

    if (filters.rating) params.append('rating', filters.rating.toString())
    if (filters.verified_only) params.append('verified_only', 'true')
    if (filters.with_images) params.append('with_images', 'true')
    if (filters.sort_by) params.append('sort_by', filters.sort_by)

    const response = await fetch(`${this.baseUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews')
    }

    return response.json()
  }

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    const response = await fetch(`${this.baseUrl}/stats/${productId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch review stats')
    }

    return response.json()
  }

  // Get review summary for multiple products
  async getReviewSummaries(productIds: string[]): Promise<Record<string, ReviewSummary>> {
    const response = await fetch(`${this.baseUrl}/summaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_ids: productIds })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch review summaries')
    }

    return response.json()
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId: string, helpful: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ helpful })
    })

    if (!response.ok) {
      throw new Error('Failed to mark review as helpful')
    }
  }

  // Get reviews for order (for post-purchase review requests)
  async getOrderReviews(orderId: string): Promise<{
    reviews: Review[]
    pending_products: Array<{
      product_id: string
      product_name: string
      can_review: boolean
    }>
  }> {
    const response = await fetch(`${this.baseUrl}/order/${orderId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch order reviews')
    }

    return response.json()
  }

  // Check if user can review a product from an order
  async canReviewProduct(orderId: string, productId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/can-review/${orderId}/${productId}`)
    
    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.can_review
  }

  // Get recent reviews for homepage/dashboard
  async getRecentReviews(limit = 5): Promise<Review[]> {
    const response = await fetch(`${this.baseUrl}/recent?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent reviews')
    }

    const data = await response.json()
    return data.reviews
  }

  // Admin: Get all reviews with filters
  async getAllReviews(filters: ReviewFilters & { status?: string } = {}): Promise<{
    reviews: Review[]
    total: number
    page: number
    totalPages: number
  }> {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 20).toString()
    })

    if (filters.rating) params.append('rating', filters.rating.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.verified_only) params.append('verified_only', 'true')
    if (filters.sort_by) params.append('sort_by', filters.sort_by)

    const response = await fetch(`${this.baseUrl}/admin?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch all reviews')
    }

    return response.json()
  }

  // Admin: Update review status
  async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${reviewId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      throw new Error('Failed to update review status')
    }
  }

  // Admin: Respond to review
  async respondToReview(reviewId: string, responseText: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${reviewId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ response_text: responseText })
    })

    if (!response.ok) {
      throw new Error('Failed to respond to review')
    }
  }

  // Get review analytics for dashboard
  async getReviewAnalytics(days = 30): Promise<{
    total_reviews: number
    average_rating: number
    reviews_trend: Array<{ date: string; count: number; avg_rating: number }>
    top_rated_products: Array<{ product_id: string; product_name: string; avg_rating: number; review_count: number }>
    recent_negative_reviews: Review[]
  }> {
    const response = await fetch(`${this.baseUrl}/analytics?days=${days}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch review analytics')
    }

    return response.json()
  }

  // Upload review image
  async uploadReviewImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.baseUrl}/upload-image`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload review image')
    }

    const data = await response.json()
    return data.image_url
  }

  // Generate review request email content
  generateReviewRequestEmail(orderData: {
    customer_name: string
    order_id: string
    products: Array<{ id: string; name: string }>
  }): {
    subject: string
    html: string
    text: string
  } {
    const reviewUrl = `${window.location.origin}/review-order/${orderData.order_id}`
    
    const subject = `How was your order? Share your experience!`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${orderData.customer_name}!</h2>
        <p>Thank you for your recent order (#${orderData.order_id}). We hope you enjoyed your products!</p>
        
        <p>Your feedback helps us improve and helps other customers make better choices. Would you mind taking a few minutes to review your purchase?</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Products in your order:</h3>
          <ul>
            ${orderData.products.map(p => `<li>${p.name}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Write a Review
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This should only take a few minutes, and your honest feedback is greatly appreciated!
        </p>
      </div>
    `
    
    const text = `
Hi ${orderData.customer_name}!

Thank you for your recent order (#${orderData.order_id}). We hope you enjoyed your products!

Your feedback helps us improve and helps other customers make better choices. Would you mind taking a few minutes to review your purchase?

Products in your order:
${orderData.products.map(p => `- ${p.name}`).join('\n')}

Please visit: ${reviewUrl}

This should only take a few minutes, and your honest feedback is greatly appreciated!
    `
    
    return { subject, html, text }
  }
}

export default new ReviewService()
