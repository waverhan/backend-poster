<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">🛒 {{ $t('cart.title') }}</h1>

      <div v-if="isEmpty" class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('cart.empty') }}</h2>
        <p class="text-gray-600 mb-8">{{ $t('cart.emptyDescription') }}</p>
        <router-link to="/shop" class="btn-primary">
          {{ $t('cart.continueShopping') }}
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Cart Items (Regular Products Only) -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">{{ $t('cart.items') }} ({{ regularItemsCount }})</h2>
          <div class="space-y-4">
            <div
              v-for="item in regularItems"
              :key="item.cart_item_id || item.product_id"
              class="py-4 border-b border-gray-200 last:border-b-0"
            >
              <!-- Mobile Layout -->
              <div class="block sm:hidden">
                <div class="flex items-start space-x-3">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      v-if="item.image_url"
                      :src="getImageUrl(item.image_url)"
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
                    <!-- Bottle Information - Hidden -->
                    <!-- Bottle sync happens automatically in background -->

                    <!-- Mobile quantity controls and total -->
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-2">
                        <!-- Quantity controls (hidden for bottle products) -->
                        <div v-if="!item.is_bottle_product" class="flex items-center space-x-1">
                          <button
                            @click="item.is_draft_beverage ? decreaseDraftQuantity(item) : decreaseQuantity(item.cart_item_id || item.product_id)"
                            class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                          >
                            -
                          </button>
                          <span class="w-6 text-center text-sm">{{ formatQuantityDisplay(item) }}</span>
                          <button
                            @click="item.is_draft_beverage ? increaseDraftQuantity(item) : increaseQuantity(item.cart_item_id || item.product_id)"
                            class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <!-- Show quantity only for bottle products -->
                        <div v-else class="flex items-center space-x-1">
                          <span class="w-6 text-center text-sm text-gray-500">{{ item.quantity }}</span>
                        </div>
                        <!-- Draft beverage info - Hidden -->
                      </div>

                      <div class="flex items-center space-x-2">
                        <div class="font-bold text-sm">{{ formatItemTotal(item) }} ₴</div>
                        <!-- Hide delete button for bottle products -->
                        <button
                          v-if="!item.is_bottle_product"
                          @click="removeItem(item.cart_item_id || item.product_id)"
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
                      :src="getImageUrl(item.image_url)"
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
                      <span v-else-if="item.custom_unit">{{ $t('cart.per') }} {{ formatCustomUnit(item) }}</span>
                      <span v-else>{{ $t('cart.each') }}</span>
                    </p>
                    <!-- Bottle Information - Hidden -->
                    <!-- Bottle sync happens automatically in background -->
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <!-- Quantity controls (hidden for bottle products) -->
                  <div v-if="!item.is_bottle_product" class="flex items-center space-x-2">
                    <button
                      @click="item.is_draft_beverage ? decreaseDraftQuantity(item) : decreaseQuantity(item.cart_item_id || item.product_id)"
                      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span class="w-8 text-center">{{ formatQuantityDisplay(item) }}</span>
                    <button
                      @click="item.is_draft_beverage ? increaseDraftQuantity(item) : increaseQuantity(item.cart_item_id || item.product_id)"
                      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <!-- Show quantity only for bottle products -->
                  <div v-else class="flex items-center space-x-2">
                    <span class="w-8 text-center text-gray-500">{{ item.quantity }}</span>
                  </div>

                  <!-- Draft beverage info - Hidden -->

                  <div class="text-right">
                    <div class="font-bold">{{ formatItemTotal(item) }} ₴</div>
                  </div>

                  <!-- Hide delete button for bottle products -->
                  <button
                    v-if="!item.is_bottle_product"
                    @click="removeItem(item.cart_item_id || item.product_id)"
                    class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottles Section (Auto-added for draft beverages) -->
        <div v-if="bottleItems.length > 0" class="card p-6">
          <h2 class="text-xl font-bold mb-4">🍾 Пляшки (автоматично додано)</h2>
          <div class="space-y-2">
            <div
              v-for="bottle in bottleItems"
              :key="bottle.cart_item_id || bottle.product_id"
              class="flex items-center justify-between py-2 text-sm text-gray-600"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  🍾
                </div>
                <div>
                  <span class="font-medium">{{ bottle.name }}</span>
                  <div class="text-xs text-gray-500">{{ bottle.price }} ₴ за шт</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{ bottle.quantity }} шт</span>
                <span class="font-bold">{{ (bottle.price * bottle.quantity).toFixed(2) }} ₴</span>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            * Пляшки автоматично додаються для розливного пива
          </div>
        </div>

        <!-- Delivery Method Selection -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">🚚 {{ $t('checkout.deliveryMethod') }}</h2>

          <!-- Loading state -->
          <div v-if="branchStore.isLoading" class="text-center py-8">
            <div class="text-2xl mb-2">⏳</div>
            <p class="text-gray-600">{{ $t('checkout.loadingDeliveryOptions') }}</p>
          </div>

          <!-- Error state -->
          <div v-else-if="branchStore.error" class="text-center py-8">
            <div class="text-2xl mb-2">❌</div>
            <p class="text-red-600 mb-4">{{ branchStore.error }}</p>
            <button
              @click="branchStore.fetchBranches(true)"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {{ $t('checkout.retry') }}
            </button>
          </div>

          <!-- No branches state -->
          <div v-else-if="!branchStore.branches.length" class="text-center py-8">
            <div class="text-2xl mb-2">🏪</div>
            <p class="text-gray-600">{{ $t('checkout.noDeliveryOptions') }}</p>
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
          <h2 class="text-xl font-bold mb-4">{{ $t('checkout.orderSummary') }}</h2>

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
              <span>{{ $t('cart.subtotal') }}:</span>
              <span>{{ subtotal.toFixed(2) }} ₴</span>
            </div>
            <div v-if="selectedMethodFee > 0" class="flex justify-between">
              <span>{{ $t('cart.deliveryFee') }}:</span>
              <span>{{ selectedMethodFee.toFixed(2) }} ₴</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold text-lg">
              <span>{{ $t('cart.total') }}:</span>
              <span>{{ (subtotal + selectedMethodFee).toFixed(2) }} ₴</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="clearCart"
              class="w-full btn-outline"
            >
              {{ $t('cart.clearCart') }}
            </button>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getBottleSelectionSummary, getDefaultBottleSelection, getBottleProduct } from '@/utils/bottleUtils'
import { useProductStore } from '@/stores/product'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import ProductAvailabilityService from '@/services/productAvailabilityService'
import { backendApi } from '@/services/backendApi'
import type { Branch, LocationData, Product } from '@/types'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()
const productStore = useProductStore()

const { items, totalItems, subtotal, deliveryFee, total, isEmpty } = storeToRefs(cartStore)

// Computed properties to separate regular items from bottles
const regularItems = computed(() => items.value.filter(item => !item.is_bottle_product))
const bottleItems = computed(() => items.value.filter(item => item.is_bottle_product))
const regularItemsCount = computed(() => regularItems.value.length)

// Constants
const MINIMUM_ORDER_AMOUNT = 300

// State
const selectedMethod = ref<{
  method: 'delivery' | 'pickup'
  location?: LocationData
  branch?: Branch
  fee: number
} | null>(null)

// Computed
const selectedMethodFee = computed(() => selectedMethod.value?.fee || 0)

// Methods
const handleMethodSelected = async (data: any) => {
  // This method is now only called from modal/checkout context
  // Cart context is handled directly by DeliveryMethodSelector
  selectedMethod.value = data
  

  // Check product availability for the selected branch
  if (data.branch && cartStore.items.length > 0) {
    

    try {
      const result = await ProductAvailabilityService.checkProductAvailability(
        cartStore.items,
        data.branch
      )

      if (result.hasUnavailableItems || result.hasAdjustedItems) {


        // Automatically adjust cart without showing popup
        // Remove completely unavailable items
        for (const item of result.unavailableItems) {
          if (!result.adjustedItems.find(adj => adj.product_id === item.product_id)) {
            cartStore.removeItem(item.product_id)
          }
        }

        // Update quantities for adjusted items
        for (const item of result.adjustedItems) {
          cartStore.updateItemQuantity(item.product_id, item.quantity)
        }

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



const increaseQuantity = (cartItemId: string) => {
  cartStore.increaseQuantity(cartItemId)
}

const decreaseQuantity = (cartItemId: string) => {
  cartStore.decreaseQuantity(cartItemId)
}

const removeItem = (cartItemId: string) => {
  cartStore.removeItem(cartItemId)
}

// Draft beverage quantity management with bottle sync
const increaseDraftQuantity = (draftItem: any) => {
  console.log('⬆️ Increasing draft quantity for:', draftItem.name, 'from', draftItem.quantity)

  // Increase draft beverage quantity first
  cartStore.increaseQuantity(draftItem.cart_item_id || draftItem.product_id)

  // Wait a moment for cart to update, then force sync all bottles
  nextTick(() => {
    console.log('🔄 Force syncing all bottles after quantity increase...')
    forceBottleSync()
  })
}

const decreaseDraftQuantity = (draftItem: any) => {
  console.log('⬇️ Decreasing draft quantity for:', draftItem.name, 'from', draftItem.quantity)

  if (draftItem.quantity <= 1) {
    // Remove draft beverage and all related bottles
    console.log('🗑️ Removing draft beverage and all bottles')
    removeDraftBeverageAndBottles(draftItem)
    return
  }

  // Decrease draft beverage quantity first
  cartStore.decreaseQuantity(draftItem.cart_item_id || draftItem.product_id)

  // Wait a moment for cart to update, then force sync all bottles
  nextTick(() => {
    console.log('🔄 Force syncing all bottles after quantity decrease...')
    forceBottleSync()
  })
}

const syncBottleQuantities = (draftItem: any, newQuantity: number) => {
  console.log('🔄 Syncing 1L bottles for draft beverages')

  // Calculate total quantity for ALL draft beverages in cart
  const currentItems = cartStore.items
  const allDraftBeverages = currentItems.filter(item => item.is_draft_beverage)
  const totalDraftQuantity = allDraftBeverages.reduce((total, item) => total + item.quantity, 0)

  console.log('🍺 Total draft quantity needed:', totalDraftQuantity, 'L')

  // Simple calculation: need exactly totalDraftQuantity number of 1L bottles
  const needed1LBottles = Math.ceil(totalDraftQuantity)
  console.log('🍾 Need', needed1LBottles, '× 1L bottles')

  // Get current bottle items
  const bottleItems = currentItems.filter(item => item.is_bottle_product)

  // Remove all existing bottles
  for (const bottleItem of bottleItems) {
    console.log('🗑️ Removing bottle:', bottleItem.name)
    cartStore.removeItem(bottleItem.cart_item_id || bottleItem.product_id)
  }

  // Add the exact number of 1L bottles needed
  if (needed1LBottles > 0) {
    const bottle1L = getBottleProduct('1L')
    if (bottle1L) {
      console.log(`➕ Adding ${needed1LBottles}x ${bottle1L.name}`)

      const bottleCartItem = {
        product_id: bottle1L.id,
        poster_product_id: bottle1L.poster_product_id,
        name: bottle1L.name,
        price: bottle1L.price,
        quantity: needed1LBottles,
        image_url: '',
        unit: 'pcs',
        is_bottle_product: true
      }
      cartStore.addItem(bottleCartItem)
    }
  }

  console.log('✅ Bottle sync completed:', needed1LBottles, '× 1L bottles for', totalDraftQuantity, 'L beer')
}

const removeDraftBeverageAndBottles = (draftItem: any) => {
  // Remove the draft beverage
  cartStore.removeItem(draftItem.cart_item_id || draftItem.product_id)

  // Remove all related bottle products
  const bottleItems = items.value.filter(item => item.is_bottle_product)
  for (const bottleItem of bottleItems) {
    cartStore.removeItem(bottleItem.cart_item_id || bottleItem.product_id)
  }
}

// Force sync all bottles based on current draft beverage quantities
const forceBottleSync = () => {
  console.log('🔄 Force syncing all bottles...')

  const currentItems = cartStore.items
  const allDraftBeverages = currentItems.filter(item => item.is_draft_beverage)
  const totalDraftQuantity = allDraftBeverages.reduce((total, item) => total + item.quantity, 0)

  console.log('🍺 Total draft quantity:', totalDraftQuantity, 'L')
  console.log('🍺 Draft beverages:', allDraftBeverages.map(d => `${d.name}: ${d.quantity}L`))

  if (totalDraftQuantity > 0) {
    // Use the first draft beverage as a reference for the sync function
    const referenceDraft = allDraftBeverages[0]
    syncBottleQuantities(referenceDraft, totalDraftQuantity)
  } else {
    // No draft beverages, remove all bottles
    const bottleItems = currentItems.filter(item => item.is_bottle_product)
    for (const bottleItem of bottleItems) {
      cartStore.removeItem(bottleItem.cart_item_id || bottleItem.product_id)
    }
  }
}

const extractBottleSizeFromName = (name: string): string => {
  const match = name.match(/(\d+(?:,\d+)?)\s*л/)
  return match ? `${match[1].replace(',', '.')}L` : ''
}

// Find bottle product in database by poster_product_id
const findBottleProductInDatabase = async (posterProductId: string) => {
  try {
    // Get all products from the store
    const products = productStore.products

    // Find bottle product by poster_product_id
    const bottleProduct = products.find(p =>
      p.poster_product_id === posterProductId &&
      p.category?.display_name === 'Тара'
    )

    return bottleProduct
  } catch (error) {
    console.error('Error finding bottle product in database:', error)
    return null
  }
}

// Check if bottles are in sync with draft beverage quantity
const checkBottleSyncStatus = (draftItem: any): boolean => {
  const bottleItems = items.value.filter(item => item.is_bottle_product)

  // Calculate total bottle volume
  const totalBottleVolume = bottleItems.reduce((total, bottle) => {
    const size = extractBottleSizeFromName(bottle.name)
    const volume = parseFloat(size.replace('L', '').replace(',', '.')) || 0
    return total + (volume * bottle.quantity)
  }, 0)

  // Check if bottle volume matches draft beverage quantity (allow 0.1L tolerance)
  const isOutOfSync = Math.abs(totalBottleVolume - draftItem.quantity) > 0.1

  if (isOutOfSync) {
    console.log(`⚠️ Bottles out of sync for ${draftItem.name}: ${totalBottleVolume}L bottles vs ${draftItem.quantity}L beverage`)
  }

  return isOutOfSync
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartStore.clearCart()
    selectedMethod.value = null
  }
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

  // For regular products, show the unit (convert "p" to "шт")
  const unit = item.unit
  return (unit === 'p' || unit === 'pcs') ? 'шт' : (unit || 'шт')
}

const formatQuantityDisplay = (item: any): string => {
  // For weight-based products, show pieces (quantity should always be whole numbers now)
  if (item.custom_quantity && item.custom_unit) {
    return Math.round(item.quantity).toString()
  }

  // For regular products, show quantity as is
  return Math.round(item.quantity).toString()
}

const getImageUrl = (imagePath: string): string => {
  return backendApi.getImageUrl(imagePath)
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
  // Force sync bottles on page load to ensure consistency
  console.log('🔄 Cart page mounted - checking bottle sync...')
  nextTick(() => {
    forceBottleSync()
  })

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

// Watch for changes in cart items to auto-sync bottles
watch(() => cartStore.items, (newItems, oldItems) => {
  console.log('👁️ Cart watcher triggered. Items count:', newItems?.length || 0)

  if (!newItems || !oldItems) {
    console.log('⚠️ Missing items data, skipping sync')
    return
  }

  // Skip auto-sync on checkout page - checkout handles bottle recalculation manually
  if (route.name === 'checkout') {
    console.log('🚫 Skipping auto bottle sync on checkout page')
    return
  }

  // Find draft beverages that changed quantity
  const draftBeverages = newItems.filter(item => item.is_draft_beverage)
  const oldDraftBeverages = oldItems.filter(item => item.is_draft_beverage)

  console.log('🍺 Draft beverages found:', draftBeverages.length, 'Old:', oldDraftBeverages.length)

  for (const draftItem of draftBeverages) {
    const oldDraftItem = oldDraftBeverages.find(old =>
      (old.cart_item_id || old.product_id) === (draftItem.cart_item_id || draftItem.product_id)
    )

    if (oldDraftItem && oldDraftItem.quantity !== draftItem.quantity) {
      console.log('🔍 Detected draft beverage quantity change:', draftItem.name, oldDraftItem.quantity, '→', draftItem.quantity)

      // Auto-sync bottles for this draft beverage immediately
      syncBottleQuantities(draftItem, draftItem.quantity)
    } else if (oldDraftItem) {
      console.log('📊 Draft beverage unchanged:', draftItem.name, 'Quantity:', draftItem.quantity)
    } else {
      console.log('🆕 New draft beverage detected:', draftItem.name, 'Quantity:', draftItem.quantity)
    }
  }
}, { deep: true, immediate: false })

// Add debug functions to window for console access
window.debugBottleSync = () => {
  const allItems = cartStore.items
  const draftBeverages = allItems.filter(item => item.is_draft_beverage)
  const bottleItems = allItems.filter(item => item.is_bottle_product)

  console.log('🔍 DEBUG: Current cart state')
  console.log('📦 All cart items:', allItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    is_draft_beverage: item.is_draft_beverage,
    is_bottle_product: item.is_bottle_product,
    product_id: item.product_id,
    poster_product_id: item.poster_product_id
  })))
  console.log('🍺 Draft beverages:', draftBeverages.map(d => `${d.name}: ${d.quantity}L`))
  console.log('🍾 Bottle items:', bottleItems.map(b => `${b.name}: ${b.quantity}x`))
}

// Add force sync function to window for debugging
window.forceBottleSync = forceBottleSync
</script>
