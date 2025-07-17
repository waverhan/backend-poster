<template>
  <div v-if="recommendations.length > 0 && isRecommendationsEnabled" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-xl">🤖</span>
        <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
      </div>
      <div v-if="showConfidence" class="text-xs text-gray-500">
        {{ Math.round(confidence * 100) }}% confidence
      </div>
    </div>

    <p v-if="reasoning" class="text-sm text-gray-600 mb-4">{{ reasoning }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="product in recommendations"
        :key="product.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="selectProduct(product)"
      >
        <div class="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        </div>

        <h4 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
          {{ product.name }}
        </h4>

        <p class="text-xs text-gray-600 mb-2">{{ product.category_name }}</p>

        <div class="flex items-center justify-between">
          <div class="text-blue-600 font-semibold">
            <span class="text-xs">{{ formatPrice(product) }} ₴</span>
            <div class="text-xs text-gray-500">
              per {{ formatCustomUnit(product) }}
            </div>
          </div>
          <button
            @click.stop="addToCart(product)"
            class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
          >
            Add
          </button>
        </div>

        <!-- Recommendation reason -->
        <div v-if="showReasons && getProductReason(product)" class="mt-2 text-xs text-gray-500 italic">
          {{ getProductReason(product) }}
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div v-if="showActions" class="mt-4 flex gap-2">
      <button
        @click="refreshRecommendations"
        :disabled="isLoading"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading" class="animate-spin">🔄</span>
        <span v-else>🔄</span>
        {{ isLoading ? 'Loading...' : 'Refresh suggestions' }}
      </button>
      <button
        @click="handleHideRecommendations"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        Hide suggestions
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useLocationStore } from '@/stores/location'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import AIRecommendationService from '@/services/aiRecommendationService'
import LocalRecommendationService from '@/services/localRecommendationService'
import type { Product, CartItem } from '@/types'

interface Props {
  context: 'cart' | 'product' | 'checkout' | 'homepage'
  currentProduct?: Product
  maxRecommendations?: number
  showConfidence?: boolean
  showReasons?: boolean
  showActions?: boolean
  useAI?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxRecommendations: 4,
  showConfidence: false,
  showReasons: true,
  showActions: true,
  useAI: true
})

const emit = defineEmits<{
  productSelected: [product: Product]
  hideRecommendations: []
}>()

// Translation
const { t } = useI18n()

// Stores
const cartStore = useCartStore()
const productStore = useProductStore()
const locationStore = useLocationStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()

// Services
const aiService = new AIRecommendationService(import.meta.env.VITE_OPENAI_API_KEY || '')
const localService = new LocalRecommendationService()

// Analytics
import { recommendationAnalytics } from '@/services/recommendationAnalytics'

// State
const recommendations = ref<Product[]>([])
const reasoning = ref<string>('')
const confidence = ref<number>(0.8)
const isLoading = ref(false)
const productReasons = ref<Map<string, string>>(new Map())

// Computed
const title = computed(() => {
  switch (props.context) {
    case 'cart': return 'Complete your order'
    case 'product': return 'You might also like'
    case 'checkout': return 'Last chance to add'
    case 'homepage': return 'Recommended for you'
    default: return 'Suggested products'
  }
})

const isRecommendationsEnabled = computed(() => {
  return siteConfigStore.currentConfig.enable_recommendations !== false
})

// Methods
const loadRecommendations = async () => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    const products = productStore.products
    if (products.length === 0) {
      await productStore.fetchProducts()
    }

    let result

    if (props.useAI && import.meta.env.VITE_OPENAI_API_KEY) {
      result = await getAIRecommendations()
    } else {
      result = await getLocalRecommendations()
    }

    recommendations.value = result.products
    reasoning.value = result.reasoning
    confidence.value = result.confidence

    // Store individual product reasons
    if (result.productReasons) {
      productReasons.value = new Map(Object.entries(result.productReasons))
    }

    // Track recommendation views for analytics
    if (recommendations.value.length > 0) {
      const confidenceMap = new Map<string, number>()
      recommendations.value.forEach(product => {
        confidenceMap.set(product.id, confidence.value)
      })

      recommendationAnalytics.trackRecommendationView(
        props.context,
        recommendations.value,
        productReasons.value,
        confidenceMap
      )
    }

  } catch (error) {
    console.error('Failed to load recommendations:', error)
    // Fallback to simple recommendations
    recommendations.value = getFallbackRecommendations()
  } finally {
    isLoading.value = false
  }
}

const getAIRecommendations = async () => {
  const context = {
    cartItems: cartStore.items,
    location: locationStore.userLocation?.address,
    timeOfDay: new Date().getHours(),
    weather: await getWeatherInfo(),
    season: getSeason()
  }

  return await aiService.getRecommendations(
    context,
    productStore.products,
    props.maxRecommendations
  )
}

const getLocalRecommendations = async () => {
  // Build product vectors if not done
  localService.buildProductVectors(productStore.products)

  let products: Product[] = []
  let reasoning = ''
  let category = 'similar'

  switch (props.context) {
    case 'cart':
      products = localService.getCartRecommendations(
        cartStore.items,
        productStore.products,
        props.maxRecommendations
      )
      reasoning = 'Products that complement your current selection'
      category = 'complementary'
      break

    case 'product':
      if (props.currentProduct) {
        products = localService.getSimilarProducts(
          props.currentProduct.id,
          productStore.products,
          props.maxRecommendations
        )
        reasoning = `Similar to ${props.currentProduct.name}`
        category = 'similar'
      }
      break

    case 'homepage':
      const hour = new Date().getHours()
      products = localService.getTimeBasedRecommendations(
        productStore.products,
        hour,
        props.maxRecommendations
      )
      reasoning = `Perfect for ${getTimeOfDayText(hour)}`
      category = 'contextual'
      break

    default:
      products = localService.getTrendingProducts(
        productStore.products,
        props.maxRecommendations
      )
      reasoning = 'Popular choices'
      category = 'trending'
  }

  return {
    products,
    reasoning,
    confidence: 0.7,
    category
  }
}

const getFallbackRecommendations = (): Product[] => {
  // Simple fallback: return popular products
  return productStore.products
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, props.maxRecommendations)
}

const addToCart = (product: Product) => {
  // Check if product requires bottle selection (draft beverage)
  if (product.requires_bottles) {
    // For draft beverages, emit product selection to open product detail
    selectProduct(product)
    return
  }

  const cartItem: any = {
    product_id: product.id,
    poster_product_id: product.poster_product_id,
    name: product.display_name || product.name,
    price: product.price,
    quantity: 1,
    unit: product.unit || 'шт',
    image_url: product.display_image_url || product.image_url,
    max_quantity: product.max_quantity
  }

  // Add custom quantity information for weight-based products
  if (product.custom_quantity) {
    cartItem.custom_quantity = product.custom_quantity
    cartItem.custom_unit = product.custom_unit
    cartItem.quantity_step = product.quantity_step || product.custom_quantity
  }

  cartStore.addItem(cartItem)

  // Show success notification
  notificationStore.add({
    type: 'success',
    title: t('cart.addedToCart'),
    message: `${product.display_name || product.name} ${t('cart.addedToCart')}`,
    duration: 2000
  })

  // Track recommendation add to cart for analytics
  const reason = productReasons.value.get(product.id) || reasoning.value
  recommendationAnalytics.trackRecommendationAddToCart(
    props.context,
    product,
    reason,
    confidence.value,
    cartStore.subtotal
  )
}

const getProductReason = (product: Product): string => {
  return productReasons.value.get(product.id) || ''
}

// Price formatting for weight-based products
const formatPrice = (product: Product): string => {
  // If product has custom quantity (weight-based), show price per custom unit
  if (product.custom_quantity && product.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = product.price * product.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return product.price.toFixed(2)
}

const formatCustomUnit = (product: Product): string => {
  // If product has custom quantity, show the custom unit
  if (product.custom_quantity && product.custom_unit) {
    // Convert custom_quantity to display format
    if (product.custom_unit === 'г') {
      const grams = product.custom_quantity * 1000
      return `${grams}г`
    } else if (product.custom_unit === 'мл') {
      const ml = product.custom_quantity * 1000
      return `${ml}мл`
    }
    return product.custom_unit
  }

  // For regular products, show "piece" or "шт"
  return 'шт'
}

const selectProduct = (product: Product) => {
  // Track recommendation click for analytics
  const reason = productReasons.value.get(product.id) || reasoning.value
  recommendationAnalytics.trackRecommendationClick(
    props.context,
    product,
    reason,
    confidence.value,
    cartStore.subtotal
  )

  emit('productSelected', product)
}

const refreshRecommendations = () => {
  // Show notification that we're refreshing
  notificationStore.add({
    type: 'info',
    title: 'Refreshing recommendations',
    message: 'Getting new suggestions for you...',
    duration: 1500
  })

  // Clear current recommendations to show loading state
  recommendations.value = []

  // Add randomness to get different results
  localService.addRandomness()

  loadRecommendations()
}

const handleHideRecommendations = () => {
  emit('hideRecommendations')
}

// Utility functions
const getWeatherInfo = async (): Promise<string> => {
  // Simple weather detection - could integrate with weather API
  const hour = new Date().getHours()
  const month = new Date().getMonth()

  if (month >= 5 && month <= 8) return 'warm'
  if (month >= 11 || month <= 2) return 'cold'
  return 'mild'
}

const getSeason = (): string => {
  const month = new Date().getMonth()
  if (month >= 11 || month <= 1) return 'winter'
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  return 'autumn'
}

const getTimeOfDayText = (hour: number): string => {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'late night'
}

const trackRecommendationClick = (product: Product) => {
  // Track recommendation effectiveness for learning
  

  // Could send to analytics service
}

// Watchers
watch(() => cartStore.items, () => {
  if (props.context === 'cart') {
    loadRecommendations()
  }
}, { deep: true })

watch(() => props.currentProduct, () => {
  if (props.context === 'product') {
    loadRecommendations()
  }
})

// Lifecycle
onMounted(() => {
  loadRecommendations()
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
