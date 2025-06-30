export interface Review {
  id: string
  product_id: string
  order_id: string
  customer_name: string
  customer_email: string
  rating: number // 1-5 stars
  title?: string
  comment?: string
  images?: string[] // URLs to uploaded review images
  verified_purchase: boolean
  helpful_votes: number
  total_votes: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  response?: ReviewResponse // Store/admin response
}

export interface ReviewResponse {
  id: string
  review_id: string
  responder_name: string
  responder_role: 'admin' | 'store_manager'
  response_text: string
  created_at: string
}

export interface ReviewStats {
  product_id: string
  total_reviews: number
  average_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recent_reviews: Review[]
}

export interface ReviewFormData {
  product_id: string
  order_id: string
  rating: number
  title?: string
  comment?: string
  images?: File[]
}

export interface ReviewFilters {
  rating?: number
  verified_only?: boolean
  with_images?: boolean
  sort_by?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
  page?: number
  limit?: number
}

export interface ReviewSummary {
  total_reviews: number
  average_rating: number
  recommendation_percentage: number // % who would recommend
  rating_breakdown: Record<number, number>
  common_keywords: string[] // Most mentioned words in reviews
}
