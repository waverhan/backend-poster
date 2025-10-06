import reviewService from './reviewService'
import type { Product } from '@/types'

export interface CombinedRating {
  averageRating: number
  totalReviews: number
  localRating?: number
  localReviewCount?: number
  untappdRating?: number
  untappdReviewCount?: number
  hasLocalReviews: boolean
  hasUntappdRating: boolean
}

class RatingService {
  // Parse Untappd rating from product attributes
  private parseUntappdRating(product: Product): { rating?: number; count?: number } {
    if (!product.attributes) return {}

    try {
      let attrs: any = {}
      
      if (typeof product.attributes === 'string') {
        attrs = JSON.parse(product.attributes)
      } else if (Array.isArray(product.attributes)) {
        // Convert array format to object
        product.attributes.forEach(attr => {
          attrs[attr.name] = attr.value
        })
      } else {
        attrs = product.attributes
      }

      const rating = attrs.untappd_rating ? parseFloat(attrs.untappd_rating) : undefined
      const count = attrs.untappd_rating_count ? parseInt(attrs.untappd_rating_count) : undefined

      return { rating, count }
    } catch (error) {
      console.error('Error parsing Untappd rating:', error)
      return {}
    }
  }

  // Get combined rating for a product
  async getCombinedRating(product: Product): Promise<CombinedRating> {
    try {
      // Get local review stats (includes imported Untappd reviews)
      const localStats = await reviewService.getProductReviewStats(product.id)
      const hasLocalReviews = localStats.total_reviews > 0

      if (hasLocalReviews) {
        return {
          averageRating: parseFloat(localStats.average_rating.toFixed(1)),
          totalReviews: localStats.total_reviews,
          localRating: localStats.average_rating,
          localReviewCount: localStats.total_reviews,
          hasLocalReviews: true,
          hasUntappdRating: false
        }
      } else {
        // No reviews available
        return {
          averageRating: 0,
          totalReviews: 0,
          hasLocalReviews: false,
          hasUntappdRating: false
        }
      }
    } catch (error) {
      console.warn('Review service unavailable:', error.message)

      // Return empty rating when API is unavailable
      return {
        averageRating: 0,
        totalReviews: 0,
        hasLocalReviews: false,
        hasUntappdRating: false
      }
    }
  }

  // Get combined ratings for multiple products (for product lists)
  async getCombinedRatings(products: Product[]): Promise<Record<string, CombinedRating>> {
    const ratings: Record<string, CombinedRating> = {}
    
    // Process products in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (product) => {
        try {
          const rating = await this.getCombinedRating(product)
          return { productId: product.id, rating }
        } catch (error) {
          console.error(`Error getting rating for product ${product.id}:`, error)
          return { 
            productId: product.id, 
            rating: {
              averageRating: 0,
              totalReviews: 0,
              hasLocalReviews: false,
              hasUntappdRating: false
            } as CombinedRating
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(({ productId, rating }) => {
        ratings[productId] = rating
      })
    }
    
    return ratings
  }

  // Check if product is a beer (for Untappd integration)
  isBeerProduct(product: Product): boolean {
    const beerCategories = ['пиво', 'beer', 'лагер', 'ель', 'стаут', 'портер']
    const categoryName = product.category_name?.toLowerCase() || ''
    const productName = product.name?.toLowerCase() || ''
    
    return beerCategories.some(category => 
      categoryName.includes(category) || productName.includes(category)
    )
  }

  // Format rating for display
  formatRating(rating: number): string {
    return rating.toFixed(1)
  }

  // Get star rating (1-5 scale)
  getStarRating(rating: number): number {
    return Math.round(rating)
  }

  // Generate rating summary text
  getRatingSummary(combinedRating: CombinedRating): string {
    const { averageRating, totalReviews, hasLocalReviews, hasUntappdRating } = combinedRating
    
    if (totalReviews === 0) {
      return 'Немає відгуків'
    }

    let summary = `${this.formatRating(averageRating)} з 5`
    
    if (hasLocalReviews && hasUntappdRating) {
      summary += ` (${totalReviews} відгуків)`
    } else if (hasLocalReviews) {
      summary += ` (${totalReviews} місцевих відгуків)`
    } else if (hasUntappdRating) {
      summary += ` (${totalReviews} відгуків на Untappd)`
    }
    
    return summary
  }
}

export default new RatingService()
