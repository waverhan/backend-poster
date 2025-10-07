<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            Замовлення #{{ order.order_number }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ formatDate(order.created_at) }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Status and Total -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span
                :class="getStatusColor(order.status)"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ getStatusText(order.status) }}
              </span>
              <span class="text-sm text-gray-600">
                {{ order.fulfillment === 'delivery' ? 'Доставка' : 'Самовивіз' }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-gray-900">{{ order.total_amount.toFixed(2) }} ₴</p>
              <p class="text-sm text-gray-600">
                {{ order.payment_method === 'cash' ? 'Готівка' : 'Онлайн оплата' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Information -->
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Інформація про замовлення</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="order.delivery_address">
              <span class="text-gray-600">Адреса доставки:</span>
              <p class="font-medium mt-1">{{ order.delivery_address }}</p>
            </div>
            <div v-if="order.branch">
              <span class="text-gray-600">Магазин:</span>
              <p class="font-medium mt-1">{{ order.branch.name }}</p>
              <p class="text-gray-600 text-xs mt-1" v-if="order.branch.address">
                {{ order.branch.address }}
              </p>
            </div>
            <div v-if="order.notes">
              <span class="text-gray-600">Примітки:</span>
              <p class="font-medium mt-1">{{ order.notes }}</p>
            </div>
            <div v-if="order.poster_order_id">
              <span class="text-gray-600">ID в POS системі:</span>
              <p class="font-medium mt-1">{{ order.poster_order_id }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Товари ({{ order.items.length }})
          </h3>
          <div class="space-y-4">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <img
                v-if="item.image_url"
                :src="getImageUrl(item.image_url)"
                :alt="item.name"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900">{{ item.name }}</h4>
                <div class="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                  <span>Кількість: {{ item.quantity }}{{ item.unit || 'шт' }}</span>
                  <span v-if="item.custom_quantity">
                    ({{ item.custom_quantity }}{{ item.custom_unit }})
                  </span>
                  <span>Ціна: {{ item.unit_price.toFixed(2) }} ₴</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">
                  {{ item.total_price.toFixed(2) }} ₴
                </p>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Підсумок:</span>
                <span class="font-medium">{{ order.subtotal.toFixed(2) }} ₴</span>
              </div>
              <div v-if="order.delivery_fee > 0" class="flex justify-between">
                <span class="text-gray-600">Доставка:</span>
                <span class="font-medium">{{ order.delivery_fee.toFixed(2) }} ₴</span>
              </div>
              <div class="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Загалом:</span>
                <span>{{ order.total_amount.toFixed(2) }} ₴</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Закрити
        </button>
        <button
          @click="$emit('reorder', order)"
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Замовити знову
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps<{
  order: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  reorder: [order: any]
}>()

// Methods
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
</script>
