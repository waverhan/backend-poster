<template>
  <div class="untappd-reviews">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      <span class="ml-2 text-gray-600">Завантаження відгуків з Untappd...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <div class="text-red-600 mr-2">⚠️</div>
        <div class="text-red-700">{{ error }}</div>
      </div>
    </div>

    <!-- Beer Info -->
    <div v-else-if="beerInfo" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-orange-800">Інформація з Untappd</h3>
        <div class="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded">Untappd</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-orange-700 mb-2">{{ beerInfo.beer_description }}</p>
          <div class="flex items-center gap-4 text-sm">
            <span v-if="beerInfo.beer_abv" class="text-orange-600">
              <strong>ABV:</strong> {{ beerInfo.beer_abv }}%
            </span>
            <span v-if="beerInfo.beer_ibu" class="text-orange-600">
              <strong>IBU:</strong> {{ beerInfo.beer_ibu }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-orange-600">{{ beerInfo.rating_score.toFixed(1) }}</div>
          <div class="text-sm text-orange-600">{{ beerInfo.rating_count }} відгуків</div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div v-if="reviews.length > 0" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Відгуки з Untappd</h3>

      <div
        v-for="review in reviews"
        :key="review.checkin_id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <!-- User Avatar -->
          <img
            v-if="review.user_avatar"
            :src="review.user_avatar"
            :alt="review.user_name"
            class="w-10 h-10 rounded-full object-cover"
            @error="handleAvatarError"
          />
          <div v-else class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span class="text-gray-600 text-sm">👤</span>
          </div>

          <div class="flex-1">
            <!-- User Info and Rating -->
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="font-semibold text-gray-900">{{ review.user_name }}</h4>
                <p class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="text-sm"
                  :class="star <= review.rating_score ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ⭐
                </span>
                <span class="text-sm text-gray-600 ml-1">({{ review.rating_score }})</span>
              </div>
            </div>

            <!-- Review Comment -->
            <p v-if="review.checkin_comment" class="text-gray-700 text-sm leading-relaxed">
              {{ review.checkin_comment }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="reviews.length >= 25" class="text-center mt-6">
        <button
          @click="loadMoreReviews"
          :disabled="loadingMore"
          class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {{ loadingMore ? 'Завантаження...' : 'Завантажити ще' }}
        </button>
      </div>
    </div>

    <!-- No Reviews State -->
    <div v-else-if="!loading && !error" class="text-center py-8">
      <div class="text-gray-400 text-4xl mb-2">📝</div>
      <p class="text-gray-600">Відгуки з Untappd не знайдено</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import untappdService from '@/services/untappdService'
import type { UntappdReview, UntappdBeerInfo } from '@/types/untappd'
import type { Product } from '@/types'

interface Props {
  product: Product
  untappdBeerId?: number
  untappdUrl?: string
}

const props = defineProps<Props>()

// State
const reviews = ref<UntappdReview[]>([])
const beerInfo = ref<UntappdBeerInfo | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')

// Methods
const loadReviews = async () => {
  const isConfigured = await untappdService.isConfigured()
  if (!isConfigured) {
    error.value = 'Сервіс Untappd недоступний. Перевірте підключення до бекенду.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    let beerId: number | null = null

    // Try to get beer ID from props
    if (props.untappdBeerId) {
      beerId = props.untappdBeerId
    } else if (props.untappdUrl) {
      const beerInfoFromUrl = await untappdService.getBeerInfoFromUrl(props.untappdUrl)
      if (beerInfoFromUrl) {
        beerId = beerInfoFromUrl.beer_id
        beerInfo.value = beerInfoFromUrl
      }
    } else {
      // Try to search by product name
      const searchResults = await untappdService.searchBeer(props.product.name, 'Опілля')
      if (searchResults.length > 0) {
        beerId = searchResults[0].beer_id
        // Convert search result to beer info
        const searchResult = searchResults[0]
        beerInfo.value = {
          ...searchResult,
          created_at: new Date().toISOString()
        }
      }
    }

    if (beerId) {
      // Load beer info if not already loaded
      if (!beerInfo.value) {
        beerInfo.value = await untappdService.getBeerInfo(beerId.toString())
      }

      // Load reviews
      const untappdReviews = await untappdService.getBeerReviews(beerId.toString(), 25)
      reviews.value = untappdReviews
    } else {
      error.value = 'Пиво не знайдено в базі Untappd'
    }
  } catch (err) {
    console.error('Error loading Untappd reviews:', err)
    error.value = 'Помилка завантаження відгуків з Untappd'
  } finally {
    loading.value = false
  }
}

const loadMoreReviews = async () => {
  // Implementation for loading more reviews (pagination)
  loadingMore.value = true
  // Add pagination logic here
  loadingMore.value = false
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Show default avatar instead
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = '<span class="text-gray-600 text-sm">👤</span>'
  }
}

// Lifecycle
onMounted(() => {
  // Auto-load reviews if we have Untappd info
  if (props.untappdBeerId || props.untappdUrl) {
    loadReviews()
  }
})
</script>

<style scoped>
.untappd-reviews {
  /* Component-specific styles */
}
</style>
