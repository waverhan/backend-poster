<template>
  <div class="min-h-screen bg-white">
    <!-- Cart Animation Overlay -->
    <CartAnimationOverlay ref="cartAnimationOverlay" />

    <!-- Mobile Native Back Button (iOS/Android style) - Only on mobile -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 shadow-sm safe-area-top">
      <div class="flex items-center h-14 px-4">
        <button
          @click="goBack"
          class="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="flex-1 text-center text-base font-semibold text-gray-900 pr-10 truncate">
          {{ product?.display_name || 'Товар' }}
        </h1>
      </div>
    </div>

    <!-- Loading State -->
    <ProductDetailSkeleton v-if="loading" />

    <!-- Product Not Found -->
    <div v-else-if="!product" class="flex items-center justify-center min-h-screen px-4">
      <div class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Товар не знайдено</h2>
        <p class="text-gray-600 mb-6">Товар, який ви шукаєте, не існує.</p>
        <button @click="goBack" class="btn-primary">
          Назад до магазину
        </button>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else>
      <!-- Mobile: Native App Style (Full-screen layout) -->
      <div class="md:hidden pt-14 pb-32">
        <!-- Image Gallery Section (Full-width on mobile) -->
        <div class="relative bg-gray-50">
        <!-- Main Product Image -->
        <div class="aspect-square w-full bg-gray-100 relative">
          <img
            v-if="product.display_image_url"
            :src="getImageUrl(product.display_image_url)"
            :alt="product.display_name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Badges Container - Top-right corner -->
          <div class="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
            <!-- Sale Badge -->
            <div v-if="product.original_price && product.original_price > product.price">
              <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                SALE
              </span>
            </div>

            <!-- New Product Badge -->
            <div v-if="isNewProduct" class="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              ✨ Новинка
            </div>
          </div>

          <!-- Like Button - Top-left corner (opposite of badges) -->
          <div class="absolute top-4 left-4 z-10">
            <LikeButton
              :product="product"
              size="large"
              variant="floating"
              :show-count="true"
            />
          </div>
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="px-4 py-6 space-y-6">
        <!-- Title & Rating -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ product.display_name }}</h2>

          <!-- Product Subtitle -->
          <p v-if="productSubtitle" class="text-base text-gray-600 mb-3">{{ productSubtitle }}</p>

          <!-- Rating -->
          <div v-if="combinedRating && combinedRating.totalReviews > 0" class="flex items-center gap-2 mb-4">
            <div class="flex">
              <span
                v-for="star in 5"
                :key="star"
                class="text-base"
                :class="star <= Math.round(combinedRating.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
              >
                ⭐
              </span>
            </div>
            <a
              href="#reviews-section"
              class="text-sm text-gray-600 hover:text-primary-600 underline cursor-pointer"
              @click="scrollToReviews"
            >
              ({{ combinedRating.totalReviews }} відгуків)
            </a>
          </div>
        </div>

        <!-- Price Section -->
        <div class="bg-gray-50 -mx-4 px-4 py-4 border-y border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-3">
                <span :class="[
                  'text-3xl font-black',
                  product.original_price && product.original_price > product.price
                    ? 'text-red-600'
                    : 'text-gray-900'
                ]">
                  {{ formatPrice(product.price) }}₴
                </span>
                <span v-if="product.original_price && product.original_price > product.price"
                      class="text-lg text-gray-500 line-through">
                  {{ formatPrice(product.original_price) }}₴
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ getUnitLabel(product.unit) }}</p>
            </div>
          </div>
        </div>

        <!-- Product Attributes -->
        <div v-if="displayAttributes && displayAttributes.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="attribute in displayAttributes"
              :key="attribute.name"
              class="bg-gray-50 rounded-lg p-3 text-center"
            >
              <div class="text-xs text-gray-600 mb-1">{{ attribute.name }}</div>
              <div
                class="text-base font-bold"
                :class="attribute.color === 'orange' ? 'text-primary-600' : 'text-gray-900'"
              >
                {{ attribute.value }}{{ attribute.unit }}
              </div>
              <div v-if="attribute.color === 'orange'" class="w-full h-1 bg-primary-600 rounded mt-1"></div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="displayDescription">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Опис</h3>
          <div class="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            <span v-if="!isLongDescription || showFullDescription">{{ displayDescription }}</span>
            <span v-else>{{ truncatedDescription }}</span>
          </div>
          <button
            v-if="isLongDescription"
            @click="showFullDescription = !showFullDescription"
            class="text-primary-600 hover:text-primary-700 text-sm mt-3 font-medium"
          >
            {{ showFullDescription ? '▲ Показати менше' : '▼ Показати більше' }}
          </button>
        </div>
      </div>

      <!-- Reviews Section -->
      <div id="reviews-section" v-if="siteConfigStore.currentConfig.enable_reviews" class="border-t-8 border-gray-100 py-6 px-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Відгуки</h3>
          <button
            @click="showReviewForm = !showReviewForm"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {{ showReviewForm ? 'Скасувати' : 'Написати відгук' }}
          </button>
        </div>

        <!-- Review Form -->
        <div v-if="showReviewForm" class="mb-6">
          <ReviewForm
            v-if="product"
            :product="product"
            :order-id="'guest-review'"
            :show-cancel="true"
            @submitted="handleReviewSubmitted"
            @cancel="showReviewForm = false"
          />
        </div>

        <!-- Review List -->
        <div>
          <ReviewList
            v-if="product"
            :product-id="product.id"
            :show-summary="false"
            :show-filters="false"
          />
        </div>
      </div>

        <!-- Related Products Section -->
        <div v-if="product" class="border-t-8 border-gray-100 py-6">
          <div class="px-4 mb-4">
            <h3 class="text-xl font-bold text-gray-900">Схожі товари</h3>
          </div>
          <RelatedProducts
            :current-product="product"
            :max-products="6"
            @cart-animation="handleCartAnimation"
          />
        </div>

        <!-- Sticky Bottom Button (Native App Style) - Above mobile nav -->
        <div
          v-if="product"
          class="fixed left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
          style="bottom: calc(env(safe-area-inset-bottom) + 64px);"
        >
          <div class="px-4 py-3">
            <button
              ref="addToCartButton"
              @click="handleAddToCart"
              :disabled="!product.available"
              class="w-full h-14 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
            >
              <span v-if="product.available" class="flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span>Додати до кошика</span>
              </span>
              <span v-else>Немає в наявності</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop: Traditional Layout (Two-column grid) -->
      <div class="hidden md:block">
        <!-- Desktop Header with Back Button -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <button
                @click="goBack"
                class="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                ← Повернутися до магазину
              </button>
            </div>
          </div>
        </header>

        <!-- Product Content -->
        <div class="container mx-auto px-4 py-8">

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column: Image Gallery -->
          <div class="sticky top-4 self-start">
            <div class="relative bg-gray-50 rounded-xl overflow-hidden">
              <!-- Main Product Image -->
              <div class="aspect-square w-full bg-gray-100 relative">
                <img
                  v-if="product.display_image_url"
                  :src="getImageUrl(product.display_image_url)"
                  :alt="product.display_name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <!-- Badges Container - Top-right corner -->
                <div class="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                  <!-- Sale Badge -->
                  <div v-if="product.original_price && product.original_price > product.price">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                      SALE
                    </span>
                  </div>

                  <!-- New Product Badge -->
                  <div v-if="isNewProduct" class="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    ✨ Новинка
                  </div>
                </div>

                <!-- Like Button - Top-left corner -->
                <div class="absolute top-4 left-4 z-10">
                  <LikeButton
                    :product="product"
                    size="large"
                    variant="floating"
                    :show-count="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Info -->
          <div class="space-y-6">
            <!-- Title & Rating -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.display_name }}</h1>

              <!-- Product Subtitle -->
              <p v-if="productSubtitle" class="text-lg text-gray-600 mb-3">{{ productSubtitle }}</p>

              <!-- Rating -->
              <div v-if="combinedRating && combinedRating.totalReviews > 0" class="flex items-center gap-2 mb-4">
                <div class="flex">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="text-lg"
                    :class="star <= Math.round(combinedRating.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ⭐
                  </span>
                </div>
                <a
                  href="#reviews-section"
                  class="text-sm text-gray-600 hover:text-primary-600 underline cursor-pointer"
                  @click="scrollToReviews"
                >
                  ({{ combinedRating.totalReviews }} відгуків)
                </a>
              </div>
            </div>

            <!-- Price Section -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span :class="[
                      'text-4xl font-black',
                      product.original_price && product.original_price > product.price
                        ? 'text-red-600'
                        : 'text-gray-900'
                    ]">
                      {{ formatPrice(product.price) }}₴
                    </span>
                    <span v-if="product.original_price && product.original_price > product.price"
                          class="text-xl text-gray-500 line-through">
                      {{ formatPrice(product.original_price) }}₴
                    </span>
                  </div>
                  <p class="text-base text-gray-600 mt-1">{{ getUnitLabel(product.unit) }}</p>
                </div>
                <button
                  @click="handleAddToCart"
                  :disabled="!product.available"
                  class="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
                >
                  <span v-if="product.available" class="flex items-center gap-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                    <span>Додати до кошика</span>
                  </span>
                  <span v-else>Немає в наявності</span>
                </button>
              </div>
            </div>

            <!-- Product Attributes -->
            <div v-if="displayAttributes && displayAttributes.length > 0" class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Характеристики</h3>
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="attribute in displayAttributes"
                  :key="attribute.name"
                  class="bg-gray-50 rounded-lg p-4 text-center"
                >
                  <div class="text-sm text-gray-600 mb-1">{{ attribute.name }}</div>
                  <div
                    class="text-lg font-bold"
                    :class="attribute.color === 'orange' ? 'text-primary-600' : 'text-gray-900'"
                  >
                    {{ attribute.value }}{{ attribute.unit }}
                  </div>
                  <div v-if="attribute.color === 'orange'" class="w-full h-1 bg-primary-600 rounded mt-1"></div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="displayDescription" class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Опис</h3>
              <div class="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                <span v-if="!isLongDescription || showFullDescription">{{ displayDescription }}</span>
                <span v-else>{{ truncatedDescription }}</span>
              </div>
              <button
                v-if="isLongDescription"
                @click="showFullDescription = !showFullDescription"
                class="text-primary-600 hover:text-primary-700 text-sm mt-4 font-medium"
              >
                {{ showFullDescription ? '▲ Показати менше' : '▼ Показати більше' }}
              </button>
            </div>

            <!-- Reviews Section -->
            <div id="reviews-section" v-if="siteConfigStore.currentConfig.enable_reviews" class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-900">Відгуки</h3>
                <button
                  @click="showReviewForm = !showReviewForm"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {{ showReviewForm ? 'Скасувати' : 'Написати відгук' }}
                </button>
              </div>

              <!-- Review Form -->
              <div v-if="showReviewForm" class="mb-6">
                <ReviewForm
                  v-if="product"
                  :product="product"
                  :order-id="'guest-review'"
                  :show-cancel="true"
                  @submitted="handleReviewSubmitted"
                  @cancel="showReviewForm = false"
                />
              </div>

              <!-- Review List -->
              <div>
                <ReviewList
                  v-if="product"
                  :product-id="product.id"
                  :show-summary="false"
                  :show-filters="false"
                />
              </div>
            </div>

            <!-- Related Products Section -->
            <div v-if="product" class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Схожі товари</h3>
              <RelatedProducts
                :current-product="product"
                :max-products="6"
                @cart-animation="handleCartAnimation"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useBranchStore } from '@/stores/branch'
import { backendApi } from '@/services/backendApi'
import ratingService from '@/services/ratingService'
import type { CombinedRating } from '@/services/ratingService'
import {
  isDraftBeverage,
  getDefaultBottleSelection,
  calculateBottleCost,
  getBottleCartItems
} from '@/utils/bottleUtils'
import ReviewList from '@/components/reviews/ReviewList.vue'
import ReviewForm from '@/components/reviews/ReviewForm.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'
import LikeButton from '@/components/product/LikeButton.vue'
import CartAnimationOverlay from '@/components/CartAnimationOverlay.vue'
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton.vue'
import type { Product } from '@/types'
import { updateSeoMeta, appendStructuredData, buildBreadcrumbSchema, absoluteUrl, removeStructuredData } from '@/utils/seoUtils'

const route = useRoute()
const router = useRouter()

// Translation
const { t } = useI18n()

const productStore = useProductStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()
const branchStore = useBranchStore()

const loading = ref(true)
const product = ref<Product | null>(null)
const showReviewForm = ref(false)
const combinedRating = ref<CombinedRating | null>(null)
const showFullDescription = ref(false)
const addToCartButton = ref<HTMLButtonElement>()
const cartAnimationOverlay = ref<InstanceType<typeof CartAnimationOverlay>>()

// Computed properties
const isBeerProduct = computed(() => {
  if (!product.value) return false
  const categoryName = product.value.category_name?.toLowerCase() || ''
  const productName = product.value.name.toLowerCase()
  return categoryName.includes('пиво') ||
         categoryName.includes('beer') ||
         productName.includes('пиво') ||
         productName.includes('beer')
})

// Check if product is new
const isNewProduct = computed(() => {
  if (!product.value || !product.value.is_new) return false

  // Check if new_until date has passed
  if (product.value.new_until) {
    const newUntilDate = new Date(product.value.new_until)
    const now = new Date()
    return now <= newUntilDate
  }

  // Fallback: show as new for 14 days from creation
  if (product.value.created_at) {
    const createdDate = new Date(product.value.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 14
  }

  return false
})

// Parse product attributes from JSON string or array
const parsedAttributes = computed(() => {
  if (!product.value?.attributes) return {}

  // If attributes is already an array (old format), convert to object
  if (Array.isArray(product.value.attributes)) {
    const obj: Record<string, any> = {}
    product.value.attributes.forEach(attr => {
      obj[attr.name] = attr.value
    })
    return obj
  }

  // If attributes is a JSON string, parse it
  if (typeof product.value.attributes === 'string') {
    try {
      return JSON.parse(product.value.attributes)
    } catch (e) {
      console.error('Failed to parse product attributes:', e)
      return {}
    }
  }

  // If attributes is already an object, return as is
  return product.value.attributes || {}
})

// Extract Untappd rating
const untappdRating = computed(() => {
  const attrs = parsedAttributes.value
  return attrs.untappd_rating ? parseFloat(attrs.untappd_rating) : null
})

// Extract Untappd rating count
const untappdRatingCount = computed(() => {
  const attrs = parsedAttributes.value
  return attrs.untappd_rating_count ? parseInt(attrs.untappd_rating_count) : null
})

// Format description (clean, without ABV/IBU since they're shown as attributes)
const displayDescription = computed(() => {
  return product.value?.description || ''
})

// Product subtitle from database field
const productSubtitle = computed(() => {
  return product.value?.subtitle || ''
})

// Check if description is long (more than 300 characters)
const isLongDescription = computed(() => {
  return displayDescription.value.length > 300
})

// Truncated description for show more/less functionality
const truncatedDescription = computed(() => {
  if (displayDescription.value.length <= 300) return displayDescription.value
  return displayDescription.value.substring(0, 300) + '...'
})

// Convert attributes to display format for the UI
const displayAttributes = computed(() => {
  if (!product.value?.attributes) return []

  let attrs = []

  // Parse attributes if it's a JSON string
  if (typeof product.value.attributes === 'string') {
    try {
      attrs = JSON.parse(product.value.attributes)
    } catch (error) {
      console.error('Error parsing attributes:', error)
      return []
    }
  } else if (Array.isArray(product.value.attributes)) {
    attrs = product.value.attributes
  } else {
    return []
  }

  // Filter and format attributes for display
  const result = []

  attrs.forEach(attr => {
    // Show ABV, IBU, and OG with orange color
    if (attr.name === 'ABV' && attr.value && parseFloat(attr.value) > 0) {
      result.push({
        name: 'Міцність',
        value: attr.value,
        unit: attr.unit || '%',
        color: 'orange'
      })
    } else if (attr.name === 'IBU' && attr.value && parseInt(attr.value) > 0) {
      result.push({
        name: 'Гіркота',
        value: attr.value,
        unit: ' IBU',
        color: 'orange'
      })
    } else if (attr.name === 'OG' && attr.value && parseFloat(attr.value) > 0) {
      result.push({
        name: 'Щільність',
        value: attr.value,
        unit: attr.unit || '%',
        color: 'orange'
      })
    }
  })

  return result
})

// Add Google Rich Snippets structured data for SEO
const addStructuredData = () => {
  if (!product.value) return

  const imageUrl = product.value.display_image_url ? backendApi.getImageUrl(product.value.display_image_url) : undefined

  const productSlugOrId = product.value.slug || product.value.id
  const productUrl = absoluteUrl(`/product/${productSlugOrId}`)

  const structuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.value.display_name,
    description: product.value.description || '',
    image: imageUrl,
    sku: product.value.poster_product_id || product.value.id,
    mpn: product.value.id,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      '@id': 'https://opillia.com.ua/#organization',
      name: 'Опілля'
    },
    offers: {
      '@type': 'Offer',
      price: product.value.price.toString(),
      priceCurrency: 'UAH',
      url: productUrl,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.value.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        '@id': 'https://opillia.com.ua/#organization',
        name: 'Опілля'
      }
    }
  }

  if (combinedRating.value && combinedRating.value.totalReviews > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: combinedRating.value.averageRating.toString(),
      ratingCount: combinedRating.value.totalReviews.toString(),
      bestRating: '5',
      worstRating: '1'
    }

    if (combinedRating.value.hasLocalReviews || combinedRating.value.hasUntappdRating) {
      structuredData.review = []

      let reviewText = `Середня оцінка ${combinedRating.value.averageRating.toFixed(1)} з 5 зірок`
      if (combinedRating.value.hasLocalReviews && combinedRating.value.hasUntappdRating) {
        reviewText += ` на основі ${combinedRating.value.localReviewCount} місцевих відгуків та ${combinedRating.value.untappdReviewCount} відгуків з Untappd`
      } else if (combinedRating.value.hasLocalReviews) {
        reviewText += ` на основі ${combinedRating.value.localReviewCount} місцевих відгуків`
      } else if (combinedRating.value.hasUntappdRating) {
        reviewText += ` на основі ${combinedRating.value.untappdReviewCount} відгуків з Untappd`
      }

      structuredData.review.push({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: combinedRating.value.averageRating.toString(),
          bestRating: '5',
          worstRating: '1'
        },
        author: {
          '@type': 'Organization',
          name: 'Opillia'
        },
        reviewBody: reviewText
      })
    }
  }

  if (isBeerProduct.value) {
    const attrs = parsedAttributes.value
    structuredData.category = 'Alcoholic Beverage'
    structuredData.additionalProperty = []

    if (attrs.abv) {
      structuredData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Alcohol by Volume',
        value: `${attrs.abv}%`
      })
    }

    if (attrs.ibu) {
      structuredData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'International Bitterness Units',
        value: attrs.ibu.toString()
      })
    }

    if (attrs.og) {
      structuredData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Original Gravity',
        value: `${attrs.og}%`
      })
    }

    if (attrs.style) {
      structuredData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Beer Style',
        value: attrs.style
      })
    }
  }

  const productTitle = `Купити "${product.value.display_name}" в Києві | OpilliaSHOP`
  const productDescription = `ᐉ Замовити "${product.value.display_name}" онлайн – купуйте з доставкою по Києву ☎ ${siteConfigStore.currentConfig.company_phone || '097 324 46 68'} ⚡ Доступні ціни ⚡ Акції і знижки ⭐ краща якість`
  const canonicalPath = `/product/${productSlugOrId}`

  updateSeoMeta({
    title: productTitle,
    description: productDescription,
    canonical: canonicalPath,
    ogType: 'product',
    ogImage: imageUrl
  })

  const breadcrumbItems = [
    { name: 'Головна', url: absoluteUrl('/') },
    { name: 'Магазин', url: absoluteUrl('/shop') }
  ]

  if (product.value.category_name) {
    breadcrumbItems.push({
      name: product.value.category_name,
      url: absoluteUrl(`/shop?category=${product.value.category?.slug || product.value.category_id}`)
    })
  }

  breadcrumbItems.push({
    name: product.value.display_name,
    url: absoluteUrl(canonicalPath)
  })

  const cfg = siteConfigStore.currentConfig
  const deliveryFee = cfg.delivery_base_fee || cfg.delivery_fee || 0
  const freeDelivery = cfg.free_delivery_threshold || 0
  const phone = cfg.company_phone || '+38-097-324-46-68'

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Які терміни доставки для ${product.value.display_name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Доставляємо по Києву протягом 60–120 хвилин. Базова доставка коштує від ${deliveryFee} ₴, а при замовленні від ${freeDelivery} ₴ вона безкоштовна.`
        }
      },
      {
        '@type': 'Question',
        name: 'Які способи оплати доступні?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: cfg.enable_online_payment
            ? 'Оплачуйте онлайн карткою, Apple/Google Pay або готівкою курʼєру при отриманні.'
            : 'Оплата відбувається під час отримання — готівкою або карткою курʼєру.'
        }
      },
      {
        '@type': 'Question',
        name: `Як отримати консультацію щодо ${product.value.display_name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Зателефонуйте нам за номером ${phone} або напишіть у чат — менеджер підкаже по смаку, поєднаннях і наявності.`
        }
      }
    ]
  }

  appendStructuredData([
    { id: 'product', data: structuredData },
    { id: 'product-breadcrumb', data: buildBreadcrumbSchema(breadcrumbItems) },
    { id: 'product-faq', data: faqSchema }
  ])
}

const getImageUrl = (imagePath: string): string => {
  return backendApi.getImageUrl(imagePath)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement

  if (img.src.includes('/images/products/') && product.value?.poster_product_id) {
    img.src = backendApi.getPosterImageUrl(product.value.poster_product_id)
  }
}

const formatPrice = (price: number): string => {
  // If product has custom quantity (weight-based), show price per custom unit
  if (product.value?.custom_quantity && product.value?.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = price * product.value.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return price.toFixed(2)
}

const getUnitLabel = (unit: string | undefined): string => {
  // If product has custom quantity, show the custom unit
  if (product.value?.custom_quantity && product.value?.custom_unit) {
    // Convert custom_quantity to display format
    if (product.value.custom_unit === 'г') {
      const grams = product.value.custom_quantity * 1000
      return `${grams}г`
    } else if (product.value.custom_unit === 'мл') {
      const ml = product.value.custom_quantity * 1000
      return `${ml}мл`
    }
    return product.value.custom_unit
  }

  // For regular products, show the unit
  if (!unit) return 'за шт'

  const unitMap: Record<string, string> = {
    'kg': 'за кг',
    'g': 'за г',
    'l': 'за л',
    'ml': 'за мл',
    'p': 'за шт',
    'pcs': 'за шт',
    'piece': 'за шт'
  }

  return unitMap[unit.toLowerCase()] || `за ${unit}`
}

const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500'
  }
  return colorMap[color] || 'bg-gray-500'
}

// Get Untappd URL for this product (if mapped)
const getUntappdUrl = (): string | null => {
  const attrs = parsedAttributes.value
  return attrs.untappd_url || null
}

const scrollToReviews = () => {
  const reviewsSection = document.getElementById('reviews-section')
  if (reviewsSection) {
    reviewsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Native back button handler
const goBack = () => {
  // Always navigate to shop page to ensure proper app state
  // This works better than relying on history.length which may not work in incognito mode
  router.push('/shop')
}

const handleCartAnimation = (data: { startX: number; startY: number }) => {
  if (!cartAnimationOverlay.value) return

  // Determine if mobile or desktop
  const isMobile = window.innerWidth < 768 // md breakpoint

  let endX: number
  let endY: number

  if (isMobile) {
    // Mobile: target the cart icon in mobile bottom nav (center bottom)
    endX = window.innerWidth / 2
    endY = window.innerHeight - 30 // Bottom nav height
  } else {
    // Desktop: target the cart icon in top right area
    endX = window.innerWidth - 60
    endY = 80
  }

  cartAnimationOverlay.value.addAnimation(data.startX, data.startY, endX, endY)
}

const handleAddToCart = () => {
  if (!addToCartButton.value) return

  // Get button position for animation
  const rect = addToCartButton.value.getBoundingClientRect()
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2

  // Emit animation
  handleCartAnimation({ startX, startY })

  // Call the actual add to cart function
  addToCart()
}

const addToCart = async () => {
  if (!product.value) return

  // Check if this is a bundle product
  if (product.value.is_bundle) {
    
    try {
      await cartStore.addBundleProduct(product.value, 1)
      
      return
    } catch (error) {
      console.error('🛒 [ProductDetailView] Failed to add bundle product:', error)
      return
    }
  }

  // Check if this is a draft beverage that requires bottles
  if (isDraftBeverage(product.value)) {
    // For draft beverages, use default 1L quantity and auto bottle selection
    const quantity = 1 // Default 1L
    const autoBottles = getDefaultBottleSelection(quantity)

    // Create cart item for the beverage
    const cartItem: any = {
      product_id: product.value.id,
      poster_product_id: product.value.poster_product_id,
      name: product.value.display_name,
      price: product.value.price,
      quantity: quantity,
      image_url: product.value.display_image_url,
      unit: product.value.unit || 'L',
      max_quantity: product.value.quantity,
      is_draft_beverage: true,
      bottle_selection: autoBottles
    }

    cartStore.addItem(cartItem)

    // Add 1L bottles to cart - quantity matches the beverage quantity
    // 1L beverage = 1 bottle, 2L beverage = 2 bottles
    const bottle1L = {
      product_id: 'cmclpuhc4003dstlk7h9hxdmn', // 1L bottle ID
      poster_product_id: '189',
      name: 'ПЕТ 1 л + кришка',
      price: 4.71,
      quantity: Math.ceil(quantity), // Round up to ensure enough bottles
      unit: 'шт',
      is_bottle_product: true,
      is_auto_added: true // Mark as auto-added so it can't be edited
    }
    cartStore.addItem(bottle1L)
  } else {
    // Regular product (non-draft)
    const cartItem: any = {
      product_id: product.value.id,
      poster_product_id: product.value.poster_product_id,
      name: product.value.display_name,
      price: product.value.price,
      quantity: 1,
      image_url: product.value.display_image_url,
      unit: product.value.unit,
      max_quantity: product.value.quantity
    }

    // Add custom quantity information for weight-based products
    if (product.value.custom_quantity) {
      cartItem.custom_quantity = product.value.custom_quantity
      cartItem.custom_unit = product.value.custom_unit
      cartItem.quantity_step = product.value.quantity_step || product.value.custom_quantity
    }

    cartStore.addItem(cartItem)
  }
}



const handleReviewSubmitted = (review: any) => {
  showReviewForm.value = false
  notificationStore.add({
    type: 'success',
    title: 'Дякуємо!',
    message: 'Ваш відгук успішно надіслано. Він з\'явиться після модерації.',
    duration: 5000
  })
  // Reload reviews and rating
  loadCombinedRating()
  window.location.reload()
}

// Load combined rating
const loadCombinedRating = async () => {
  if (!product.value) return

  try {
    const rating = await ratingService.getCombinedRating(product.value)
    combinedRating.value = rating
  } catch (error) {
    console.error('Error loading combined rating:', error)
  }
}

// Watch for product changes to update structured data
watch(product, (newProduct) => {
  if (newProduct) {
    nextTick(() => {
      addStructuredData()
    })
  }
}, { immediate: true })

onMounted(async () => {
  try {
    const productIdOrSlug = route.params.id as string

    // Ensure branches are loaded
    if (branchStore.branches.length === 0) {
      await branchStore.fetchBranches(true)
    }

    // Ensure a branch is selected (use default from config or first available)
    if (!branchStore.selectedBranch) {
      const configBranchId = siteConfigStore.currentConfig.default_shop_branch_id
      const defaultBranch = branchStore.branches.find(b => b.id === configBranchId) || branchStore.branches[0]
      if (defaultBranch) {
        branchStore.selectBranch(defaultBranch)
      }
    }

    const currentBranchId = branchStore.selectedBranch?.id

    // Load all products for the branch if not already loaded
    // This ensures related products and shop page work correctly
    if (productStore.products.length === 0 && currentBranchId) {
      
      await productStore.fetchProducts(undefined, false, currentBranchId, true)
    }

    // Try to find product in store first (by slug or ID)
    const existingProduct = productStore.productBySlugOrId(productIdOrSlug)
    if (existingProduct) {
      product.value = existingProduct
      // Load combined rating and add structured data after product is loaded
      await loadCombinedRating()
      nextTick(() => {
        addStructuredData()
      })
      loading.value = false
      return
    }

    // If not found in store, fetch from API with branch inventory data
    const fetchedProduct = await productStore.fetchProduct(productIdOrSlug, currentBranchId)
    if (fetchedProduct) {
      product.value = fetchedProduct
      // Load combined rating and add structured data after product is loaded
      await loadCombinedRating()
      nextTick(() => {
        addStructuredData()
      })
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    notificationStore.add({
      type: 'error',
      title: 'Error',
      message: 'Failed to load product details',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
})

// Cleanup meta tags when component is unmounted
onUnmounted(() => {
  removeStructuredData(['product', 'product-breadcrumb', 'product-faq'])
})
</script>

<style scoped>
/* Safe area support for notched devices */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Smooth transitions */
button {
  transition: all 0.2s ease;
}

/* Active state for buttons (native feel) */
button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
