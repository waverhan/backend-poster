<template>
  <div class="card-hover">
    <!-- Product Image -->
    <div class="aspect-square bg-gray-100 flex items-center justify-center">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="product.display_name"
        class="w-full h-full object-cover"
        @error="onImageError"
      />
      <span v-else class="text-4xl">🍽️</span>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <h3 class="font-bold text-base mb-2 line-clamp-2">{{ product.display_name || product.name }}</h3>
      <p v-if="product.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ product.description }}
      </p>

      <!-- Price -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <span class="text-xl font-bold text-primary-600">{{ displayPrice }} ₴</span>
          <span v-if="product.original_price && product.original_price > product.price"
                class="text-sm text-gray-400 line-through">
            {{ formatDisplayPrice(product.original_price) }} ₴
          </span>
        </div>
        <div class="text-right">
          <span class="text-sm text-gray-500">
            за {{ displayPriceUnit }}
          </span>
        </div>
      </div>

      <!-- Quantity Selector for Draft Beverages -->
      <div v-if="isDraft && !showBottleSelector" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Кількість ({{ displayUnit }}):
        </label>
        <div class="flex items-center justify-center space-x-3">
          <button
            @click="decreaseQuantity"
            :disabled="selectedQuantity <= minQuantity"
            class="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            −
          </button>
          <span class="w-20 text-center font-bold text-lg">{{ displayQuantity }}</span>
          <button
            @click="increaseQuantity"
            :disabled="selectedQuantity >= maxQuantity"
            class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
        <div class="text-center mt-2">
          <span class="text-lg font-bold text-red-600">{{ (product.price * selectedQuantity).toFixed(2) }} грн</span>
        </div>

      </div>

      <!-- Bottle Selector -->
      <BottleSelector
        v-if="showBottleSelector"
        :beverage-quantity="selectedQuantity"
        :initial-bottles="selectedBottles"
        @apply="onBottleSelectionApply"
        @cancel="onBottleSelectionCancel"
      />

      <!-- Add to Cart Button -->
      <button
        v-if="!isDraft || !showBottleSelector"
        @click="handleAddToCart"
        :disabled="!isAvailableInBranch || (isDraft && (selectedQuantity === 0 || selectedQuantity > availableQuantity))"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ getButtonText() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue'
import type { Product, BottleSelection } from '@/types'
import { backendApi } from '@/services/backendApi'
import { useBranchStore } from '@/stores/branch'
import { ProductAvailabilityService } from '@/services/productAvailabilityService'
import { isDraftBeverage, createEmptyBottleSelection } from '@/utils/bottleUtils'
import {
  convertToDisplayQuantity,
  getQuantityStep,
  getMinQuantity,
  getMaxQuantity,
  formatQuantityDisplay
} from '@/utils/quantityUtils'
import BottleSelector from './BottleSelector.vue'

interface Props {
  product: Product
}

interface Emits {
  (e: 'add-to-cart', product: Product, quantity?: number, bottles?: BottleSelection, bottleCost?: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const branchStore = useBranchStore()

// State for image fallback
const imageError = ref(false)

// State for branch-specific inventory
const branchInventory = ref<{
  available_quantity: number
  unit: string
  is_available: boolean
} | null>(null)

// State for draft beverage functionality
const selectedQuantity = ref(2) // Default 2L
const selectedBottles = ref<BottleSelection>(createEmptyBottleSelection())
const showBottleSelector = ref(false)

// Computed properties
const isDraft = computed(() => {
  return isDraftBeverage(props.product)
})

// Check if product is available in current branch
const isAvailableInBranch = computed(() => {
  if (!branchInventory.value) return props.product.available
  return branchInventory.value.is_available && branchInventory.value.available_quantity > 0
})

// Get available quantity in current branch
const availableQuantity = computed(() => {
  if (!branchInventory.value) return 999 // Default high number if no inventory data
  return branchInventory.value.available_quantity
})

// Custom quantity controls based on product settings
const quantityStep = computed(() => {
  return getQuantityStep(
    props.product.custom_quantity,
    props.product.quantity_step,
    props.product.custom_unit
  )
})

const minQuantity = computed(() => {
  return getMinQuantity(
    props.product.min_quantity,
    props.product.custom_quantity,
    props.product.custom_unit
  )
})

const maxQuantity = computed(() => {
  return getMaxQuantity(
    props.product.max_quantity,
    availableQuantity.value,
    props.product.custom_unit
  )
})

// Display unit for quantity
const displayUnit = computed(() => {
  return props.product.custom_unit || props.product.unit || 'шт'
})

// Display quantity with proper formatting
const displayQuantity = computed(() => {
  return formatQuantityDisplay(selectedQuantity.value, displayUnit.value)
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

// Computed image URL with fallback logic
const imageUrl = computed(() => {
  const primaryImage = props.product.display_image_url || props.product.image_url

  if (!primaryImage) return ''

  // If we've had an error with the local image, try the Poster fallback
  if (imageError.value && primaryImage.startsWith('/images/')) {
    return backendApi.getPosterImageUrl(props.product.poster_product_id)
  }

  // Use the primary image (local or external)
  return backendApi.getImageUrl(primaryImage)
})

// Methods for quantity control
const increaseQuantity = () => {
  const newQuantity = selectedQuantity.value + quantityStep.value
  if (newQuantity <= maxQuantity.value) {
    selectedQuantity.value = newQuantity
  }
}

const decreaseQuantity = () => {
  const newQuantity = selectedQuantity.value - quantityStep.value
  if (newQuantity >= minQuantity.value) {
    selectedQuantity.value = newQuantity
  }
}

// Methods for bottle selection
const onBottleSelectionApply = (bottles: BottleSelection, cost: number) => {
  selectedBottles.value = bottles
  showBottleSelector.value = false

  // Add to cart with bottle selection
  emit('add-to-cart', props.product, selectedQuantity.value, bottles, cost)
}

const onBottleSelectionCancel = () => {
  showBottleSelector.value = false
}

const getButtonText = () => {
  if (!isAvailableInBranch.value) {
    return 'Out of Stock'
  }

  if (isDraft.value) {
    return showBottleSelector.value ? 'Оберіть пляшки' : 'Купити'
  }

  return 'Купити'
}

const handleAddToCart = () => {
  if (!isAvailableInBranch.value) return

  if (isDraft.value) {
    if (selectedQuantity.value === 0 || selectedQuantity.value > availableQuantity.value) return
    showBottleSelector.value = true
  } else {
    emit('add-to-cart', props.product)
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement

  // If this is a local image that failed, try the Poster fallback
  if (img.src.includes('/images/products/')) {
    imageError.value = true
    // The computed property will automatically update with the fallback URL
  } else {
    // If even the fallback fails, hide the image
    img.style.display = 'none'
  }
}

const formatQuantity = (quantity: number, unit?: string): string => {
  if (!unit) {
    return quantity > 50 ? '50+' : quantity.toString()
  }

  // Format based on unit type
  if (unit === 'kg') {
    return `${quantity} кг`
  } else if (unit === 'L' || unit === 'l') {
    return `${quantity} л`
  } else if (unit === 'bottles') {
    return quantity === 1 ? '1 пляшка' : `${quantity} пляшок`
  } else if (unit === 'pcs' || unit === 'p') {
    return quantity > 50 ? '50+ шт' : `${quantity} шт`
  } else if (unit === 'g') {
    return `${quantity} г`
  } else {
    return `${quantity} ${unit}`
  }
}

const getStockStatus = (product: Product): string => {
  const quantity = availableQuantity.value

  if (!isAvailableInBranch.value || quantity === 0) {
    return '❌ Out of Stock'
  } else if (quantity <= 5) {
    return '⚠️ Low Stock'
  } else if (quantity <= 10) {
    return '✅ Limited'
  } else {
    return '✅ In Stock'
  }
}

// Load branch-specific inventory
const loadBranchInventory = async () => {
  if (!branchStore.selectedBranch?.id) return

  try {
    const inventory = await ProductAvailabilityService.getProductInventory(
      props.product.id,
      branchStore.selectedBranch.id
    )
    branchInventory.value = inventory
  } catch (error) {
    console.error('Failed to load branch inventory:', error)
  }
}

// Initialize quantity based on product settings
const initializeQuantity = () => {
  selectedQuantity.value = minQuantity.value
}

// Lifecycle
onMounted(() => {
  loadBranchInventory()
  initializeQuantity()
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
