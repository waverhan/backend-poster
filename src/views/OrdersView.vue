<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Історія замовлень</h1>
        <p class="text-gray-600">Переглядайте ваші замовлення та їх статус</p>
      </div>

      <!-- Orders List -->
      <div v-if="orders.length > 0" class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <!-- Order Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Замовлення №{{ order.order_number }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ formatDate(order.created_at) }}
              </p>
            </div>
            <div class="mt-2 sm:mt-0">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusColor(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- Order Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <!-- Delivery Info -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Спосіб отримання</h4>
              <div class="text-sm text-gray-600">
                <div class="flex items-center mb-1">
                  <span class="mr-2">
                    {{ order.delivery_method === 'delivery' ? '🚚' : '🏪' }}
                  </span>
                  {{ order.delivery_method === 'delivery' ? 'Доставка' : 'Самовивіз' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ order.delivery_method === 'delivery'
                      ? order.delivery_address
                      : order.pickup_branch?.name }}
                </div>
              </div>
            </div>

            <!-- Order Total -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Сума замовлення</h4>
              <div class="text-lg font-semibold text-gray-900">
                {{ order.total.toFixed(2) }} ₴
              </div>
              <div class="text-xs text-gray-500">
                {{ order.items.length }} {{ getItemsText(order.items.length) }}
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="border-t border-gray-200 pt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Товари</h4>
            <div class="space-y-2">
              <div
                v-for="item in order.items"
                :key="item.product_id"
                class="flex justify-between items-center text-sm"
              >
                <div class="flex-1">
                  <span class="text-gray-900">{{ item.name }}</span>
                  <span class="text-gray-500 ml-2">× {{ item.quantity }}</span>
                </div>
                <span class="text-gray-900 font-medium">
                  {{ (item.quantity * item.price).toFixed(2) }} ₴
                </span>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link
                :to="`/order-success/${order.id}`"
                class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Переглянути деталі
              </router-link>
              <button
                v-if="order.status === 'pending'"
                @click="cancelOrder(order.id)"
                class="flex-1 text-center bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Скасувати замовлення
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📋</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Поки що немає замовлень</h2>
        <p class="text-gray-600 mb-8">Коли ви зробите замовлення, воно з'явиться тут</p>
        <router-link
          to="/shop"
          class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Почати покупки
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import type { Order } from '@/stores/orders'

// Stores
const ordersStore = useOrdersStore()

// Computed
const orders = computed(() => ordersStore.orders)

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

const getStatusColor = (status: Order['status']): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: Order['status']): string => {
  const texts = {
    pending: 'Обробляється',
    confirmed: 'Підтверджено',
    preparing: 'Готується',
    ready: 'Готово до видачі',
    delivered: 'Доставлено',
    cancelled: 'Скасовано'
  }
  return texts[status] || status
}

const getItemsText = (count: number): string => {
  if (count === 1) return 'товар'
  if (count >= 2 && count <= 4) return 'товари'
  return 'товарів'
}

const cancelOrder = async (orderId: string) => {
  if (confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
    try {
      await ordersStore.updateOrderStatus(orderId, 'cancelled')
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('Помилка при скасуванні замовлення. Спробуйте ще раз.')
    }
  }
}

// Page meta
document.title = 'Історія замовлень - PWA Shop'
</script>
