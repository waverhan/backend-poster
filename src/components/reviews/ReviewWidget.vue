<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Recent Reviews</h3>
      <router-link to="/reviews" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
        View All
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div v-else-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-blue-600 font-medium text-sm">
              {{ review.customer_name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Review Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-medium text-gray-900 text-sm truncate">
                {{ review.customer_name }}
              </h4>
              <div class="flex">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="text-xs"
                  :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ⭐
                </span>
              </div>
              <span v-if="review.verified_purchase" class="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                ✓
              </span>
            </div>

            <p v-if="review.title" class="font-medium text-gray-900 text-sm mb-1">
              {{ review.title }}
            </p>

            <p class="text-gray-600 text-sm line-clamp-2 mb-2">
              {{ review.comment || 'Great product!' }}
            </p>

            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>{{ formatDate(review.created_at) }}</span>
              <span v-if="review.product_name" class="truncate">
                {{ review.product_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <div class="text-4xl mb-2">⭐</div>
      <p class="text-gray-600 text-sm">No reviews yet</p>
      <p class="text-gray-500 text-xs">Be the first to leave a review!</p>
    </div>

    <!-- Overall Stats -->
    <div v-if="stats" class="mt-6 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-lg font-bold text-gray-900">{{ stats.total_reviews }}</div>
          <div class="text-xs text-gray-600">Reviews</div>
        </div>
        <div>
          <div class="text-lg font-bold text-gray-900">{{ stats.average_rating.toFixed(1) }}</div>
          <div class="text-xs text-gray-600">Average</div>
        </div>
        <div>
          <div class="text-lg font-bold text-gray-900">{{ stats.recommendation_percentage }}%</div>
          <div class="text-xs text-gray-600">Recommend</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import reviewService from '@/services/reviewService'
import type { Review } from '@/types/review'

interface ReviewStats {
  total_reviews: number
  average_rating: number
  recommendation_percentage: number
}

interface Props {
  maxReviews?: number
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxReviews: 3,
  showStats: true
})

// State
const reviews = ref<Review[]>([])
const stats = ref<ReviewStats | null>(null)
const isLoading = ref(true)

// Methods
const loadRecentReviews = async () => {
  try {
    isLoading.value = true
    const recentReviews = await reviewService.getRecentReviews(props.maxReviews)
    reviews.value = recentReviews

    if (props.showStats && recentReviews.length > 0) {
      // Calculate basic stats from recent reviews
      const totalRating = recentReviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = totalRating / recentReviews.length
      const recommendCount = recentReviews.filter(review => review.rating >= 4).length
      const recommendPercentage = Math.round((recommendCount / recentReviews.length) * 100)

      stats.value = {
        total_reviews: recentReviews.length,
        average_rating: avgRating,
        recommendation_percentage: recommendPercentage
      }
    }
  } catch (error) {
    console.error('Failed to load recent reviews:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadRecentReviews()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
