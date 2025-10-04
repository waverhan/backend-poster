<template>
  <div class="untappd-reviews">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-gray-900">Відгуки з Untappd</h3>
        <div class="flex items-center gap-1 text-sm text-gray-600">
          <span class="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">U</span>
          <span>Untappd</span>
        </div>
      </div>
      <button
        v-if="!loading && reviews.length === 0"
        @click="loadReviews"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Завантажити відгуки
      </button>
    </div>

    <!-- Beer Info -->
    <div v-if="beerInfo" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <img
          v-if="beerInfo.beer_label"
          :src="beerInfo.beer_label"
          :alt="beerInfo.beer_name"
          class="w-12 h-12 rounded-lg object-cover"
        />
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">{{ beerInfo.beer_name }}</h4>
          <p class="text-sm text-gray-600">{{ beerInfo.brewery_name }}</p>
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-700">
            <span v-if="beerInfo.beer_abv">{{ beerInfo.beer_abv }}% ABV</span>
            <span v-if="beerInfo.beer_ibu">{{ beerInfo.beer_ibu }} IBU</span>
            <span v-if="beerInfo.rating_score" class="flex items-center gap-1">
              ⭐ {{ beerInfo.rating_score.toFixed(2) }}
              <span class="text-gray-500">({{ beerInfo.rating_count }} відгуків)</span>
            </span>
          </div>
          <p v-if="beerInfo.beer_description" class="text-sm text-gray-600 mt-2">
            {{ beerInfo.beer_description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <span class="ml-3 text-gray-600">Завантаження відгуків з Untappd...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p class="text-red-700">{{ error }}</p>
      <button
        @click="loadReviews"
        class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Спробувати ще раз
      </button>
    </div>

    <!-- No Reviews -->
    <div v-else-if="reviews.length === 0 && !loading" class="text-center py-8 text-gray-500">
      <p>Відгуки з Untappd не знайдено</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.checkin_id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start gap-3">
          <!-- User Avatar -->
          <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            <img
              v-if="review.user_avatar"
              :src="review.user_avatar"
              :alt="review.user_name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              {{ review.user_name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <!-- Review Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h5 class="font-medium text-gray-900">{{ review.user_name }}</h5>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <div v-if="review.rating_score > 0" class="flex items-center">
                    <span class="text-yellow-500">⭐</span>
                    <span class="ml-1">{{ review.rating_score.toFixed(1) }}</span>
                  </div>
                  <span>{{ formatDate(review.created_at) }}</span>
                </div>
              </div>
              <div class="text-xs text-orange-600 font-medium">Untappd</div>
            </div>

            <!-- Review Comment -->
            <p class="text-gray-700 text-sm leading-relaxed">
              {{ review.checkin_comment }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="reviews.length >= 25" class="text-center pt-4">
        <button
          @click="loadMoreReviews"
          :disabled="loadingMore"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {{ loadingMore ? 'Завантаження...' : 'Завантажити більше відгуків' }}
        </button>
      </div>
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
  if (!untappdService.isConfigured()) {
    error.value = 'Untappd API не налаштовано'
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
