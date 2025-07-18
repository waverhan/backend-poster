<template>
  <div class="space-y-6">
    <!-- Review Summary -->
    <div v-if="showSummary && reviewStats" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Overall Rating -->
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900 mb-2">
            {{ reviewStats.average_rating.toFixed(1) }}
          </div>
          <div class="flex items-center justify-center mb-2">
            <div class="flex">
              <span
                v-for="star in 5"
                :key="star"
                class="text-xl"
                :class="star <= Math.round(reviewStats.average_rating) ? 'text-yellow-400' : 'text-gray-300'"
              >
                ⭐
              </span>
            </div>
          </div>
          <p class="text-sm text-gray-600">
            Based on {{ reviewStats.total_reviews }} review{{ reviewStats.total_reviews !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Rating Distribution -->
        <div class="space-y-2">
          <div
            v-for="rating in [5, 4, 3, 2, 1]"
            :key="rating"
            class="flex items-center gap-3"
          >
            <span class="text-sm font-medium w-8">{{ rating }}★</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div
                class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${getRatingPercentage(rating)}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">
              {{ reviewStats.rating_distribution[rating] || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-wrap gap-3">
        <select
          v-model="filters.sort_by"
          @change="applyFilters"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest_rating">Highest Rating</option>
          <option value="lowest_rating">Lowest Rating</option>
          <option value="most_helpful">Most Helpful</option>
        </select>

        <select
          v-model="filters.rating"
          @change="applyFilters"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="undefined">All Ratings</option>
          <option :value="5">5 Stars</option>
          <option :value="4">4 Stars</option>
          <option :value="3">3 Stars</option>
          <option :value="2">2 Stars</option>
          <option :value="1">1 Star</option>
        </select>

        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="filters.verified_only"
            @change="applyFilters"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Verified purchases only
        </label>

        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="filters.with_images"
            @change="applyFilters"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          With photos
        </label>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-medium text-sm">
                {{ review.customer_name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-gray-900">{{ review.customer_name }}</h4>
                <span v-if="review.verified_purchase" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ✓ Verified Purchase
                </span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="text-sm"
                    :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ⭐
                  </span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ formatDate(review.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Content -->
        <div class="space-y-3">
          <h5 v-if="review.title" class="font-medium text-gray-900">
            {{ review.title }}
          </h5>
          
          <p v-if="review.comment" class="text-gray-700 leading-relaxed">
            {{ review.comment }}
          </p>

          <!-- Review Images -->
          <div v-if="review.images && review.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="(image, index) in review.images"
              :key="index"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              @click="openImageModal(review.images, index)"
            >
              <img
                :src="image"
                :alt="`Review image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Store Response -->
        <div v-if="review.response" class="mt-4 bg-gray-50 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-gray-900">Store Response</span>
            <span class="text-xs text-gray-500">{{ formatDate(review.response.created_at) }}</span>
          </div>
          <p class="text-sm text-gray-700">{{ review.response.response_text }}</p>
        </div>

        <!-- Review Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-4">
            <button
              @click="markHelpful(review.id, true)"
              class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              👍 Helpful ({{ review.helpful_votes }})
            </button>
            <button
              @click="markHelpful(review.id, false)"
              class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              👎 Not helpful
            </button>
          </div>
          
          <div class="text-xs text-gray-500">
            {{ review.total_votes }} people found this helpful
          </div>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center">
      <button
        @click="loadMore"
        :disabled="isLoading"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
      >
        {{ isLoading ? 'Loading...' : 'Load More Reviews' }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && reviews.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">📝</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
      <p class="text-gray-600">Be the first to review this product!</p>
    </div>

    <!-- Image Modal -->
    <div v-if="imageModal.show" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="relative max-w-4xl max-h-full">
        <button
          @click="closeImageModal"
          class="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
        >
          ✕
        </button>
        <img
          :src="imageModal.images[imageModal.currentIndex]"
          :alt="`Review image ${imageModal.currentIndex + 1}`"
          class="max-w-full max-h-full object-contain"
        />
        <div v-if="imageModal.images.length > 1" class="absolute inset-y-0 left-0 flex items-center">
          <button
            @click="previousImage"
            class="bg-black bg-opacity-50 text-white p-2 rounded-r hover:bg-opacity-75"
          >
            ‹
          </button>
        </div>
        <div v-if="imageModal.images.length > 1" class="absolute inset-y-0 right-0 flex items-center">
          <button
            @click="nextImage"
            class="bg-black bg-opacity-50 text-white p-2 rounded-l hover:bg-opacity-75"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import reviewService from '@/services/reviewService'
import type { Review, ReviewFilters, ReviewStats } from '@/types/review'

interface Props {
  productId: string
  showSummary?: boolean
  showFilters?: boolean
  initialLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
  showSummary: true,
  showFilters: true,
  initialLimit: 10
})

// State
const reviews = ref<Review[]>([])
const reviewStats = ref<ReviewStats | null>(null)
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const filters = ref<ReviewFilters>({
  sort_by: 'newest',
  limit: props.initialLimit
})

const imageModal = ref({
  show: false,
  images: [] as string[],
  currentIndex: 0
})

// Computed
const hasMore = computed(() => currentPage.value < totalPages.value)

// Methods
const loadReviews = async (reset = false) => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    if (reset) {
      currentPage.value = 1
      reviews.value = []
    }

    const response = await reviewService.getProductReviews(props.productId, {
      ...filters.value,
      page: currentPage.value
    })

    if (reset) {
      reviews.value = response.reviews
    } else {
      reviews.value.push(...response.reviews)
    }

    totalPages.value = response.totalPages
    currentPage.value = response.page

  } catch (error) {
    console.error('Failed to load reviews:', error)
  } finally {
    isLoading.value = false
  }
}

const loadReviewStats = async () => {
  try {
    reviewStats.value = await reviewService.getProductReviewStats(props.productId)
  } catch (error) {
    console.error('Failed to load review stats:', error)
  }
}

const applyFilters = () => {
  loadReviews(true)
}

const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    currentPage.value++
    loadReviews()
  }
}

const markHelpful = async (reviewId: string, helpful: boolean) => {
  try {
    await reviewService.markReviewHelpful(reviewId, helpful)
    // Refresh the specific review or reload all reviews
    loadReviews(true)
  } catch (error) {
    console.error('Failed to mark review as helpful:', error)
  }
}

const getRatingPercentage = (rating: number): number => {
  if (!reviewStats.value || reviewStats.value.total_reviews === 0) return 0
  return (reviewStats.value.rating_distribution[rating] / reviewStats.value.total_reviews) * 100
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openImageModal = (images: string[], index: number) => {
  imageModal.value = {
    show: true,
    images,
    currentIndex: index
  }
}

const closeImageModal = () => {
  imageModal.value.show = false
}

const previousImage = () => {
  if (imageModal.value.currentIndex > 0) {
    imageModal.value.currentIndex--
  }
}

const nextImage = () => {
  if (imageModal.value.currentIndex < imageModal.value.images.length - 1) {
    imageModal.value.currentIndex++
  }
}

// Watchers
watch(() => props.productId, () => {
  loadReviews(true)
  loadReviewStats()
})

// Lifecycle
onMounted(() => {
  loadReviews()
  if (props.showSummary) {
    loadReviewStats()
  }
})
</script>
