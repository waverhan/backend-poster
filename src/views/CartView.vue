<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">🛒 Shopping Cart</h1>

      <div v-if="isEmpty" class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Add some products to get started</p>
        <router-link to="/shop" class="btn-primary">
          Continue Shopping
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Cart Items -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">Items ({{ totalItems }})</h2>
          <div class="space-y-4">
            <div
              v-for="item in items"
              :key="item.product_id"
              class="py-4 border-b border-gray-200 last:border-b-0"
            >
              <!-- Mobile Layout -->
              <div class="block sm:hidden">
                <div class="flex items-start space-x-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <span v-else class="text-lg">🍽️</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-sm">{{ item.name }}</h3>
                    <p class="text-gray-600 text-sm">
                      {{ formatItemPrice(item) }} ₴
                      <span v-if="item.is_draft_beverage">за {{ item.quantity }}L</span>
                      <span v-else-if="item.custom_unit">per {{ formatCustomUnit(item) }}</span>
                      <span v-else>each</span>
                    </p>
                    <!-- Bottle Information -->
                    <div v-if="item.is_draft_beverage && item.bottles" class="text-xs text-gray-500 mt-1">
                      <div>🍾 Пляшки: {{ getBottleSelectionSummary(item.bottles) }}</div>
                      <div>💰 Вартість пляшок: {{ (item.bottle_cost || 0).toFixed(2) }} ₴</div>
                    </div>

                    <!-- Mobile quantity controls and total -->
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-2">
                        <!-- Quantity controls - disabled for draft beverages -->
                        <div v-if="!item.is_draft_beverage" class="flex items-center space-x-1">
                          <button
                            @click="decreaseQuantity(item.product_id)"
                            class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                          >
                            -
                          </button>
                          <span class="w-6 text-center text-sm">{{ item.quantity }}</span>
                          <button
                            @click="increaseQuantity(item.product_id)"
                            class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <!-- Draft beverage info -->
                        <div v-else class="text-xs text-gray-600">
                          Кількість: {{ item.quantity }}L
                        </div>
                      </div>

                      <div class="flex items-center space-x-2">
                        <div class="font-bold text-sm">{{ formatItemTotal(item) }} ₴</div>
                        <button
                          @click="removeItem(item.product_id)"
                          class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Layout -->
              <div class="hidden sm:flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <span v-else class="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <h3 class="font-medium">{{ item.name }}</h3>
                    <p class="text-gray-600">
                      {{ formatItemPrice(item) }} ₴
                      <span v-if="item.is_draft_beverage">за {{ item.quantity }}L</span>
                      <span v-else-if="item.custom_unit">per {{ formatCustomUnit(item) }}</span>
                      <span v-else>each</span>
                    </p>
                    <!-- Bottle Information -->
                    <div v-if="item.is_draft_beverage && item.bottles" class="text-sm text-gray-500 mt-1">
                      <div>🍾 Пляшки: {{ getBottleSelectionSummary(item.bottles) }}</div>
                      <div>💰 Вартість пляшок: {{ (item.bottle_cost || 0).toFixed(2) }} ₴</div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <!-- Quantity controls - disabled for draft beverages -->
                  <div v-if="!item.is_draft_beverage" class="flex items-center space-x-2">
                    <button
                      @click="decreaseQuantity(item.product_id)"
                      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span class="w-8 text-center">{{ item.quantity }}</span>
                    <button
                      @click="increaseQuantity(item.product_id)"
                      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>

                  <!-- Draft beverage info -->
                  <div v-else class="text-sm text-gray-600">
                    Кількість: {{ item.quantity }}L
                  </div>

                  <div class="text-right">
                    <div class="font-bold">{{ formatItemTotal(item) }} ₴</div>
                  </div>

                  <button
                    @click="removeItem(item.product_id)"
                    class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Method Selection -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">🚚 Delivery Method</h2>

          <!-- Loading state -->
          <div v-if="branchStore.isLoading" class="text-center py-8">
            <div class="text-2xl mb-2">⏳</div>
            <p class="text-gray-600">Loading delivery options...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="branchStore.error" class="text-center py-8">
            <div class="text-2xl mb-2">❌</div>
            <p class="text-red-600 mb-4">{{ branchStore.error }}</p>
            <button
              @click="branchStore.fetchBranches(true)"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>

          <!-- No branches state -->
          <div v-else-if="!branchStore.branches.length" class="text-center py-8">
            <div class="text-2xl mb-2">🏪</div>
            <p class="text-gray-600">No delivery options available</p>
          </div>

          <!-- Delivery method selector -->
          <DeliveryMethodSelector
            v-else
            context="cart"
            @method-selected="handleMethodSelected"
          />
        </div>

        <!-- Cart Summary -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">Order Summary</h2>

          <!-- Minimum Order Warning -->
          <div v-if="subtotal < MINIMUM_ORDER_AMOUNT" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center gap-2 text-yellow-800">
              <span>⚠️</span>
              <span class="text-sm font-medium">
                Мінімальна сума замовлення: {{ MINIMUM_ORDER_AMOUNT }} ₴
              </span>
            </div>
            <div class="text-sm text-yellow-700 mt-1">
              Додайте ще товарів на {{ (MINIMUM_ORDER_AMOUNT - subtotal).toFixed(2) }} ₴
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>{{ subtotal.toFixed(2) }} ₴</span>
            </div>
            <div v-if="selectedMethodFee > 0" class="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{{ selectedMethodFee.toFixed(2) }} ₴</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{{ (subtotal + selectedMethodFee).toFixed(2) }} ₴</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="clearCart"
              class="w-full btn-outline"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <!-- AI Recommendations Section -->
        <div v-if="cartStore.items.length > 0 && showRecommendations && isRecommendationsEnabled" class="card p-6">
          <ProductRecommendations
            context="cart"
            :max-recommendations="4"
            :show-reasons="true"
            :show-actions="true"
            :use-ai="true"
            @product-selected="navigateToProduct"
            @hide-recommendations="hideRecommendations"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getBottleSelectionSummary } from '@/utils/bottleUtils'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import ProductRecommendations from '@/components/recommendations/ProductRecommendations.vue'
import ProductAvailabilityService from '@/services/productAvailabilityService'
import type { Branch, LocationData, Product } from '@/types'

const router = useRouter()
const cartStore = useCartStore()
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()

const { items, totalItems, subtotal, deliveryFee, total, isEmpty } = storeToRefs(cartStore)

// Constants
const MINIMUM_ORDER_AMOUNT = 300

// State
const selectedMethod = ref<{
  method: 'delivery' | 'pickup'
  location?: LocationData
  branch?: Branch
  fee: number
} | null>(null)

// Recommendations state
const showRecommendations = ref(true)

// Computed
const selectedMethodFee = computed(() => selectedMethod.value?.fee || 0)

const isRecommendationsEnabled = computed(() => {
  return siteConfigStore.currentConfig.enable_recommendations !== false
})

// Methods
const handleMethodSelected = async (data: any) => {
  // This method is now only called from modal/checkout context
  // Cart context is handled directly by DeliveryMethodSelector
  selectedMethod.value = data
  

  // Check product availability for the selected branch
  if (data.branch && cartStore.items.length > 0) {
    

    try {
      const result = await ProductAvailabilityService.validateCartForBranch(
        data.branch,
        true // Show availability report
      )

      if (result.hasUnavailableItems || result.hasAdjustedItems) {
        

        // The service will handle showing the detailed report and user confirmation
        // If user confirmed changes, the cart will be automatically updated

        // Refresh the selected method if cart is now empty
        if (cartStore.items.length === 0) {
          selectedMethod.value = null
        }
      } else {
        
      }
    } catch (error) {
      console.error('Error checking product availability:', error)
      // Continue without blocking the user
    }
  }
}



const increaseQuantity = (productId: string) => {
  cartStore.increaseQuantity(productId)
}

const decreaseQuantity = (productId: string) => {
  cartStore.decreaseQuantity(productId)
}

const removeItem = (productId: string) => {
  cartStore.removeItem(productId)
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartStore.clearCart()
    selectedMethod.value = null
  }
}

const navigateToProduct = (product: Product) => {
  router.push(`/product/${product.id}`)
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

// Helper functions for cart item display
const formatItemPrice = (item: any): string => {
  // If item has custom quantity (weight-based), show price per custom unit
  if (item.custom_quantity && item.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = item.price * item.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return item.price.toFixed(2)
}

const formatCustomUnit = (item: any): string => {
  // If item has custom quantity, show the custom unit
  if (item.custom_quantity && item.custom_unit) {
    // Convert custom_quantity to display format
    if (item.custom_unit === 'г') {
      const grams = item.custom_quantity * 1000
      return `${grams}г`
    } else if (item.custom_unit === 'мл') {
      const ml = item.custom_quantity * 1000
      return `${ml}мл`
    }
    return item.custom_unit
  }

  // For regular products, show the unit
  return item.unit || 'шт'
}

const formatItemTotal = (item: any): string => {
  // Use the subtotal if available (calculated correctly in cart store)
  if (item.subtotal !== undefined) {
    return item.subtotal.toFixed(2)
  }

  // Fallback calculation for weight-based products
  if (item.custom_quantity && item.custom_unit) {
    const pricePerCustomUnit = item.price * item.custom_quantity
    return (pricePerCustomUnit * item.quantity).toFixed(2)
  }

  // For regular products
  return (item.price * item.quantity).toFixed(2)
}

// Lifecycle
onMounted(async () => {
  

  // Ensure branches are loaded for delivery method selector
  if (!branchStore.branches.length) {
    await branchStore.fetchBranches()
    
  } else {
    
  }

  // Check if delivery method was already selected (from ShopView)
  if (cartStore.deliveryMethod && cartStore.deliveryFee !== undefined) {
    const method = cartStore.deliveryMethod as 'delivery' | 'pickup'
    const fee = cartStore.deliveryFee
    const location = locationStore.userLocation
    const selectedBranch = branchStore.selectedBranch

    selectedMethod.value = {
      method,
      location: method === 'delivery' ? location || undefined : undefined,
      branch: selectedBranch || undefined,
      fee
    }

    
  }
})
</script>
