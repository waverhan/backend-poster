<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <router-link to="/shop" class="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading product details...</p>
      </div>

      <!-- Product Not Found -->
      <div v-else-if="!product" class="text-center py-16">
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p class="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
        <router-link to="/shop" class="btn-primary">
          Back to Shop
        </router-link>
      </div>

      <!-- Product Details -->
      <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Title and Price -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.display_name }}</h1>
              <div class="flex items-center gap-4 mb-4">
                <span class="text-xl font-bold text-blue-600">{{ formatPrice(product.price) }} ₴</span>
                <span v-if="product.original_price && product.original_price > product.price"
                      class="text-base text-gray-500 line-through">
                  {{ formatPrice(product.original_price) }} ₴
                </span>
              </div>
              <p class="text-gray-600">per {{ product.unit || 'pcs' }}</p>
            </div>

            <!-- Product Attributes -->
            <div v-if="product.attributes && product.attributes.length > 0" class="space-y-4">
              <h3 class="text-base font-semibold text-gray-900">Product Specifications</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="attribute in product.attributes"
                  :key="attribute.name"
                  class="bg-gray-50 rounded-lg p-4"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">{{ attribute.name }}</span>
                    <span class="text-lg font-bold text-gray-900">
                      {{ attribute.value }}{{ attribute.unit }}
                    </span>
                  </div>
                  <!-- Visual indicator -->
                  <div v-if="attribute.color" class="flex gap-1">
                    <div
                      v-for="i in Math.min(5, Math.ceil(parseFloat(attribute.value) / 2))"
                      :key="i"
                      class="w-4 h-2 rounded-sm"
                      :class="getColorClass(attribute.color)"
                    ></div>
                    <div
                      v-for="i in Math.max(0, 5 - Math.ceil(parseFloat(attribute.value) / 2))"
                      :key="`empty-${i}`"
                      class="w-4 h-2 rounded-sm bg-gray-200"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="product.description">
              <h3 class="text-base font-semibold text-gray-900 mb-2">Description</h3>
              <p class="text-gray-600">{{ product.description }}</p>
            </div>

            <!-- Stock Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-base font-semibold text-gray-900 mb-2">Availability</h3>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Stock: {{ product.quantity }} {{ product.unit || 'pcs' }}</span>
                <span class="text-sm px-3 py-1 rounded-full"
                      :class="product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ product.available ? 'Available' : 'Out of Stock' }}
                </span>
              </div>
            </div>

            <!-- Add to Cart -->
            <button
              @click="addToCart"
              :disabled="!product.available"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ product.available ? 'Купити' : 'Out of Stock' }}
            </button>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="mt-8 border-t border-gray-200 pt-8">
          <ReviewList
            v-if="product"
            :product-id="product.id"
            :show-summary="true"
            :show-filters="true"
          />
        </div>
      </div>

      <!-- Recommendations Section -->
      <div v-if="showRecommendations" class="mt-8">
        <ProductRecommendations
          v-if="product"
          context="product"
          :current-product="product"
          :max-recommendations="4"
          :show-reasons="true"
          @product-selected="navigateToProduct"
          @hide-recommendations="hideRecommendations"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { backendApi } from '@/services/backendApi'
import ReviewList from '@/components/reviews/ReviewList.vue'
import ProductRecommendations from '@/components/recommendations/ProductRecommendations.vue'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()

// Translation
const { t } = useI18n()

const productStore = useProductStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()

const loading = ref(true)
const product = ref<Product | null>(null)

// Recommendations state
const showRecommendations = ref(true)

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
  return price.toFixed(2)
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

const addToCart = () => {
  if (!product.value) return

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

  notificationStore.add({
    type: 'success',
    title: t('cart.addedToCart'),
    message: `${product.value.display_name} ${t('cart.addedToCart')}`,
    duration: 3000
  })
}

const navigateToProduct = (selectedProduct: Product) => {
  router.push(`/product/${selectedProduct.id}`)
}

const hideRecommendations = () => {
  
  showRecommendations.value = false

  notificationStore.add({
    type: 'info',
    title: 'Recommendations hidden',
    message: 'Refresh the page to show recommendations again',
    duration: 3000
  })
}

onMounted(async () => {
  try {
    const productId = route.params.id as string

    // Try to find product in store first
    const existingProduct = productStore.productById(productId)
    if (existingProduct) {
      product.value = existingProduct
      loading.value = false
      return
    }

    // If not found in store, fetch from API
    const fetchedProduct = await productStore.fetchProduct(productId)
    if (fetchedProduct) {
      product.value = fetchedProduct
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
</script>
