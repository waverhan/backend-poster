<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Product Image -->
    <div class="relative aspect-square bg-gray-100">
      <img
        v-if="product.display_image_url"
        :src="getImageUrl(product.display_image_url)"
        :alt="product.display_name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- New Product Badge -->
      <NewProductBadge :product="product" />

      <!-- Status badges -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="!product.available" class="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
          Out of Stock
        </span>
        <span v-if="product.original_price && product.original_price > product.price"
              class="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
          Sale
        </span>
      </div>

      <!-- Product attributes overlay -->
      <div v-if="product.attributes && product.attributes.length > 0"
           class="absolute top-2 right-2 space-y-1">
        <div
          v-for="attribute in product.attributes.slice(0, 3)"
          :key="attribute.name"
          class="bg-white bg-opacity-90 backdrop-blur-sm rounded px-2 py-1 text-xs"
        >
          <div class="font-medium text-gray-700">{{ attribute.name }}</div>
          <div class="font-bold text-gray-900">
            {{ attribute.value }}{{ attribute.unit }}
          </div>
          <!-- Color indicator bar -->
          <div v-if="attribute.color"
               class="w-full h-1 rounded mt-1"
               :class="getColorClass(attribute.color)">
          </div>
        </div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Product Name -->
      <h3 class="font-semibold text-base text-gray-900 mb-1">
        {{ formattedProductName }}
      </h3>

      <!-- Product Description -->
      <p v-if="product.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ product.description }}
      </p>

      <!-- Product Attributes (detailed view) -->
      <div v-if="product.attributes && product.attributes.length > 0" class="mb-4">
        <div class="grid grid-cols-1 gap-2">
          <div
            v-for="attribute in product.attributes"
            :key="attribute.name"
            class="flex justify-between items-center"
          >
            <span class="text-sm text-gray-600">{{ attribute.name }}</span>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">
                {{ attribute.value }}{{ attribute.unit }}
              </span>
              <!-- Color indicator -->
              <div v-if="attribute.color"
                   class="flex gap-1">
                <div
                  v-for="i in Math.min(5, Math.ceil(parseFloat(attribute.value) / 2))"
                  :key="i"
                  class="w-2 h-4 rounded-sm"
                  :class="getColorClass(attribute.color)"
                ></div>
                <div
                  v-for="i in Math.max(0, 5 - Math.ceil(parseFloat(attribute.value) / 2))"
                  :key="`empty-${i}`"
                  class="w-2 h-4 rounded-sm bg-gray-200"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-gray-900">
            {{ displayPrice }} ₴
          </span>
          <span v-if="product.original_price && product.original_price > product.price"
                class="text-sm text-gray-500 line-through">
            {{ formatDisplayPrice(product.original_price) }} ₴
          </span>
        </div>
        <span class="text-sm text-gray-500">
          за {{ displayPriceUnit }}
        </span>
      </div>

      <!-- Sale Countdown -->
      <SaleCountdown
        v-if="product.original_price && product.original_price > product.price"
        :product="product"
        @sale-expired="handleSaleExpired"
      />

      <!-- Add to Cart Button -->
      <button
        @click="$emit('add-to-cart', product)"
        :disabled="!product.available"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {{ product.available ? 'Купити' : 'Out of Stock' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '@/types'
import { backendApi } from '@/services/backendApi'
import { formatProductName } from '@/utils/productNameFormatter'
import SaleCountdown from './SaleCountdown.vue'
import NewProductBadge from './NewProductBadge.vue'

interface Props {
  product: Product
}

interface Emits {
  (e: 'add-to-cart', product: Product): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageError = ref(false)

// Formatted product name
const formattedProductName = computed(() => {
  return formatProductName(props.product.display_name || props.product.name)
})

// Price display logic for weight-based products
const displayPrice = computed(() => {
  // If product has custom quantity (weight-based), show price per custom unit
  if (props.product.custom_quantity && props.product.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = props.product.price * props.product.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return props.product.price.toFixed(2)
})

const displayPriceUnit = computed(() => {
  // If product has custom quantity, show the custom unit
  if (props.product.custom_quantity && props.product.custom_unit) {
    // Convert custom_quantity to display format
    if (props.product.custom_unit === 'г') {
      const grams = props.product.custom_quantity * 1000
      return `${grams}г`
    } else if (props.product.custom_unit === 'мл') {
      const ml = props.product.custom_quantity * 1000
      return `${ml}мл`
    }
    return props.product.custom_unit
  }

  // For regular products, show the unit
  return props.product.unit || 'шт'
})

const formatDisplayPrice = (price: number): string => {
  // Apply same logic as displayPrice for original price
  if (props.product.custom_quantity && props.product.custom_unit) {
    const pricePerCustomUnit = price * props.product.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }
  return price.toFixed(2)
}

const getImageUrl = (imagePath: string): string => {
  return backendApi.getImageUrl(imagePath)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement

  // If this is a local image that failed, try the Poster fallback
  if (img.src.includes('/images/products/') && props.product.poster_product_id) {
    img.src = backendApi.getPosterImageUrl(props.product.poster_product_id)
  } else {
    // If even the fallback fails, hide the image
    imageError.value = true
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

const handleSaleExpired = (product: Product) => {
  console.log(`🔥 Sale expired for product: ${product.name}`)
  // The sale service will handle the price reversion
  // We could emit an event to parent components if needed
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
