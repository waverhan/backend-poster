<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">🛒 {{ $t('cart.title') }}</h1>

      <!-- Empty Cart State - Native App Style -->
      <div v-if="isEmpty" class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">{{ $t('cart.empty') }}</h2>
        <p class="empty-cart-description">{{ $t('cart.emptyDescription') }}</p>
        <router-link to="/shop" class="empty-cart-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {{ $t('cart.continueShopping') }}
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Minimum Order Warning -->
        <div v-if="subtotal < MINIMUM_ORDER_AMOUNT" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="text-sm text-yellow-800">
            ⚠️ Мінімальна сума замовлення: {{ MINIMUM_ORDER_AMOUNT }} ₴
          </div>
          <div class="text-sm text-yellow-700 mt-1">
            Додайте ще товарів на {{ (MINIMUM_ORDER_AMOUNT - subtotal).toFixed(2) }} ₴
          </div>
          <!-- Shop More Link -->
          <div class="mt-3">
            <router-link to="/shop" class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
              <span>🛍️</span>
              <span>Перейти до магазину</span>
            </router-link>
          </div>
        </div>

        <!-- Suggested Products (always show when cart has items) -->
        <div v-if="firstCartProduct && subtotal < MINIMUM_ORDER_AMOUNT" class="mb-6">
          <RelatedProducts
            :current-product="firstCartProduct"
            :max-products="4"
            @cart-animation="handleCartAnimation"
          />
        </div>

        <!-- Free Delivery Notification Banner -->
        <div v-if="freeDeliveryNotification" class="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg">
          <div class="flex items-center gap-4">
            <!-- Progress Bar -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-gray-600 text-sm">Spend</span>
                <span class="text-2xl font-bold text-red-600">₴ {{ freeDeliveryNotification.remaining }}</span>
                <span class="text-gray-600 text-sm">more and enjoy</span>
                <span class="font-bold text-gray-800">free_shipping!</span>
              </div>
              <!-- Progress Bar -->
              <div class="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                  :style="{ width: freeDeliveryNotification.percentage + '%' }"
                ></div>
              </div>
            </div>
            <!-- Truck Icon -->
            <div class="flex-shrink-0">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                🚚
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll Indicator at Top -->
        <div class="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
          <div class="flex items-center justify-center gap-3 text-blue-700 font-semibold animate-bounce">
            <span class="text-2xl">👇</span>
            <span>Прокрутіть вниз для вибору способу доставки</span>
            <span class="text-2xl">👇</span>
          </div>
        </div>

        <!-- Cart Items (Regular Products Only) -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">{{ $t('cart.items') }} ({{ regularItemsCount + bottleItems.length }})</h2>
          <div :class="['space-y-2', (regularItemsCount + bottleItems.length) > 4 ? 'max-h-96 overflow-y-auto pr-2' : 'space-y-4']">
            <div
              v-for="item in regularItems"
              :key="item.cart_item_id || item.product_id"
              class="py-4 border-b border-gray-200"
            >
              <!-- Mobile Layout - Native App Style -->
              <div class="block sm:hidden">
                <div class="cart-item-mobile">
                  <!-- Bigger Product Image -->
                  <div class="cart-item-image">
                    <img
                      v-if="item.image_url"
                      :src="getImageUrl(item.image_url)"
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-xl"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-3xl bg-gray-100 rounded-xl">
                      🍽️
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="cart-item-info">
                    <h3 class="cart-item-name">{{ item.name }}</h3>
                    <p class="cart-item-price">
                      {{ formatItemPrice(item) }} ₴
                      <span v-if="item.is_draft_beverage" class="text-gray-500">за {{ item.quantity }}L</span>
                      <span v-else-if="item.custom_unit" class="text-gray-500">per {{ formatCustomUnit(item) }}</span>
                    </p>

                    <!-- Quantity Controls - Larger Touch Targets -->
                    <div class="cart-item-actions">
                      <div v-if="!item.is_bottle_product" class="quantity-controls-large">
                        <button
                          @click="item.is_draft_beverage ? decreaseDraftQuantity(item) : decreaseQuantity(item.cart_item_id || item.product_id)"
                          class="quantity-btn"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span class="quantity-display">{{ formatQuantityDisplay(item) }}</span>
                        <button
                          @click="item.is_draft_beverage ? increaseDraftQuantity(item) : increaseQuantity(item.cart_item_id || item.product_id)"
                          class="quantity-btn"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <!-- Show quantity only for bottle products -->
                      <div v-else class="text-sm text-gray-500">
                        Кількість: {{ item.quantity }}
                      </div>

                      <!-- Item Total and Delete -->
                      <div class="cart-item-total-actions">
                        <div class="cart-item-total">{{ formatItemTotal(item) }} ₴</div>
                        <button
                          v-if="!item.is_bottle_product"
                          @click="removeItem(item.cart_item_id || item.product_id)"
                          class="delete-btn"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Layout -->
              <div class="hidden sm:flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      v-if="item.image_url"
                      :src="getImageUrl(item.image_url)"
                      :alt="item.name"
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <span v-else class="text-xl">🍽️</span>
                  </div>
                  <div>
                    <h3 class="font-medium text-sm">{{ item.name }}</h3>
                    <p class="text-gray-600 text-xs">
                      {{ formatItemPrice(item) }} ₴
                      <span v-if="item.is_draft_beverage">за {{ item.quantity }}L</span>
                      <span v-else-if="item.custom_unit">{{ $t('cart.per') }} {{ formatCustomUnit(item) }}</span>
                      <span v-else>{{ $t('cart.each') }}</span>
                    </p>
                    <!-- Bottle Information - Hidden -->
                    <!-- Bottle sync happens automatically in background -->
                  </div>
                </div>

                <div class="flex items-center space-x-3">
                  <!-- Quantity controls (hidden for bottle products) -->
                  <div v-if="!item.is_bottle_product" class="flex items-center space-x-1">
                    <button
                      @click="item.is_draft_beverage ? decreaseDraftQuantity(item) : decreaseQuantity(item.cart_item_id || item.product_id)"
                      class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                    >
                      -
                    </button>
                    <span class="w-7 text-center text-sm">{{ formatQuantityDisplay(item) }}</span>
                    <button
                      @click="item.is_draft_beverage ? increaseDraftQuantity(item) : increaseQuantity(item.cart_item_id || item.product_id)"
                      class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <!-- Show quantity only for bottle products -->
                  <div v-else class="flex items-center space-x-1">
                    <span class="w-7 text-center text-sm text-gray-500">{{ item.quantity }}</span>
                  </div>

                  <!-- Draft beverage info - Hidden -->

                  <div class="text-right">
                    <div class="font-bold text-sm">{{ formatItemTotal(item) }} ₴</div>
                  </div>

                  <!-- Hide delete button for bottle products -->
                  <button
                    v-if="!item.is_bottle_product"
                    @click="removeItem(item.cart_item_id || item.product_id)"
                    class="w-7 h-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 flex items-center justify-center text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Bundle Items (shown under bundle product) -->
              <div v-if="item.is_bundle && item.bundle_items && item.bundle_items.length > 0" class="mt-1 ml-4 sm:ml-20 space-y-0.5">
                <div class="text-xs text-gray-500 font-medium mb-1">{{ $t('cart.bundleIncludes') || 'Включає:' }}</div>
                <div
                  v-for="(bundleItem, idx) in item.bundle_items"
                  :key="`bundle-${item.cart_item_id}-${idx}`"
                  class="flex items-center justify-between text-xs text-gray-600 py-0.5 px-1.5 bg-gray-50 rounded"
                >
                  <div class="flex items-center space-x-1">
                    <span class="text-gray-400">•</span>
                    <span class="truncate">{{ bundleItem.name }}</span>
                  </div>
                  <span class="text-gray-500 ml-1 flex-shrink-0">{{ bundleItem.quantity }}{{ bundleItem.unit }}</span>
                </div>
              </div>
            </div>

            <!-- Bottles Section (Auto-added for draft beverages) - Inside scroll -->
            <div v-if="bottleItems.length > 0">
              <div
                v-for="bottle in bottleItems"
                :key="bottle.cart_item_id || bottle.product_id"
                class="py-4 border-b border-gray-200 last:border-b-0"
              >
                <!-- Mobile Layout -->
                <div class="block sm:hidden">
                  <div class="flex items-start space-x-2">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      🍾
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-xs">{{ bottle.name }}</h3>
                      <p class="text-gray-600 text-xs">{{ bottle.price }} ₴ за шт</p>

                      <div class="flex items-center justify-between mt-1">
                        <div class="flex items-center space-x-1">
                          <span class="w-5 text-center text-xs text-gray-500">{{ bottle.quantity }} шт</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <div class="font-bold text-xs">{{ (bottle.price * bottle.quantity).toFixed(2) }} ₴</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop Layout -->
                <div class="hidden sm:flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                      🍾
                    </div>
                    <div>
                      <h3 class="font-medium text-sm">{{ bottle.name }}</h3>
                      <p class="text-gray-600 text-xs">{{ bottle.price }} ₴ за шт</p>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3">
                    <div class="text-right">
                      <div class="text-sm text-gray-500">{{ bottle.quantity }} шт</div>
                      <div class="font-bold text-sm">{{ (bottle.price * bottle.quantity).toFixed(2) }} ₴</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

        <!-- Order Summary -->
        <div class="card p-6">
          <h2 class="text-xl font-bold mb-4">{{ $t('checkout.orderSummary') }}</h2>

          <!-- Free Delivery Threshold Message -->
          <div v-if="freeDeliveryThreshold > 0 && subtotal < freeDeliveryThreshold && selectedMethodType === 'delivery'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2 text-blue-800">
              <span>🚚</span>
              <span class="text-sm font-medium">
                Витратьте ще {{ (freeDeliveryThreshold - subtotal).toFixed(2) }} ₴ для безплатної доставки!
              </span>
            </div>
          </div>

          <!-- Applied Discounts -->
          <div v-if="applicableDiscounts.length > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="text-sm font-medium text-green-900 mb-2">✅ Застосовані знижки:</div>
            <div class="space-y-2">
              <div v-for="discount in applicableDiscounts" :key="discount.id" class="text-sm text-green-800">
                <!-- First Order Discount -->
                <div v-if="discount.type === 'first_order'" class="flex justify-between items-center">
                  <span>🎁 {{ discount.name }} ({{ discount.discount_value }}%):</span>
                  <span class="font-semibold text-green-600">-{{ calculateDiscountAmount(discount).toFixed(2) }} ₴</span>
                </div>
                <!-- Happy Hours Discount -->
                <div v-else-if="discount.type === 'happy_hours'" class="flex justify-between items-center">
                  <span>⏰ {{ discount.name }} ({{ discount.discount_value }}%):</span>
                  <span class="font-semibold text-green-600">-{{ calculateDiscountAmount(discount).toFixed(2) }} ₴</span>
                </div>
                <!-- Free Delivery -->
                <div v-else-if="discount.type === 'free_delivery'" class="flex justify-between items-center">
                  <span>🚚 Безплатна доставка</span>
                  <span class="font-semibold text-green-600">Включено!</span>
                </div>
                <!-- Fixed Shipping -->
                <div v-else-if="discount.type === 'fixed_shipping'" class="flex justify-between items-center">
                  <span>📦 Фіксована доставка (99 ₴)</span>
                  <span class="font-semibold text-green-600">Включено!</span>
                </div>
                <!-- Beer Promo -->
                <div v-else-if="discount.type === 'beer_promo'" class="flex justify-between items-center">
                  <span>🍺 {{ discount.name }}</span>
                  <span class="font-semibold text-green-600">Включено!</span>
                </div>
                <!-- Other discounts -->
                <div v-else class="flex justify-between items-center">
                  <span>{{ discount.name }}:</span>
                  <span class="font-semibold text-green-600">-{{ calculateDiscountAmount(discount).toFixed(2) }} ₴</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Available Discounts Promotions -->
          <div v-if="availableDiscounts.length > 0" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="text-sm font-medium text-amber-900 mb-2">🎉 Доступні знижки:</div>
            <div class="space-y-2">
              <div v-for="promo in availableDiscounts" :key="promo.id" class="text-sm text-amber-800 bg-white p-2 rounded">
                <div class="font-medium">{{ promo.title }}</div>
                <div class="text-xs text-amber-700">{{ promo.description }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <span>{{ $t('cart.subtotal') }}:</span>
              <span>{{ subtotal.toFixed(2) }} ₴</span>
            </div>
            <div v-if="totalDiscount > 0" class="flex justify-between text-green-600 font-medium">
              <span>Знижка:</span>
              <span>-{{ totalDiscount.toFixed(2) }} ₴</span>
            </div>
            <div v-if="selectedMethodFee > 0" class="flex justify-between">
              <span>{{ $t('cart.deliveryFee') }}:</span>
              <span>{{ selectedMethodFee.toFixed(2) }} ₴</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold text-lg">
              <span>{{ $t('cart.total') }}:</span>
              <span>{{ (subtotal - totalDiscount + selectedMethodFee).toFixed(2) }} ₴</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Sticky Checkout Button (Mobile Only) -->
    <div v-if="!isEmpty" class="sticky-checkout-button md:hidden">
      <div class="sticky-checkout-content">
        <div class="sticky-checkout-total">
          <div class="text-sm text-gray-600">Всього</div>
          <div class="text-xl font-bold text-gray-900">
            {{ (subtotal - totalDiscount + selectedMethodFee).toFixed(2) }} ₴
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
import { useDiscountStore } from '@/stores/discount'
import { getBottleSelectionSummary, getDefaultBottleSelection, getBottleProduct } from '@/utils/bottleUtils'
import { useProductStore } from '@/stores/product'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'
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
const discountStore = useDiscountStore()

const { items, totalItems, subtotal, deliveryFee, total, isEmpty } = storeToRefs(cartStore)

// Computed properties to separate regular items from bottles
const regularItems = computed(() => items.value.filter(item => !item.is_bottle_product))
const bottleItems = computed(() => items.value.filter(item => item.is_bottle_product))
const regularItemsCount = computed(() => regularItems.value.length)

// Suggested products - get first cart product for related products
const firstCartProduct = computed(() => {
  const firstItem = regularItems.value[0]
  if (!firstItem) return null

  // Find the full product from productStore
  return productStore.products.find(p => p.id === firstItem.product_id) || null
})

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
const selectedMethodType = computed(() => selectedMethod.value?.method || null)

// Discount computed properties
const applicableDiscounts = computed(() => discountStore.applicableDiscounts)
const totalDiscount = computed(() => {
  let total = 0
  for (const discount of applicableDiscounts.value) {
    total += calculateDiscountAmount(discount)
  }
  return total
})

const freeDeliveryThreshold = computed(() => {
  const freeDeliveryDiscount = applicableDiscounts.value.find(d => d.type === 'free_delivery')
  return freeDeliveryDiscount?.min_order_amount || 1500
})

// Free delivery notification banner
const freeDeliveryNotification = computed(() => {
  // Check if free delivery discount is enabled
  const freeDeliveryDiscount = discountStore.discounts.find(d => d.type === 'free_delivery' && d.enabled)
  if (!freeDeliveryDiscount) return null

  const threshold = freeDeliveryDiscount.min_order_amount || 1500

  // If already applicable, don't show notification
  if (subtotal.value >= threshold) return null

  const remaining = threshold - subtotal.value
  const percentage = (subtotal.value / threshold) * 100

  return {
    remaining: remaining.toFixed(2),
    percentage: Math.min(percentage, 100)
  }
})

// Available discounts that are not yet applicable (for promotional messages)
const availableDiscounts = computed(() => {
  const promos: any[] = []

  // Check for first order discount
  const firstOrderDiscount = discountStore.discounts.find(d => d.type === 'first_order' && d.enabled)
  if (firstOrderDiscount && !applicableDiscounts.value.find(d => d.type === 'first_order')) {
    promos.push({
      id: 'first_order_promo',
      title: '🎁 Знижка для нових клієнтів',
      description: `Отримайте ${firstOrderDiscount.discount_value}% знижку на ваше перше замовлення!`
    })
  }

  // Check for happy hours discount
  const happyHoursDiscount = discountStore.discounts.find(d => d.type === 'happy_hours' && d.enabled)
  if (happyHoursDiscount && !applicableDiscounts.value.find(d => d.type === 'happy_hours')) {
    promos.push({
      id: 'happy_hours_promo',
      title: '⏰ Щасливі години',
      description: `${happyHoursDiscount.discount_value}% знижка пн-чт з 10:00 до 17:00`
    })
  }

  // Check for free delivery discount
  const freeDeliveryDiscount = discountStore.discounts.find(d => d.type === 'free_delivery' && d.enabled)
  if (freeDeliveryDiscount && !applicableDiscounts.value.find(d => d.type === 'free_delivery') && subtotal.value < freeDeliveryThreshold.value) {
    const remaining = (freeDeliveryThreshold.value - subtotal.value).toFixed(2)
    promos.push({
      id: 'free_delivery_promo',
      title: '🚚 Безплатна доставка',
      description: `Додайте ще ${remaining} ₴ для безплатної доставки`
    })
  }

  return promos
})

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

const proceedToCheckout = () => {
  if (subtotal.value < MINIMUM_ORDER_AMOUNT) {
    notificationStore.showNotification('Мінімальна сума замовлення: ' + MINIMUM_ORDER_AMOUNT + ' ₴', 'warning')
    return
  }

  if (!selectedMethod.value) {
    notificationStore.showNotification('Будь ласка, оберіть спосіб доставки', 'warning')
    return
  }

  // Navigate to checkout
  router.push('/checkout')
}

// Draft beverage quantity management with bottle sync
const increaseDraftQuantity = (draftItem: any) => {
  

  // Increase draft beverage quantity first
  cartStore.increaseQuantity(draftItem.cart_item_id || draftItem.product_id)

  // Wait a moment for cart to update, then force sync all bottles
  nextTick(() => {
    
    forceBottleSync()
  })
}

const decreaseDraftQuantity = (draftItem: any) => {
  

  if (draftItem.quantity <= 1) {
    // Remove draft beverage and all related bottles
    
    removeDraftBeverageAndBottles(draftItem)
    return
  }

  // Decrease draft beverage quantity first
  cartStore.decreaseQuantity(draftItem.cart_item_id || draftItem.product_id)

  // Wait a moment for cart to update, then force sync all bottles
  nextTick(() => {
    
    forceBottleSync()
  })
}

const syncBottleQuantities = (draftItem: any, newQuantity: number) => {
  

  // Calculate total quantity for ALL draft beverages in cart
  const currentItems = cartStore.items
  const allDraftBeverages = currentItems.filter(item => item.is_draft_beverage)
  const totalDraftQuantity = allDraftBeverages.reduce((total, item) => total + item.quantity, 0)

  

  // Simple calculation: need exactly totalDraftQuantity number of 1L bottles
  const needed1LBottles = Math.ceil(totalDraftQuantity)
  

  // Get current bottle items
  const bottleItems = currentItems.filter(item => item.is_bottle_product)

  // Remove all existing bottles
  for (const bottleItem of bottleItems) {
    
    cartStore.removeItem(bottleItem.cart_item_id || bottleItem.product_id)
  }

  // Add the exact number of 1L bottles needed
  if (needed1LBottles > 0) {
    const bottle1L = getBottleProduct('1L')
    if (bottle1L) {
      

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
  

  const currentItems = cartStore.items
  const allDraftBeverages = currentItems.filter(item => item.is_draft_beverage)
  const totalDraftQuantity = allDraftBeverages.reduce((total, item) => total + item.quantity, 0)

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
    
  }

  return isOutOfSync
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartStore.clearCart()
    selectedMethod.value = null
  }
}

// Handle cart animation from RelatedProducts component
const handleCartAnimation = (event: { x: number; y: number }) => {
  // Cart animation is handled by the component itself
  
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

// Discount methods
const calculateDiscountAmount = (discount: any): number => {
  // For free delivery and fixed shipping, don't show as discount amount
  // They affect the delivery fee instead
  if (discount.type === 'free_delivery' || discount.type === 'fixed_shipping') {
    return 0
  }

  if (discount.discount_type === 'percentage') {
    return (subtotal.value * discount.discount_value) / 100
  } else if (discount.discount_type === 'fixed_amount') {
    return discount.discount_value
  }
  return 0
}

const loadApplicableDiscounts = async () => {
  try {
    // Load all discounts for promotional messages
    if (discountStore.discounts.length === 0) {
      await discountStore.getEnabledDiscounts()
    }

    // Load applicable discounts for current cart
    await discountStore.getApplicableDiscounts(
      null, // customerId
      null, // userId
      subtotal.value,
      cartStore.items
    )
  } catch (error) {
    console.error('Error loading discounts:', error)
  }
}

// Lifecycle
onMounted(async () => {
  // Force sync bottles on page load to ensure consistency
  
  nextTick(() => {
    forceBottleSync()
  })

  // Load applicable discounts
  await loadApplicableDiscounts()

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

// Watch for changes in delivery method in cart store
watch(() => cartStore.deliveryMethod, (newMethod) => {
  if (newMethod && cartStore.deliveryFee !== undefined) {
    const method = newMethod as 'delivery' | 'pickup'
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

// Watch for changes in cart items to auto-sync bottles and reload discounts
watch(() => cartStore.items, (newItems, oldItems) => {
  

  if (!newItems || !oldItems) {
    
    return
  }

  // Reload applicable discounts when cart changes
  loadApplicableDiscounts()

  // Skip auto-sync on checkout page - checkout handles bottle recalculation manually
  if (route.name === 'checkout') {
    
    return
  }

  // Find draft beverages that changed quantity
  const draftBeverages = newItems.filter(item => item.is_draft_beverage)
  const oldDraftBeverages = oldItems.filter(item => item.is_draft_beverage)

  

  for (const draftItem of draftBeverages) {
    const oldDraftItem = oldDraftBeverages.find(old =>
      (old.cart_item_id || old.product_id) === (draftItem.cart_item_id || draftItem.product_id)
    )

    if (oldDraftItem && oldDraftItem.quantity !== draftItem.quantity) {
      

      // Auto-sync bottles for this draft beverage immediately
      syncBottleQuantities(draftItem, draftItem.quantity)
    } else if (oldDraftItem) {
      
    } else {
      
    }
  }
}, { deep: true, immediate: false })

// Add debug functions to window for console access
window.debugBottleSync = () => {
  const allItems = cartStore.items
  const draftBeverages = allItems.filter(item => item.is_draft_beverage)
  const bottleItems = allItems.filter(item => item.is_bottle_product)
}

// Add force sync function to window for debugging
window.forceBottleSync = forceBottleSync
</script>

<style scoped>
/* Empty Cart State - Native App Style */
.empty-cart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-cart-icon {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
}

.empty-cart-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 400px;
}

.empty-cart-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary, #FF6B35);
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.empty-cart-button:hover {
  background: var(--color-primary-dark, #E55A2B);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

/* Cart Item - Native App Style (Mobile) */
.cart-item-mobile {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.75rem;
}

.cart-item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cart-item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.cart-item-price {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: auto;
}

/* Larger Quantity Controls */
.quantity-controls-large {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-btn {
  width: 48px;
  height: 48px;
  min-height: var(--touch-target-comfortable, 48px);
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quantity-btn:active {
  transform: scale(0.95);
  background: #e5e7eb;
}

.quantity-display {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  min-width: 40px;
  text-align: center;
}

.cart-item-total-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cart-item-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #FF6B35);
}

.delete-btn {
  width: 48px;
  height: 48px;
  min-height: var(--touch-target-comfortable, 48px);
  border-radius: 12px;
  background: #fef2f2;
  border: none;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:active {
  transform: scale(0.95);
  background: #fee2e2;
}

/* Sticky Checkout Button (Mobile) */
.sticky-checkout-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom) + 60px); /* Account for mobile nav */
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.sticky-checkout-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.sticky-checkout-total {
  flex-shrink: 0;
}

.sticky-checkout-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--color-primary, #FF6B35);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  min-height: var(--touch-target-large, 56px);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.sticky-checkout-btn:active:not(:disabled) {
  transform: scale(0.98);
  background: var(--color-primary-dark, #E55A2B);
}

/* Dark mode support */
.dark .sticky-checkout-button {
  background: #1f2937;
  border-top-color: #374151;
}

.dark .sticky-checkout-total {
  color: #f9fafb;
}
</style>
