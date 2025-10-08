<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Історія замовлень</h1>
        <p class="mt-2 text-gray-600">Переглядайте свої попередні замовлення та замовляйте знову</p>
      </div>

      <!-- Login Required -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Увійдіть до свого акаунту</h2>
        <p class="text-gray-600 mb-6">Щоб переглянути історію замовлень, потрібно увійти до системи</p>
        <button
          @click="showLoginModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Увійти
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="bg-white rounded-lg shadow-sm p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="space-y-3">
            <div class="h-20 bg-gray-200 rounded"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Помилка завантаження</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="fetchOrders"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Спробувати знову
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Поки що немає замовлень</h2>
        <p class="text-gray-600 mb-6">Коли ви зробите своє перше замовлення, воно з'явиться тут</p>
        <router-link
          to="/shop"
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Почати покупки
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <!-- Order Header -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Замовлення #{{ order.order_number }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="text-right">
                <div class="flex items-center space-x-2">
                  <span
                    :class="getStatusColor(order.status)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <p class="text-lg font-semibold text-gray-900 mt-1">
                  {{ order.total_amount.toFixed(2) }} ₴
                </p>
              </div>
            </div>
          </div>

          <!-- Order Details -->
          <div class="p-6">
            <!-- Items Preview -->
            <div class="mb-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Товари ({{ order.items.length }})</h4>
              <div class="space-y-2">
                <div
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.id"
                  class="flex items-center space-x-3"
                >
                  <img
                    v-if="item.image_url"
                    :src="getImageUrl(item.image_url)"
                    :alt="item.name"
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">
                      {{ item.quantity }}{{ item.unit || 'шт' }} × {{ item.unit_price.toFixed(2) }} ₴
                    </p>
                  </div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.total_price.toFixed(2) }} ₴
                  </p>
                </div>
                <div v-if="order.items.length > 3" class="text-xs text-gray-500 pl-13">
                  і ще {{ order.items.length - 3 }} товар(ів)...
                </div>
              </div>
            </div>

            <!-- Order Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span class="text-gray-600">Спосіб доставки:</span>
                <span class="ml-2 font-medium">
                  {{ order.fulfillment === 'delivery' ? 'Доставка' : 'Самовивіз' }}
                </span>
              </div>
              <div v-if="order.delivery_address">
                <span class="text-gray-600">Адреса:</span>
                <span class="ml-2 font-medium">{{ order.delivery_address }}</span>
              </div>
              <div v-if="order.branch">
                <span class="text-gray-600">Магазин:</span>
                <span class="ml-2 font-medium">{{ order.branch.name }}</span>
              </div>
              <div>
                <span class="text-gray-600">Оплата:</span>
                <span class="ml-2 font-medium">
                  {{ order.payment_method === 'cash' ? 'Готівка' : 'Онлайн' }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                @click="viewOrderDetails(order)"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Детальніше
              </button>
              <button
                @click="reorderItems(order)"
                :disabled="reorderingOrderId === order.id"
                class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                style="min-width: 120px; display: block !important;"
              >
                {{ reorderingOrderId === order.id ? 'Додавання...' : 'Замовити знову' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <PhoneLoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @success="onLoginSuccess"
    />

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @reorder="reorderItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import PhoneLoginModal from '@/components/auth/PhoneLoginModal.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// State
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const showLoginModal = ref(false)
const selectedOrder = ref(null)
const reorderingOrderId = ref(null)

// Methods
const fetchOrders = async () => {
  if (!authStore.isAuthenticated) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/orders`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const data = await response.json()
    orders.value = data.orders || []

    // Debug log for reorder button investigation
    console.log('📋 Orders loaded:', orders.value.length, 'orders')
    if (orders.value.length > 0) {
      console.log('📋 First order sample:', orders.value[0])
    }
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = 'Не вдалося завантажити історію замовлень'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: 'Очікує',
    confirmed: 'Підтверджено',
    preparing: 'Готується',
    ready: 'Готово',
    delivered: 'Доставлено',
    cancelled: 'Скасовано'
  }
  return texts[status] || status
}

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '/placeholder-product.jpg'
  if (imageUrl.startsWith('http')) return imageUrl
  return `${import.meta.env.VITE_BACKEND_URL}${imageUrl}`
}

const viewOrderDetails = (order: any) => {
  selectedOrder.value = order
}

const reorderItems = async (order: any) => {
  if (!authStore.isAuthenticated) {
    showLoginModal.value = true
    return
  }

  reorderingOrderId.value = order.id

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/orders/${order.id}/reorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to process reorder')
    }

    const data = await response.json()
    
    // Add available items to cart
    for (const item of data.reorder_items) {
      const cartItem = {
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        unit: item.unit,
        custom_quantity: item.custom_quantity,
        custom_unit: item.custom_unit,
        is_draft_beverage: item.is_draft_beverage,
        is_bottle_product: item.is_bottle_product
      }
      cartStore.addItem(cartItem)
    }

    // Show success message
    let message = `Додано ${data.reorder_items.length} товар(ів) до кошика`
    if (data.unavailable_items.length > 0) {
      message += `. ${data.unavailable_items.length} товар(ів) недоступні`
    }

    notificationStore.success('Товари додано!', message)
    
    // Redirect to cart
    router.push('/cart')

  } catch (err) {
    console.error('Error reordering:', err)
    notificationStore.error('Помилка', 'Не вдалося додати товари до кошика')
  } finally {
    reorderingOrderId.value = null
  }
}

const onLoginSuccess = () => {
  showLoginModal.value = false
  fetchOrders()
}

// Lifecycle
onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchOrders()
  }
})
</script>
