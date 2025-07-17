<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Success Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('order.confirmation') }}</h1>
        <p class="text-gray-600">{{ $t('order.thankYou') }} {{ $t('order.emailSent') }}</p>
      </div>

      <!-- Order Details Card -->
      <div v-if="order" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ $t('order.orderDetails') }}</h2>
          <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
            {{ $t(`order.statuses.${order.status}`) || order.status }}
          </span>
        </div>

        <!-- Order Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Номер замовлення</h3>
            <p class="text-lg font-mono text-gray-700">{{ order.order_number }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Дата замовлення</h3>
            <p class="text-gray-700">{{ formatDate(order.created_at) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Спосіб отримання</h3>
            <p class="text-gray-700 capitalize">
              {{ order.delivery_method === 'delivery' ? '🚚 Доставка' : '🏪 Самовивіз' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Орієнтовний час</h3>
            <p class="text-gray-700">{{ formatEstimatedTime(order.estimated_delivery) }}</p>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">
            {{ order.delivery_method === 'delivery' ? 'Адреса доставки' : 'Місце самовивозу' }}
          </h3>
          <p class="text-gray-700">
            {{ order.delivery_method === 'delivery' 
                ? order.delivery_address 
                : order.pickup_branch?.name || 'Не вказано' }}
          </p>
        </div>

        <!-- Order Items -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Товари в замовленні</h3>
          <div class="space-y-3">
            <div 
              v-for="item in order.items" 
              :key="item.product_id"
              class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">{{ item.name }}</h4>
                <p class="text-xs text-gray-600">
                  <template v-if="item.custom_quantity && item.custom_unit">
                    {{ item.quantity }} шт. ({{ (item.custom_quantity * 1000).toFixed(0) }}г кожна) × {{ item.price.toFixed(2) }} ₴
                  </template>
                  <template v-else>
                    {{ item.quantity }} × {{ item.price.toFixed(2) }} ₴
                  </template>
                </p>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{ (item.quantity * item.price).toFixed(2) }} ₴
              </span>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="border-t border-gray-200 pt-4">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Сума товарів:</span>
              <span>{{ order.subtotal.toFixed(2) }} ₴</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Доставка:</span>
              <span>{{ order.delivery_fee.toFixed(2) }} ₴</span>
            </div>
            <div class="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Загальна сума:</span>
              <span>{{ order.total.toFixed(2) }} ₴</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Що далі?</h3>
        <div class="space-y-2 text-sm text-gray-700">
          <div class="flex items-start">
            <span class="text-blue-600 mr-2">📧</span>
            <span>Ми надіслали підтвердження замовлення на вашу електронну пошту</span>
          </div>
          <div class="flex items-start">
            <span class="text-blue-600 mr-2">📞</span>
            <span>Наш менеджер зв'яжеться з вами для підтвердження деталей</span>
          </div>
          <div class="flex items-start">
            <span class="text-blue-600 mr-2">🚚</span>
            <span>
              {{ order?.delivery_method === 'delivery' 
                  ? 'Ми доставимо замовлення за вказаною адресою' 
                  : 'Ви можете забрати замовлення в обраному магазині' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <router-link 
          to="/orders" 
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
        >
          Переглянути всі замовлення
        </router-link>
        <router-link 
          to="/" 
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg text-center transition-colors"
        >
          Продовжити покупки
        </router-link>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import type { Order } from '@/stores/orders'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const ordersStore = useOrdersStore()

// State
const order = ref<Order | null>(null)

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatEstimatedTime = (dateString?: string): string => {
  if (!dateString) return 'Не вказано'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  const orderId = route.params.id as string
  
  if (orderId) {
    order.value = ordersStore.getOrder(orderId)
    
    if (!order.value) {
      // If order not found, redirect to orders page
      router.push('/orders')
    }
  } else {
    // If no order ID, try to get the current order
    order.value = ordersStore.currentOrder
    
    if (!order.value) {
      router.push('/orders')
    }
  }
})

// Page meta
document.title = 'Замовлення оформлено - PWA Shop'
</script>
