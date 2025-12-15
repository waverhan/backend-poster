<template>
  <div
    class="card-hover product-card-container product-card-expand"
    :data-product-id="product.id"
  >
    <!-- Main Card Content -->
    <div class="card-main-content">
      <!-- Product Image -->
      <div class="relative">
        <router-link
          :to="`/product/${product.slug || product.id}`"
          class="block"
          :aria-label="`Переглянути ${product.display_name || product.name}`"
        >
          <div class="aspect-square bg-gray-100 flex items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity">
            <OptimizedImage
              v-if="productImagePath"
              :src="productImagePath"
              :alt="product.display_name || product.name || 'Товар Опілля'"
              :widths="productImageWidths"
              :sizes="productImageSizes"
              :priority="priority"
              wrapper-class="w-full h-full"
              img-class="w-full h-full object-cover"
              @error="onImageError"
              @load="onImageLoad"
            />
            <span v-else class="text-4xl">🍽️</span>

            <!-- Badges Container - Stack vertically -->
            <div class="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <!-- Sale Badge -->
              <div v-if="product.original_price && product.original_price > product.price">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                  SALE
                </span>
              </div>

              <!-- New Product Badge -->
              <div v-if="isNewProduct" class="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                ✨ Новинка
              </div>
            </div>

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

        <!-- Like Button - Bottom Right Corner (Outside router-link) -->
        <div class="absolute bottom-2 right-2 z-20" @click.stop>
          <LikeButton
            :product="product"
            size="small"
            variant="minimal"
            :show-count="false"
          />
        </div>
      </div>

    <!-- Product Info - Native App Style -->
    <div class="p-3 relative group">
      <!-- Product Name - Larger for mobile -->
      <h3 class="font-bold text-base md:text-base mb-1 line-clamp-2 min-h-[2.5rem]">{{ formattedProductName }}</h3>

      <!-- Product Subtitle -->
      <p v-if="productSubtitle" class="text-sm text-gray-600 mb-2 line-clamp-1">{{ productSubtitle }}</p>

      <!-- Rating - Compact -->
      <div v-if="combinedRating && combinedRating.totalReviews > 0" class="flex items-center gap-1 mb-2">
        <div class="flex">
          <span
            v-for="star in 5"
            :key="star"
            class="text-xs"
            :class="star <= Math.round(combinedRating.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
          >
            ⭐
          </span>
        </div>
        <span class="text-xs text-gray-600">
          {{ combinedRating.averageRating.toFixed(1) }}
        </span>
      </div>



      <!-- Price Section - Native Style -->
      <div class="mb-3">
        <div class="flex items-baseline gap-1">
          <span :class="[
            'text-xl md:text-lg font-bold tracking-tight',
            product.original_price && product.original_price > product.price
              ? 'text-red-600'
              : 'text-gray-900 dark:text-gray-100'
          ]" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">{{ displayPrice }}</span>
          <span :class="[
            'text-xl md:text-lg font-bold tracking-tight',
            product.original_price && product.original_price > product.price
              ? 'text-red-600'
              : 'text-gray-900 dark:text-gray-100'
          ]">₴</span>
          <span v-if="product.original_price && product.original_price > product.price"
                class="text-xs text-gray-400 line-through ml-1">
            {{ formatDisplayPrice(product.original_price) }} ₴
          </span>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          за {{ displayPriceUnit }}
        </span>
      </div>

      <!-- Add to Cart / Quantity Controls - Full Width Native Style -->
      <div class="w-full" role="group" :aria-label="`Керування кількістю ${product.display_name || product.name}`">
        <!-- Quantity Controls (shown when product is in cart) -->
        <div v-if="itemInCart"
             class="flex items-center rounded-xl overflow-hidden border-2 border-primary-500 shadow-sm">
          <button
            @click="decreaseCartQuantity"
            class="flex-1 h-11 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
            :aria-label="`Зменшити кількість ${product.display_name || product.name}`"
            type="button"
          >
            −
          </button>
          <span
            class="flex-1 text-center font-bold text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            role="status"
            :aria-label="`Кількість: ${itemInCart.quantity}`"
          >{{ itemInCart.quantity }}</span>
          <button
            @click="increaseCartQuantity"
            :disabled="itemInCart.quantity >= (product.max_quantity || 999)"
            class="flex-1 h-11 bg-primary-500 text-white flex items-center justify-center text-lg font-bold hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50"
            :aria-label="`Збільшити кількість ${product.display_name || product.name}`"
            type="button"
          >
            +
          </button>
        </div>

        <!-- Add to Cart Button (shown when product is NOT in cart) - Full Width -->
        <button
          v-else
          ref="addToCartButton"
          @click="handleAddToCartWithAnimation"
          :disabled="!isAvailableInBranch"
          class="w-full h-11 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl shadow-sm active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :aria-label="`Додати ${product.display_name || product.name} до кошика`"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="text-sm">{{ getButtonText() }}</span>
        </button>
      </div>



      <!-- Sale Countdown -->
      <SaleCountdown
        v-if="product.original_price && product.original_price > product.price && product.sale_expires_at"
        :product="product"
        @sale-expired="handleSaleExpired"
      />

      <!-- Quantity Selector for Draft Beverages - HIDDEN -->
      <div v-if="false" class="mb-4">
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

      <!-- Add to Cart Buttons (for draft products only) - HIDDEN -->
      <div v-if="false" class="space-y-2">
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

      <!-- Expandable Description Panel (Mobile only) -->
      <div v-if="product.description"
           class="description-expand md:hidden">
        <div class="px-4 py-3">
          <p class="text-gray-700 text-sm leading-relaxed whitespace-normal break-words">
            {{ truncatedDescription }}
          </p>
        </div>
      </div>
    </div>
    </div>
    <!-- End Main Card Content -->
  </div>

</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Product, BottleSelection } from '@/types'
import { backendApi } from '@/services/backendApi'
import { useBranchStore } from '@/stores/branch'
import { useCartStore } from '@/stores/cart'
import { useHaptic } from '@/composables/useHaptic'
import { useToast } from '@/composables/useToast'
// ProductAvailabilityService import removed - inventory is now loaded with products
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
import LikeButton from './LikeButton.vue'
import OptimizedImage from '@/components/ui/OptimizedImage.vue'

interface Props {
  product: Product
  priority?: boolean
}

interface Emits {
  (e: 'add-to-cart', product: Product, quantity?: number, bottles?: BottleSelection, bottleCost?: number): void
  (e: 'add-bottle-to-cart', bottleItem: any): void
  (e: 'cart-animation', data: { startX: number; startY: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Translation
const { t } = useI18n()

// Stores
const branchStore = useBranchStore()
const cartStore = useCartStore()

// Composables
const haptic = useHaptic()
const toast = useToast()

// Image error handling is done directly in the onImageError method

// State for branch-specific inventory - now loaded with products from backend
// No longer needs real-time API calls as inventory is synced via cron jobs

// State for draft beverage functionality
const selectedQuantity = ref(2) // Default 2L
const selectedBottles = ref<BottleSelection>(createEmptyBottleSelection())
const showBottleSelector = ref(false)

// State for rating
const combinedRating = ref<CombinedRating | null>(null)
const ratingLoading = ref(false)

// State for hover
const isHovered = ref(false)

// Ref for add to cart button (for animation)
const addToCartButton = ref<HTMLButtonElement>()
const productImageWidths = [300, 490, 640, 800]
const productImageSizes = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw'

// Computed properties
const isDraft = computed(() => {
  return isDraftBeverage(props.product)
})

// Check if product is in cart
const itemInCart = computed(() => {
  return cartStore.getItemById(props.product.id)
})

// Check if product is available in current branch
// Inventory data is now loaded with products from backend (via cron sync)
const isAvailableInBranch = computed(() => {
  // Product availability is determined by is_active status and quantity
  if (!props.product.available) return false
  // If quantity is 0, product is not available (inventory depleted)
  return (props.product.quantity ?? 0) > 0
})

// Get available quantity in current branch
const availableQuantity = computed(() => {
  return props.product.quantity ?? 999 // Use product's quantity from backend
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

// Truncated description (max 100 characters)
const truncatedDescription = computed(() => {
  if (!props.product.description) return ''
  return props.product.description.length > 100
    ? props.product.description.substring(0, 100) + '...'
    : props.product.description
})

// Product subtitle from database field
const productSubtitle = computed(() => {
  return props.product.subtitle || ''
})

// Check if product is new
const isNewProduct = computed(() => {
  if (!props.product.is_new) return false

  // Check if new_until date has passed
  if (props.product.new_until) {
    const newUntilDate = new Date(props.product.new_until)
    const now = new Date()
    return now <= newUntilDate
  }

  // Fallback: show as new for 14 days from creation
  if (props.product.created_at) {
    const createdDate = new Date(props.product.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 14
  }

  return false
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

// Get image URL - simple and direct, just like ProductDetailView
const productImagePath = computed(() => {
  const primaryImage = props.product.display_image_url || props.product.image_url
  if (!primaryImage) {
    return ''
  }
  return primaryImage
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

// Methods for cart quantity control
const increaseCartQuantity = () => {
  if (!itemInCart.value) return

  const maxQty = props.product.max_quantity || 999
  if (itemInCart.value.quantity < maxQty) {
    cartStore.updateItemQuantity(itemInCart.value.cart_item_id, itemInCart.value.quantity + 1)
  }
}

const decreaseCartQuantity = () => {
  if (!itemInCart.value) return

  if (itemInCart.value.quantity > 1) {
    cartStore.updateItemQuantity(itemInCart.value.cart_item_id, itemInCart.value.quantity - 1)
  } else {
    // Remove item if quantity would be 0
    cartStore.removeItem(itemInCart.value.cart_item_id)
  }
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

// Handle add to cart with animation
const handleAddToCartWithAnimation = () => {
  if (!addToCartButton.value) return

  // Get button position for animation
  const rect = addToCartButton.value.getBoundingClientRect()
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2

  // Emit animation event
  emit('cart-animation', { startX, startY })

  // Call the actual add to cart function
  handleAddToCartDirectly()
}

// Direct add to cart method for all products
const handleAddToCartDirectly = () => {
  if (!isAvailableInBranch.value) return

  // Haptic feedback
  haptic.light()

  // Check if this is a draft beverage (розливне) that needs bottles
  // Only add bottles if the product is sold by weight/volume AND requires bottles
  // Do NOT add bottles for pre-bottled products (like bottled beer)
  const needsBottles = isDraft.value && props.product.unit === 'л'

  if (needsBottles) {
    // Handle draft products with auto bottle selection
    const defaultQuantity = 1
    const autoBottles = getDefaultBottleSelection(defaultQuantity)

    
    

    // Emit event to parent (ShopView) to show notification
    emit('add-to-cart', props.product, defaultQuantity, autoBottles)

    // Add bottles separately if needed
    const bottleCartItems = getBottleCartItems(autoBottles)
    

    for (const bottleItem of bottleCartItems) {
      
      emit('add-bottle-to-cart', bottleItem)
    }

    // Success toast
    toast.success(`${props.product.display_name || props.product.name} додано до кошика`)
  } else {
    // Handle regular products (including pre-bottled products)
    // Do NOT add bottles for products that already come in bottles
    emit('add-to-cart', props.product)

    // Success toast
    toast.success(`${props.product.display_name || props.product.name} додано до кошика`)
  }
}

// Direct add to cart method for draft products
const handleAddDraftToCartDirectly = () => {
  if (!isAvailableInBranch.value) return

  // Use default quantity (1L for draft beverages)
  const defaultQuantity = 1

  // Auto bottle selection: automatically select the best bottle combination
  const autoBottles = getDefaultBottleSelection(defaultQuantity)

  // Try to get bottle products for cart
  const bottleCartItems = getBottleCartItems(autoBottles)

  if (bottleCartItems.length > 0) {
    // Add beverage to cart (without bottle cost since bottles are separate)
    emit('add-to-cart', props.product, defaultQuantity, autoBottles)

    // Add bottle products to cart as separate items
    for (const bottleItem of bottleCartItems) {
      emit('add-bottle-to-cart', bottleItem)
    }
  } else {
    // Fallback: use old system with bottle cost included in beverage
    const bottleCost = calculateBottleCost(autoBottles)
    console.warn('Bottle products not available, using fallback bottle cost system')
    emit('add-to-cart', props.product, defaultQuantity, autoBottles, bottleCost)
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // If image fails to load, hide it
  img.style.display = 'none'
}

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.opacity = '1'
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

// NOTE: Real-time inventory loading removed
// Inventory is now synced via cron jobs and loaded with products from backend
// This eliminates individual API calls per product which caused performance issues

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
  // Inventory is now loaded with products from backend - no need for separate API calls
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

/* Expanding effect for individual cards - only on hover of that specific card */
.product-card-expand {
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

/* Only expand description when THIS specific card is hovered */
.product-card-expand:hover .description-expand {
  max-height: 300px;
  opacity: 1;
  visibility: visible;
  z-index: 50;
}

.description-expand {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 40;
  pointer-events: auto;
}

.card-main-content {
  display: flex;
  flex-direction: column;
}

/* Native App Style Product Card */
.product-card-container {
  overflow: visible !important;
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.dark .product-card-container {
  background: #2A2A2A;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Ensure card-hover doesn't clip the description */
.product-card-container.card-hover {
  overflow: visible !important;
}

/* Active/Press State - Native Feel */
.product-card-container:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* Smooth transitions for all interactive elements */
.product-card-container button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Active scale effect */
.active\:scale-98:active {
  transform: scale(0.98);
}

.active\:scale-95:active {
  transform: scale(0.95);
}
</style>
