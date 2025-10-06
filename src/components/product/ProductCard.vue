<template>
  <div class="card-hover">
    <!-- Product Image -->
    <router-link :to="`/product/${product.id}`" class="block">
      <div class="aspect-square bg-gray-100 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="product.display_name"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <span v-else class="text-4xl">🍽️</span>

        <!-- New Product Badge -->
        <NewProductBadge :product="product" />

        <!-- Product Attributes Overlay -->
        <div v-if="parsedAttributes && parsedAttributes.length > 0"
             class="absolute top-1 right-1 space-y-1">
          <div
            v-for="attribute in parsedAttributes.slice(0, 3)"
            :key="attribute.name"
            class="bg-white bg-opacity-75 backdrop-blur-sm rounded px-2 py-1 text-right shadow-sm min-w-0"
          >
            <div class="text-xs text-gray-700 font-medium leading-tight">{{ attribute.name }}</div>
            <div class="text-xs font-bold text-gray-900 leading-tight">
              {{ attribute.value }}{{ attribute.unit || '' }}
            </div>
            <!-- Scale bars -->
            <div class="flex justify-end gap-0.5 mt-0.5">
              <div
                v-for="i in 5"
                :key="i"
                class="w-1.5 h-1 rounded-sm"
                :class="i <= getScaleLevel(attribute.value, attribute.name)
                  ? getAttributeBarColor(attribute.color)
                  : 'bg-gray-300'"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Product Info -->
    <div class="p-4">
      <h3 class="font-bold text-base mb-2">{{ formattedProductName }}</h3>
      <p v-if="product.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ product.description }}
      </p>

      <!-- Rating -->
      <div v-if="combinedRating && combinedRating.totalReviews > 0" class="flex items-center gap-2 mb-3">
        <div class="flex">
          <span
            v-for="star in 5"
            :key="star"
            class="text-sm"
            :class="star <= Math.round(combinedRating.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
          >
            ⭐
          </span>
        </div>
        <span class="text-sm text-gray-600">
          {{ combinedRating.averageRating.toFixed(1) }} ({{ combinedRating.totalReviews }})
        </span>
        <div v-if="combinedRating.hasUntappdRating && combinedRating.hasLocalReviews"
             class="text-xs bg-orange-100 text-orange-600 px-1 rounded">
          Змішано
        </div>
        <div v-else-if="combinedRating.hasUntappdRating"
             class="text-xs bg-orange-100 text-orange-600 px-1 rounded">
          Untappd
        </div>
      </div>

      <!-- Like Button -->
      <div class="flex justify-end mb-2">
        <LikeButton
          :product="product"
          size="small"
          variant="minimal"
          :show-count="true"
        />
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <span :class="[
            'text-xl font-bold',
            product.original_price && product.original_price > product.price
              ? 'text-red-600'
              : 'text-primary-600'
          ]">{{ displayPrice }} ₴</span>
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

      <!-- Sale Badge -->
      <div v-if="product.original_price && product.original_price > product.price" class="mb-3">
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔥 {{ $t('deals.title') }}
        </span>
      </div>

      <!-- Sale Countdown -->
      <SaleCountdown
        v-if="product.original_price && product.original_price > product.price"
        :product="product"
        @sale-expired="handleSaleExpired"
      />

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

      <!-- Add to Cart Buttons -->
      <div v-if="!showBottleSelector" class="space-y-2">
        <!-- Main Add to Cart Button (with auto bottle selection for draft) -->
        <button
          @click="handleAddToCart"
          :disabled="!isAvailableInBranch || (isDraft && (selectedQuantity === 0 || selectedQuantity > availableQuantity))"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ getButtonText() }}
        </button>

        <!-- Manual Bottle Selection Button (temporarily hidden) -->
        <!--
        <button
          v-if="isDraft"
          @click="showBottleSelector = true"
          :disabled="!isAvailableInBranch || selectedQuantity === 0 || selectedQuantity > availableQuantity"
          class="w-full text-sm py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🍾 Обрати пляшки
        </button>
        -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Product, BottleSelection } from '@/types'
import { backendApi } from '@/services/backendApi'
import { useBranchStore } from '@/stores/branch'
import { ProductAvailabilityService } from '@/services/productAvailabilityService'
import {
  isDraftBeverage,
  createEmptyBottleSelection,
  getDefaultBottleSelection,
  getSimpleDefaultBottleSelection,
  calculateBottleCost,
  getBottleCartItems
} from '@/utils/bottleUtils'
import {
  convertToDisplayQuantity,
  getQuantityStep,
  getMinQuantity,
  getMaxQuantity,
  formatQuantityDisplay
} from '@/utils/quantityUtils'
import { formatProductName } from '@/utils/productNameFormatter'
import ratingService from '@/services/ratingService'
import type { CombinedRating } from '@/services/ratingService'
import BottleSelector from './BottleSelector.vue'
import SaleCountdown from '../SaleCountdown.vue'
import NewProductBadge from '../NewProductBadge.vue'
import LikeButton from './LikeButton.vue'

interface Props {
  product: Product
}

interface Emits {
  (e: 'add-to-cart', product: Product, quantity?: number, bottles?: BottleSelection, bottleCost?: number): void
  (e: 'add-bottle-to-cart', bottleItem: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Translation
const { t } = useI18n()

// Stores
const branchStore = useBranchStore()

// Image error handling is done directly in the onImageError method

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

// State for rating
const combinedRating = ref<CombinedRating | null>(null)
const ratingLoading = ref(false)

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

  // For regular products, show the unit (convert "p" to "шт")
  const unit = props.product.unit
  return (unit === 'p' || unit === 'pcs') ? 'шт' : (unit || 'шт')
})

const formatDisplayPrice = (price: number): string => {
  // Apply same logic as displayPrice for original price
  if (props.product.custom_quantity && props.product.custom_unit) {
    const pricePerCustomUnit = price * props.product.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }
  return price.toFixed(2)
}

// Parse attributes from JSON string to array
const parsedAttributes = computed(() => {
  if (!props.product.attributes) return []

  try {
    // If it's already an array, return it
    if (Array.isArray(props.product.attributes)) {
      return props.product.attributes
    }

    // If it's a string, parse it
    if (typeof props.product.attributes === 'string') {
      return JSON.parse(props.product.attributes)
    }

    return []
  } catch (error) {
    console.warn('Failed to parse product attributes:', error)
    return []
  }
})

// Computed image URL with fallback logic
const imageUrl = computed(() => {
  const primaryImage = props.product.display_image_url || props.product.image_url

  if (!primaryImage) {
    return ''
  }

  // Use the backend API to get the full image URL (same as admin panel)
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

  // Try to get bottle products for cart
  const bottleCartItems = getBottleCartItems(bottles)

  if (bottleCartItems.length > 0) {
    // Add beverage to cart (without bottle cost since bottles are separate)
    emit('add-to-cart', props.product, selectedQuantity.value, bottles)

    // Add bottle products to cart as separate items
    for (const bottleItem of bottleCartItems) {
      emit('add-bottle-to-cart', bottleItem)
    }
  } else {
    // Fallback: use old system with bottle cost included in beverage
    console.warn('Bottle products not available, using fallback bottle cost system')
    emit('add-to-cart', props.product, selectedQuantity.value, bottles, cost)
  }
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

    // Auto bottle selection: automatically select the best bottle combination
    const autoBottles = getDefaultBottleSelection(selectedQuantity.value)
    const bottleCost = calculateBottleCost(autoBottles)

    // Try to get bottle products for cart
    const bottleCartItems = getBottleCartItems(autoBottles)

    if (bottleCartItems.length > 0) {
      // Add beverage to cart (without bottle cost since bottles are separate)
      emit('add-to-cart', props.product, selectedQuantity.value, autoBottles)

      // Add bottle products to cart as separate items
      for (const bottleItem of bottleCartItems) {
        emit('add-bottle-to-cart', bottleItem)
      }
    } else {
      // Fallback: use old system with bottle cost included in beverage
      console.warn('Bottle products not available, using fallback bottle cost system')
      emit('add-to-cart', props.product, selectedQuantity.value, autoBottles, bottleCost)
    }
  } else {
    emit('add-to-cart', props.product)
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement

  // If this is a local image that failed, try the Poster fallback
  if (img.src.includes('/images/')) {
    img.src = backendApi.getPosterImageUrl(props.product.poster_product_id)
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

// Get color class for attribute scale bars
const getAttributeBarColor = (color?: string) => {
  switch (color?.toLowerCase()) {
    case 'red':
      return 'bg-red-500'
    case 'orange':
      return 'bg-orange-500'
    case 'yellow':
      return 'bg-yellow-500'
    case 'green':
      return 'bg-green-500'
    case 'blue':
      return 'bg-blue-500'
    case 'purple':
      return 'bg-purple-500'
    case 'pink':
      return 'bg-pink-500'
    default:
      return 'bg-gray-500'
  }
}

// Calculate scale level (1-5) based on attribute value and type
const getScaleLevel = (value: string, attributeName: string): number => {
  const numValue = parseFloat(value)

  // Different scales for different attribute types
  if (attributeName.toLowerCase().includes('міцність') || attributeName.toLowerCase().includes('abv')) {
    // Alcohol strength: 0-20% -> 1-5 scale
    return Math.min(5, Math.max(1, Math.ceil(numValue / 4)))
  } else if (attributeName.toLowerCase().includes('гіркота') || attributeName.toLowerCase().includes('ibu')) {
    // Bitterness: 0-100 IBU -> 1-5 scale
    return Math.min(5, Math.max(1, Math.ceil(numValue / 20)))
  } else if (attributeName.toLowerCase().includes('густина') || attributeName.toLowerCase().includes('og')) {
    // Original gravity: typically 1.030-1.120 -> convert to percentage and scale
    const percentage = (numValue - 1) * 100 // Convert 1.050 to 5%
    return Math.min(5, Math.max(1, Math.ceil(percentage / 2)))
  } else {
    // Generic scale: assume 0-100 range
    return Math.min(5, Math.max(1, Math.ceil(numValue / 20)))
  }
}

const handleSaleExpired = (product: Product) => {
  console.log(`🔥 Sale expired for product: ${product.name}`)
  // The sale service will handle the price reversion
  // We could emit an event to parent components if needed
}

// Load combined rating
const loadCombinedRating = async () => {
  if (ratingLoading.value) return

  ratingLoading.value = true
  try {
    const rating = await ratingService.getCombinedRating(props.product)
    combinedRating.value = rating
  } catch (error) {
    console.error('Error loading combined rating:', error)
  } finally {
    ratingLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadBranchInventory()
  initializeQuantity()
  loadCombinedRating()
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
