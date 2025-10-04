<template>
  <div v-if="relatedProducts.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">Схожі товари</h3>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="product in relatedProducts"
        :key="product.id"
        class="group cursor-pointer"
        @click="navigateToProduct(product)"
      >
        <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <!-- Product Image -->
          <div class="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
            <img
              v-if="getImageUrl(product)"
              :src="getImageUrl(product)"
              :alt="product.display_name || product.name"
              class="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              loading="lazy"
              @error="handleImageError"
            />
            <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
              <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h4 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
              {{ product.display_name || product.name }}
            </h4>
            
            <!-- Price -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span v-if="product.original_price && product.original_price > product.price" 
                      class="text-sm text-gray-500 line-through">
                  {{ formatPrice(product.original_price) }}₴
                </span>
                <span class="text-lg font-bold text-primary-600">
                  {{ formatPrice(product.price) }}₴
                </span>
              </div>
              
              <!-- Add to Cart Button -->
              <button
                @click.stop="addToCart(product)"
                :disabled="!isProductAvailable(product)"
                class="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isProductAvailable(product)">Додати</span>
                <span v-else>Немає</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { backendApi } from '@/services/backendApi'
import type { Product } from '@/types'

interface Props {
  currentProduct: Product
  maxProducts?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxProducts: 4
})

const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()

// Get related products from the same category
const relatedProducts = computed(() => {
  if (!props.currentProduct) return []
  
  const sameCategory = productStore.products.filter(product => 
    product.id !== props.currentProduct.id && // Exclude current product
    product.category_id === props.currentProduct.category_id && // Same category
    isProductAvailable(product) // Only available products
  )
  
  // Sort by popularity and take the specified number
  return sameCategory
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, props.maxProducts)
})

const isProductAvailable = (product: Product): boolean => {
  // Product must be active
  if (!product.is_active) return false

  // Check availability using the same logic as productStore.availableProducts
  // If quantity is defined (inventory data loaded), check availability and quantity
  if (product.quantity !== undefined) {
    return product.available && product.quantity > 0
  }

  // If no inventory data, just check if product is marked as available
  return product.available
}

const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

const getImageUrl = (product: Product): string => {
  const primaryImage = product.display_image_url || product.image_url
  if (!primaryImage) return ''
  return backendApi.getImageUrl(primaryImage)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const product = relatedProducts.value.find(p => img.alt?.includes(p.display_name || p.name))

  if (img.src.includes('/images/') && product?.poster_product_id) {
    img.src = backendApi.getPosterImageUrl(product.poster_product_id)
  } else {
    img.style.display = 'none'
  }
}

const navigateToProduct = (product: Product) => {
  router.push(`/product/${product.id}`)
}

const addToCart = (product: Product) => {
  if (!isProductAvailable(product)) return
  
  try {
    cartStore.addItem({
      product_id: product.id,
      poster_product_id: product.poster_product_id,
      name: product.display_name || product.name,
      price: product.price,
      quantity: 1,
      image_url: product.display_image_url || product.image_url,
      unit: product.unit || 'шт',
      max_quantity: product.max_quantity
    })
    
    notificationStore.add({
      type: 'success',
      title: 'Товар додано',
      message: `${product.display_name || product.name} додано до кошика`,
      duration: 2000
    })
  } catch (error) {
    console.error('Failed to add product to cart:', error)
    notificationStore.add({
      type: 'error',
      title: 'Помилка',
      message: 'Не вдалося додати товар до кошика',
      duration: 3000
    })
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
