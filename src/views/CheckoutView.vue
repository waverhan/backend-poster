<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('checkout.title') }}</h1>
        <p class="text-gray-600">{{ $t('checkout.completeOrder') }}</p>
      </div>

      <!-- Checkout Steps -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Step 1: Delivery Method -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('checkout.deliveryMethod') }}</h2>
            </div>

            <!-- Selected Delivery Method Display -->
            <div v-if="selectedMethod" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">{{ selectedMethod.method === 'delivery' ? '🚚' : '🏪' }}</span>
                    <div>
                      <h3 class="font-medium text-gray-900">
                        {{ selectedMethod.method === 'delivery' ? 'Delivery' : 'Pickup' }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ selectedMethod.method === 'delivery'
                            ? (selectedMethod.location?.address || 'To your address')
                            : (selectedMethod.branch?.name || 'From our store')
                        }}
                      </p>
                      <p class="text-sm font-medium text-green-600">
                        {{ selectedMethod.fee === 0 ? 'Free' : `${selectedMethod.fee} UAH` }}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  @click="showEditDeliveryModal = true"
                  class="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-md transition-colors duration-200"
                >
                  Edit
                </button>
              </div>
            </div>

            <!-- No Method Selected -->
            <div v-else class="text-center py-8">
              <div class="text-2xl mb-2">📦</div>
              <p class="text-gray-600 mb-4">Please select a delivery method</p>
              <button
                @click="showEditDeliveryModal = true"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Select Delivery Method
              </button>
            </div>
          </div>

          <!-- Selected Method Summary (shown after method selection) -->
          <div v-if="selectedMethod" class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-sm">✓</span>
              </div>
              <h3 class="text-lg font-semibold text-green-900">
                {{ selectedMethod.method === 'delivery' ? '🚚 Доставка обрана' : '🏪 Самовивіз обраний' }}
              </h3>
            </div>
            <div class="text-sm text-green-700 space-y-1">
              <div v-if="selectedMethod.method === 'delivery'">
                <strong>Адреса доставки:</strong> {{ customerForm.delivery_address || 'Не вказано' }}
              </div>
              <div v-if="selectedMethod.method === 'pickup'">
                <strong>Місце самовивозу:</strong> {{ selectedMethod.branch?.name || 'Не вказано' }}
              </div>
              <div>
                <strong>Вартість:</strong> {{ selectedMethod.fee.toFixed(2) }} UAH
              </div>
            </div>
          </div>

          <!-- Step 2: Customer Information (shown after method selection) -->
          <div v-if="selectedMethod" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">{{ $t('checkout.contactInfo') }}</h2>
            </div>

            <form @submit.prevent="placeOrder" class="space-y-4" autocomplete="off">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('checkout.name') }} *
                  </label>
                  <input
                    v-model="customerForm.customer_name"
                    type="text"
                    required
                    autocomplete="off"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ваше ім'я"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('checkout.phone') }} *
                  </label>
                  <UkrainianPhoneInput
                    v-model="customerForm.customer_phone"
                    required
                    placeholder="+38(0___) ___-__-__"
                  />
                  <div v-if="customerForm.customer_phone && (!customerForm.customer_phone.startsWith('380') || customerForm.customer_phone.length !== 12)" class="text-red-500 text-sm mt-1">
                    Номер телефону повинен містити 9 цифр
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('checkout.email') }} *
                </label>
                <input
                  v-model="customerForm.customer_email"
                  type="email"
                  required
                  autocomplete="off"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('checkout.orderComment') }}
                </label>
                <textarea
                  v-model="customerForm.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('checkout.orderCommentPlaceholder')"
                ></textarea>
              </div>

              <!-- No Callback Confirmation Checkbox -->
              <div class="flex items-start space-x-3">
                <input
                  id="no-callback"
                  v-model="customerForm.no_callback_confirmation"
                  type="checkbox"
                  class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="no-callback" class="text-sm text-gray-700">
                  {{ $t('checkout.noCallbackConfirmation') }}
                </label>
              </div>
            </form>
          </div>

          <!-- Step 3: Payment Method (shown after customer info) -->
          <div v-if="selectedMethod && isCustomerFormValid" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">Спосіб оплати</h2>
            </div>

            <div class="space-y-4">
              <!-- Cash on Delivery -->
              <div
                :class="[
                  'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
                @click="paymentMethod = 'cash'"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="radio"
                    :checked="paymentMethod === 'cash'"
                    class="w-4 h-4 text-blue-600"
                    readonly
                  />
                  <div>
                    <h3 class="font-medium text-gray-900">💵 Оплата при отриманні</h3>
                    <p class="text-sm text-gray-600">Сплачуйте готівкою або карткою при отриманні замовлення</p>
                  </div>
                </div>
              </div>

              <!-- Online Payment (WayForPay) -->
              <div
                v-if="isOnlinePaymentEnabled"
                :class="[
                  'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                  paymentMethod === 'online'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
                @click="paymentMethod = 'online'"
              >
                <div class="flex items-center gap-3">
                  <input
                    type="radio"
                    :checked="paymentMethod === 'online'"
                    class="w-4 h-4 text-green-600"
                    readonly
                  />
                  <div>
                    <h3 class="font-medium text-gray-900">💳 Онлайн оплата</h3>
                    <p class="text-sm text-gray-600">Безпечна оплата карткою через WayForPay</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Visa</span>
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Mastercard</span>
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Apple Pay</span>
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Google Pay</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment method not available message -->
              <div v-if="!isOnlinePaymentEnabled" class="text-sm text-gray-500 italic">
                💡 Онлайн оплата тимчасово недоступна
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('checkout.orderSummary') }}</h2>

            <!-- Inventory Validation Status -->
            <div v-if="isValidatingInventory" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center gap-2 text-blue-800">
                <span>🔄</span>
                <span class="text-sm font-medium">Перевірка наявності товарів...</span>
              </div>
            </div>

            <!-- Inventory Issues Alert -->
            <div v-if="hasInventoryIssues" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center gap-2 text-red-800 mb-2">
                <span>❌</span>
                <span class="text-sm font-medium">Проблеми з наявністю товарів</span>
              </div>
              <div class="text-sm text-red-700 space-y-1">
                <div v-if="inventoryValidationResult?.hasUnavailableItems">
                  • {{ inventoryValidationResult.unavailableItems.length }} товар(ів) недоступно
                </div>
                <div v-if="inventoryValidationResult?.hasAdjustedItems">
                  • {{ inventoryValidationResult.adjustedItems.length }} товар(ів) з обмеженою кількістю
                </div>
                <div class="mt-2 text-xs">
                  Кількості будуть автоматично скориговані при оформленні замовлення
                </div>
              </div>
            </div>

            <!-- Minimum Order Warning -->
            <div v-if="cartSubtotal < MINIMUM_ORDER_AMOUNT" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center gap-2 text-yellow-800">
                <span>⚠️</span>
                <span class="text-sm font-medium">
                  Мінімальна сума замовлення: {{ MINIMUM_ORDER_AMOUNT }} ₴
                </span>
              </div>
              <div class="text-sm text-yellow-700 mt-1">
                Додайте ще товарів на {{ (MINIMUM_ORDER_AMOUNT - cartSubtotal).toFixed(2) }} ₴
              </div>
            </div>

            <!-- Cart Items -->
            <div class="space-y-3 mb-4">
              <div v-for="item in cartItems" :key="item.product_id" class="text-sm">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span>{{ item.name }}</span>
                      <!-- Inventory Status Icons -->
                      <span v-if="getItemInventoryStatus(item) === 'unavailable'" class="text-red-500 text-xs">❌</span>
                      <span v-else-if="getItemInventoryStatus(item) === 'adjusted'" class="text-yellow-500 text-xs">⚠️</span>
                      <span v-else-if="getItemInventoryStatus(item) === 'available'" class="text-green-500 text-xs">✅</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <!-- Show quantity adjustments -->
                      <span v-if="getItemInventoryStatus(item) === 'unavailable'" class="text-red-600">
                        Недоступно ({{ formatItemQuantity(item) }})
                      </span>
                      <span v-else-if="getItemInventoryStatus(item) === 'adjusted'" class="text-yellow-600">
                        {{ getAdjustedQuantity(item) }} з {{ formatItemQuantity(item) }} доступно
                      </span>
                      <span v-else>
                        {{ formatItemQuantity(item) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <!-- Show adjusted price if quantity changed -->
                    <div v-if="getItemInventoryStatus(item) === 'adjusted'" class="space-y-1">
                      <div class="line-through text-gray-400 text-xs">
                        {{ calculateItemTotal(item).toFixed(2) }} ₴
                      </div>
                      <div class="text-green-600 font-medium">
                        {{ calculateItemTotal(item, getAdjustedQuantity(item)).toFixed(2) }} ₴
                      </div>
                    </div>
                    <div v-else-if="getItemInventoryStatus(item) === 'unavailable'" class="space-y-1">
                      <div class="line-through text-red-500 text-xs">
                        {{ calculateItemTotal(item).toFixed(2) }} UAH
                      </div>
                      <div class="text-red-600 font-medium text-xs">
                        0.00 UAH
                      </div>
                    </div>
                    <div v-else>
                      {{ calculateItemTotal(item).toFixed(2) }} UAH
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr class="my-4">

            <!-- Totals -->
            <div class="space-y-2 text-sm">
              <!-- Show breakdown if there are inventory issues -->
              <div v-if="hasInventoryIssues && inventoryValidationResult" class="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                <div class="font-medium text-gray-700 mb-2">Розбивка замовлення:</div>
                <div v-if="inventoryValidationResult.totalAvailableValue > 0" class="flex justify-between text-green-600">
                  <span>✅ Доступні товари:</span>
                  <span>{{ inventoryValidationResult.totalAvailableValue.toFixed(2) }} ₴</span>
                </div>
                <div v-if="inventoryValidationResult.totalAdjustedValue > 0" class="flex justify-between text-yellow-600">
                  <span>⚠️ Часткова наявність:</span>
                  <span>{{ inventoryValidationResult.totalAdjustedValue.toFixed(2) }} ₴</span>
                </div>
                <div v-if="inventoryValidationResult.totalUnavailableValue > 0" class="flex justify-between text-red-600">
                  <span>❌ Недоступні товари:</span>
                  <span class="line-through">{{ inventoryValidationResult.totalUnavailableValue.toFixed(2) }} ₴</span>
                </div>
              </div>

              <div class="flex justify-between">
                <span>{{ $t('cart.subtotal') }}:</span>
                <span class="font-medium">{{ cartSubtotal.toFixed(2) }} ₴</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('cart.deliveryFee') }}:</span>
                <span>{{ deliveryFee.toFixed(2) }} ₴</span>
              </div>
              <hr class="my-2">
              <div class="flex justify-between font-semibold text-lg">
                <span>{{ $t('cart.total') }}:</span>
                <span class="text-green-600">{{ orderTotal.toFixed(2) }} ₴</span>
              </div>

              <!-- Show savings if items were removed/adjusted -->
              <div v-if="hasInventoryIssues && inventoryValidationResult?.totalUnavailableValue > 0" class="text-xs text-gray-500 mt-2">
                Заощаджено через недоступність: {{ inventoryValidationResult.totalUnavailableValue.toFixed(2) }} UAH
              </div>
            </div>

            <!-- Selected Method Info -->
            <div v-if="selectedMethod" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 mb-2">
                {{ selectedMethod.method === 'delivery' ? '🚚 Доставка' : '🏪 Самовивіз' }}
              </h3>
              <div class="text-xs space-y-1">
                <div v-if="selectedMethod.method === 'delivery'">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Адреса:</span>
                    <span class="text-right text-xs">{{ customerForm.delivery_address || 'Не вказано' }}</span>
                  </div>
                  <div v-if="selectedMethod.branch" class="flex justify-between">
                    <span class="text-gray-600">З філії:</span>
                    <span class="text-right">{{ selectedMethod.branch.name }}</span>
                  </div>
                </div>
                <div v-if="selectedMethod.method === 'pickup'">
                  <div v-if="selectedMethod.branch" class="flex justify-between">
                    <span class="text-gray-600">{{ $t('checkout.branch') }}:</span>
                    <span class="text-right">{{ selectedMethod.branch.name }}</span>
                  </div>
                  <div v-if="selectedMethod.branch?.address" class="flex justify-between">
                    <span class="text-gray-600">{{ $t('checkout.address') }}:</span>
                    <span class="text-right text-xs">{{ selectedMethod.branch.address }}</span>
                  </div>
                </div>
                <div class="flex justify-between font-medium">
                  <span class="text-gray-600">{{ $t('checkout.cost') }}:</span>
                  <span class="text-green-600">{{ selectedMethod.fee.toFixed(2) }} UAH</span>
                </div>
              </div>
            </div>

            <!-- Place Order Button -->
            <button
              @click="placeOrder"
              :disabled="!canPlaceOrder || isPlacingOrder"
              class="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{
                isPlacingOrder ? 'Оформлення...' :
                isValidatingInventory ? 'Перевірка наявності...' :
                !selectedMethod ? 'Оберіть спосіб доставки' :
                !isCustomerFormValid ? $t('checkout.fillAllFields') :
                cartSubtotal < MINIMUM_ORDER_AMOUNT ? `Мінімум ${MINIMUM_ORDER_AMOUNT} ₴` :
                hasInventoryIssues && canPlaceOrder ? 'Оформити доступні товари' :
                hasInventoryIssues && !canPlaceOrder ? 'Недостатньо товарів для замовлення' :
                'Оформити замовлення'
              }}
            </button>

            <router-link
              to="/cart"
              class="block w-full mt-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {{ $t('checkout.backToCart') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Last Chance Recommendations -->
      <div v-if="cartItems.length > 0 && isRecommendationsEnabled" class="mt-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">🛒 Last Chance to Add More!</h2>
            <p class="text-gray-600">Don't miss these great additions to your order</p>
          </div>
          <ProductRecommendations
            context="checkout"
            :max-recommendations="3"
            :show-reasons="true"
            :show-actions="true"
            :use-ai="true"
            @product-selected="navigateToProduct"
          />
        </div>
      </div>
    </div>

    <!-- Edit Delivery Method Modal -->
    <div v-if="showEditDeliveryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Edit Delivery Method</h3>
            <button
              @click="showEditDeliveryModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <DeliveryMethodSelector
            :show-back-button="false"
            context="modal"
            @method-selected="handleModalMethodSelected"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useNotificationStore } from '@/stores/notification'
import { capacitorService } from '@/services/capacitor'
import { ProductAvailabilityService } from '@/services/productAvailabilityService'
import wayforpayService from '@/services/wayforpayService'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import ProductRecommendations from '@/components/recommendations/ProductRecommendations.vue'
import UkrainianPhoneInput from '@/components/ui/UkrainianPhoneInput.vue'
import type { Branch, LocationData, Product } from '@/types'
import type { OrderFormData } from '@/stores/orders'

// Router
const router = useRouter()

// Stores
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const siteConfigStore = useSiteConfigStore()
const notificationStore = useNotificationStore()

// State
const selectedMethod = ref<{
  method: 'delivery' | 'pickup'
  location?: LocationData
  branch?: Branch
  fee: number
} | null>(null)

const customerForm = ref<OrderFormData>({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  delivery_method: 'pickup',
  delivery_address: '',
  pickup_branch: undefined,
  notes: '',
  no_callback_confirmation: true
})

const isPlacingOrder = ref(false)
const showEditDeliveryModal = ref(false)
const inventoryValidationResult = ref(null)
const isValidatingInventory = ref(false)

// Payment state
const paymentMethod = ref<'cash' | 'online'>('cash')

// Constants
const MINIMUM_ORDER_AMOUNT = 300

// Computed
const cartItems = computed(() => cartStore.items)

// Calculate subtotal based on available/adjusted quantities
const cartSubtotal = computed(() => {
  if (!inventoryValidationResult.value) {
    return cartStore.subtotal
  }

  let total = 0

  for (const item of cartItems.value) {
    const status = getItemInventoryStatus(item)

    if (status === 'unavailable') {
      // Don't include unavailable items in total
      continue
    } else if (status === 'adjusted') {
      // Use adjusted quantity
      const adjustedQty = getAdjustedQuantity(item)
      // Calculate price correctly for weight-based products
      if (item.custom_quantity && item.custom_unit) {
        const pricePerCustomUnit = item.price * item.custom_quantity
        total += pricePerCustomUnit * adjustedQty
      } else {
        total += item.price * adjustedQty
      }
    } else {
      // Use original quantity for available items
      // Calculate price correctly for weight-based products
      if (item.custom_quantity && item.custom_unit) {
        const pricePerCustomUnit = item.price * item.custom_quantity
        total += pricePerCustomUnit * item.quantity
      } else {
        total += item.price * item.quantity
      }
    }
  }

  return total
})

const deliveryFee = computed(() => selectedMethod.value?.fee || 0)
const orderTotal = computed(() => cartSubtotal.value + deliveryFee.value)

const isCustomerFormValid = computed(() => {
  const phone = customerForm.value.customer_phone
  const isPhoneValid = phone.startsWith('380') && phone.length === 12
  return customerForm.value.customer_name.trim() !== '' &&
         customerForm.value.customer_email.trim() !== '' &&
         customerForm.value.customer_phone.trim() !== '' &&
         isPhoneValid
})

const hasInventoryIssues = computed(() => {
  return inventoryValidationResult.value &&
    (inventoryValidationResult.value.hasUnavailableItems || inventoryValidationResult.value.hasAdjustedItems)
})

const isRecommendationsEnabled = computed(() => {
  return siteConfigStore.currentConfig.enable_recommendations !== false
})

const isOnlinePaymentEnabled = computed(() => {
  return siteConfigStore.currentConfig.enable_online_payment && wayforpayService.isEnabled()
})

const canPlaceOrder = computed(() => {
  const basicRequirements = selectedMethod.value !== null &&
    cartItems.value.length > 0 &&
    isCustomerFormValid.value &&
    !isValidatingInventory.value

  // If no inventory validation result yet, use basic requirements
  if (!inventoryValidationResult.value) {
    return basicRequirements && cartSubtotal.value >= MINIMUM_ORDER_AMOUNT
  }

  // Check if we have any orderable items (available + adjusted)
  const hasOrderableItems = inventoryValidationResult.value.availableItems.length > 0 ||
                           inventoryValidationResult.value.adjustedItems.length > 0

  // Calculate orderable total (available + adjusted values)
  const orderableTotal = inventoryValidationResult.value.totalAvailableValue +
                        inventoryValidationResult.value.totalAdjustedValue

  

  return basicRequirements && hasOrderableItems && orderableTotal >= MINIMUM_ORDER_AMOUNT
})

// Methods
const validateInventoryOnLoad = async () => {
  if (cartItems.value.length === 0) return

  // For delivery, use the branch from selectedMethod (nearest to delivery address)
  // For pickup, use the selected pickup branch
  // Only fall back to branchStore.selectedBranch if no method is selected yet
  let targetBranch = selectedMethod.value?.branch

  if (!targetBranch) {
    // If no method selected yet, try to get from branch store as fallback
    targetBranch = branchStore.selectedBranch
  }

  if (!targetBranch) {
    console.warn('⚠️ No target branch available for inventory validation')
    return
  }

  
  isValidatingInventory.value = true

  try {
    const result = await ProductAvailabilityService.checkProductAvailability(
      cartItems.value,
      targetBranch
    )

    inventoryValidationResult.value = result

    if (result.hasUnavailableItems || result.hasAdjustedItems) {
      
    } else {
      
    }
  } catch (error) {
    console.error('❌ Inventory validation failed on load:', error)
    inventoryValidationResult.value = null
  } finally {
    isValidatingInventory.value = false
  }
}

const getItemInventoryStatus = (item) => {
  if (!inventoryValidationResult.value) return 'unknown'

  // Try both id and product_id fields for matching
  const itemId = item.id || item.product_id

  const unavailable = inventoryValidationResult.value.unavailableItems.find(
    unavailableItem => (unavailableItem.id || unavailableItem.product_id) === itemId
  )
  if (unavailable) {
    
    return 'unavailable'
  }

  const adjusted = inventoryValidationResult.value.adjustedItems.find(
    adjustedItem => (adjustedItem.id || adjustedItem.product_id) === itemId
  )
  if (adjusted) {
    
    return 'adjusted'
  }

  
  return 'available'
}

const getAdjustedQuantity = (item) => {
  if (!inventoryValidationResult.value) return item.quantity

  // Try both id and product_id fields for matching
  const itemId = item.id || item.product_id

  const adjusted = inventoryValidationResult.value.adjustedItems.find(
    adjustedItem => (adjustedItem.id || adjustedItem.product_id) === itemId
  )

  const adjustedQty = adjusted ? adjusted.quantity : item.quantity
  return adjustedQty
}

// Helper function to calculate correct item total price
const calculateItemTotal = (item, quantity = null) => {
  const qty = quantity !== null ? quantity : item.quantity

  // Use the subtotal if available (calculated correctly in cart store)
  if (quantity === null && item.subtotal !== undefined) {
    return item.subtotal
  }

  // For weight-based products, calculate price per custom unit
  if (item.custom_quantity && item.custom_unit) {
    const pricePerCustomUnit = item.price * item.custom_quantity
    return pricePerCustomUnit * qty
  }

  // For regular products, use price as is
  return item.price * qty
}

// Helper function to format item quantity display
const formatItemQuantity = (item) => {
  if (item.custom_quantity && item.custom_unit) {
    // For weight-based products, show pieces with weight info
    const weightPerPiece = item.custom_quantity * 1000 // Convert kg to grams
    return `${item.quantity} шт. (${weightPerPiece}г кожна)`
  }

  // For regular products, always use "шт." instead of "p" or other units
  const unit = (item.unit === 'p' || item.unit === 'pcs') ? 'шт.' : (item.unit || 'шт.')
  return `${item.quantity} ${unit}`
}

const handleMethodSelected = (data: any) => {
  selectedMethod.value = data
  

  // Update customer form with delivery method details
  customerForm.value.delivery_method = data.method
  if (data.method === 'delivery') {
    customerForm.value.delivery_address = data.location?.address || ''
    customerForm.value.pickup_branch = undefined
  } else {
    customerForm.value.pickup_branch = data.branch
    customerForm.value.delivery_address = ''
  }

  // Update cart store to keep everything in sync
  cartStore.setDeliveryMethod(data.method)
  cartStore.setDeliveryFee(data.fee)

  // Update branch selection in stores
  if (data.branch) {
    cartStore.setBranch(data.branch.id)
    branchStore.selectBranch(data.branch)
  }

  // Update location store if delivery method
  if (data.method === 'delivery' && data.location) {
    locationStore.setLocation(data.location)
  }

  

  // Re-validate inventory with the new branch
  if (data.branch && cartItems.value.length > 0) {
    
    validateInventoryOnLoad()
  }

  // Show success feedback
  capacitorService.showToast({
    text: `${data.method === 'delivery' ? 'Доставка' : 'Самовивіз'} обрано`,
    duration: 'short',
    position: 'bottom'
  })
}

const handleModalMethodSelected = (data: any) => {
  // Handle method selection from modal
  handleMethodSelected(data)

  // Close the modal
  showEditDeliveryModal.value = false

  // Show success feedback
  capacitorService.showToast({
    text: 'Delivery method updated',
    duration: 'short',
    position: 'bottom'
  })
}

const goBack = () => {
  router.push('/cart')
}

const navigateToProduct = (product: Product) => {
  router.push(`/product/${product.id}`)
}

const placeOrder = async () => {
  if (!canPlaceOrder.value || isPlacingOrder.value) return

  isPlacingOrder.value = true

  try {
    // Get the target branch for inventory validation
    const targetBranch = selectedMethod.value?.branch || branchStore.selectedBranch

    if (!targetBranch) {
      await capacitorService.showToast({
        text: 'Помилка: не обрано магазин для замовлення.',
        duration: 'long',
        position: 'bottom'
      })
      return
    }

    // If we already have inventory issues detected, handle them automatically
    if (hasInventoryIssues.value && inventoryValidationResult.value) {
      

      // Show confirmation dialog
      const confirmed = await ProductAvailabilityService.handleInventoryConflicts(
        inventoryValidationResult.value,
        targetBranch
      )

      if (!confirmed) {
        await capacitorService.showToast({
          text: 'Замовлення скасовано. Перевірте кошик.',
          duration: 'long',
          position: 'bottom'
        })
        router.push('/cart')
        return
      }

      // Re-validate after cart changes
      await validateInventoryOnLoad()

      // If still have issues, stop
      if (hasInventoryIssues.value) {
        await capacitorService.showToast({
          text: 'Все ще є проблеми з наявністю. Перевірте кошик.',
          duration: 'long',
          position: 'bottom'
        })
        router.push('/cart')
        return
      }
    }

    

    // Convert cart items to order items format - use cart's correct calculations
    const orderItems = cartItems.value.map(item => {
      // Use the cart's already correct calculations
      const unitPrice = item.subtotal / item.quantity // This gives us the correct price per unit

      return {
        product_id: item.product_id,
        name: item.name,
        price: unitPrice, // Use calculated unit price from cart
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.image_url,
        custom_quantity: item.custom_quantity,
        custom_unit: item.custom_unit
      }
    })

    // Create the order
    const order = await ordersStore.createOrder(
      customerForm.value,
      orderItems,
      deliveryFee.value,
      paymentMethod.value // Pass payment method to order creation
    )

    // Handle payment method
    if (paymentMethod.value === 'online') {
      // Process online payment
      try {
        const paymentSuccess = await wayforpayService.processPayment(order, cartItems.value)

        if (paymentSuccess) {
          // Clear cart before redirecting to payment
          cartStore.clearCart()

          // Show message that user is being redirected
          await capacitorService.showToast({
            text: 'Перенаправлення на сторінку оплати...',
            duration: 'short',
            position: 'bottom'
          })

          // WayForPay service will handle the redirect
          return
        } else {
          throw new Error('Failed to initialize payment')
        }
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError)

        await capacitorService.showToast({
          text: 'Помилка при ініціалізації оплати. Спробуйте ще раз.',
          duration: 'long',
          position: 'bottom'
        })
        return
      }
    } else {
      // Cash payment - proceed normally
      // Show success message
      await capacitorService.showToast({
        text: 'Замовлення успішно оформлено!',
        duration: 'long',
        position: 'bottom'
      })

      // Show success notification
      notificationStore.success(
        'Замовлення створено!',
        'Підтвердження надіслано на вашу електронну пошту',
        { duration: 5000 }
      )

      // Clear cart and redirect to success page
      cartStore.clearCart()
      router.push(`/order-success/${order.id}`)
    }

  } catch (error) {
    console.error('Failed to place order:', error)

    await capacitorService.showToast({
      text: 'Помилка при оформленні замовлення. Спробуйте ще раз.',
      duration: 'long',
      position: 'bottom'
    })
  } finally {
    isPlacingOrder.value = false
  }
}

// Watch for cart changes to re-validate inventory
watch(
  () => cartStore.items.length,
  async (newLength, oldLength) => {
    // Only re-validate if items were added (not removed)
    if (newLength > oldLength && selectedMethod.value?.branch) {
      
      await validateInventoryOnLoad()
    }
  }
)

// Lifecycle
onMounted(async () => {
  // Check if cart has items
  if (cartItems.value.length === 0) {
    router.push('/cart')
    return
  }

  // Check if delivery method was pre-selected from cart page
  const route = router.currentRoute.value
  if (route.query.method && route.query.fee) {
    // Auto-populate delivery method from cart selection
    const method = route.query.method as 'delivery' | 'pickup'
    const fee = parseFloat(route.query.fee as string)

    // Get location and branch info from stores
    const location = locationStore.userLocation
    let targetBranch = branchStore.selectedBranch

    // For delivery, find the nearest branch to the delivery address
    if (method === 'delivery' && location) {
      await branchStore.fetchBranches() // Ensure branches are loaded
      const nearestBranch = branchStore.findNearestBranchByCoords(location.latitude, location.longitude)
      if (nearestBranch) {
        targetBranch = nearestBranch
        
      }
    }

    selectedMethod.value = {
      method,
      location: method === 'delivery' ? location : undefined,
      branch: targetBranch,
      fee
    }

    // Update customer form
    customerForm.value.delivery_method = method
    if (method === 'delivery' && location) {
      customerForm.value.delivery_address = location.address || ''
    } else if (method === 'pickup' && targetBranch) {
      customerForm.value.pickup_branch = targetBranch
    }

    
  } else {
    // Check if cart store has delivery method info
    if (cartStore.deliveryMethod && cartStore.deliveryFee) {
      const method = cartStore.deliveryMethod as 'delivery' | 'pickup'
      const fee = cartStore.deliveryFee
      const location = locationStore.userLocation
      let targetBranch = branchStore.selectedBranch

      // For delivery, find the nearest branch to the delivery address
      if (method === 'delivery' && location) {
        await branchStore.fetchBranches() // Ensure branches are loaded
        const nearestBranch = branchStore.findNearestBranchByCoords(location.latitude, location.longitude)
        if (nearestBranch) {
          targetBranch = nearestBranch
        }
      }

      selectedMethod.value = {
        method,
        location: method === 'delivery' ? location : undefined,
        branch: targetBranch,
        fee
      }

      // Update customer form
      customerForm.value.delivery_method = method
      if (method === 'delivery' && location) {
        customerForm.value.delivery_address = location.address || ''
      } else if (method === 'pickup' && selectedBranch) {
        customerForm.value.pickup_branch = selectedBranch
      }

      
    }
  }

  // Validate inventory after setup
  await validateInventoryOnLoad()
})

// Watch for cart changes and re-validate inventory
watch([cartItems, selectedMethod], async () => {
  if (cartItems.value.length > 0 && selectedMethod.value?.branch) {
    await validateInventoryOnLoad()
  }
}, { deep: true })
</script>

<style scoped>
/* Custom styles if needed */
</style>
