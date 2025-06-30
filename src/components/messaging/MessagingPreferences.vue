<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      Налаштування повідомлень
    </h3>

    <form @submit.prevent="savePreferences" class="space-y-6">
      <!-- Contact Information -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Контактна інформація</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="contactInfo.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Телефон
            </label>
            <input
              v-model="contactInfo.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+380XXXXXXXXX"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Telegram ID
            </label>
            <div class="flex">
              <span class="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                @
              </span>
              <input
                v-model="contactInfo.telegram"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Viber номер
            </label>
            <input
              v-model="contactInfo.viber"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+380XXXXXXXXX"
            />
          </div>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Налаштування сповіщень</h4>
        
        <div class="space-y-4">
          <!-- Order Confirmation -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Підтвердження замовлення</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="channel in availableChannels"
                :key="`confirmation_${channel.type}`"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="preferences.order_confirmation"
                  :value="channel.type"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 flex items-center gap-1">
                  {{ channel.icon }} {{ channel.label }}
                </span>
              </label>
            </div>
          </div>

          <!-- Order Status Updates -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Оновлення статусу замовлення</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="channel in availableChannels"
                :key="`status_${channel.type}`"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="preferences.order_status_updates"
                  :value="channel.type"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 flex items-center gap-1">
                  {{ channel.icon }} {{ channel.label }}
                </span>
              </label>
            </div>
          </div>

          <!-- Delivery Notifications -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Сповіщення про доставку</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="channel in availableChannels"
                :key="`delivery_${channel.type}`"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="preferences.delivery_notifications"
                  :value="channel.type"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 flex items-center gap-1">
                  {{ channel.icon }} {{ channel.label }}
                </span>
              </label>
            </div>
          </div>

          <!-- Review Requests -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Запити на відгуки</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="channel in availableChannels"
                :key="`review_${channel.type}`"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="preferences.review_requests"
                  :value="channel.type"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 flex items-center gap-1">
                  {{ channel.icon }} {{ channel.label }}
                </span>
              </label>
            </div>
          </div>

          <!-- Promotional Messages -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Рекламні повідомлення</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="channel in availableChannels"
                :key="`promo_${channel.type}`"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="preferences.promotional_messages"
                  :value="channel.type"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 flex items-center gap-1">
                  {{ channel.icon }} {{ channel.label }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferred Channel -->
      <div>
        <h4 class="font-medium text-gray-900 mb-3">Основний канал зв'язку</h4>
        <select
          v-model="preferences.preferred_channel"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Оберіть основний канал</option>
          <option
            v-for="channel in availableChannels"
            :key="channel.type"
            :value="channel.type"
          >
            {{ channel.icon }} {{ channel.label }}
          </option>
        </select>
      </div>

      <!-- Quick Setup -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-900 mb-3">Швидке налаштування</h4>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            @click="setQuickPreference('all')"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
          >
            Всі канали
          </button>
          <button
            type="button"
            @click="setQuickPreference('essential')"
            class="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
          >
            Тільки важливі
          </button>
          <button
            type="button"
            @click="setQuickPreference('minimal')"
            class="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
          >
            Мінімум
          </button>
          <button
            type="button"
            @click="setQuickPreference('none')"
            class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
          >
            Відключити всі
          </button>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isSaving"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          {{ isSaving ? 'Збереження...' : 'Зберегти налаштування' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import messagingService from '@/services/messagingService'
import type { NotificationPreferences } from '@/services/messagingService'

// State
const contactInfo = ref({
  email: '',
  phone: '',
  telegram: '',
  viber: ''
})

const preferences = ref<NotificationPreferences & { preferred_channel: string }>({
  order_confirmation: ['email'],
  order_status_updates: ['telegram'],
  delivery_notifications: ['telegram'],
  review_requests: ['email'],
  promotional_messages: [],
  preferred_channel: 'telegram'
})

const isSaving = ref(false)

const availableChannels = [
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'telegram', label: 'Telegram', icon: '📱' },
  { type: 'viber', label: 'Viber', icon: '💜' },
  { type: 'sms', label: 'SMS', icon: '💬' }
]

// Methods
const savePreferences = async () => {
  isSaving.value = true
  
  try {
    // Save contact info
    await fetch('/api/users/contact-info', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactInfo.value)
    })

    // Save messaging preferences
    await messagingService.updateUserPreferences('current_user', preferences.value)
    
    
    
    // Show success message
    alert('Налаштування збережено успішно!')
    
  } catch (error) {
    console.error('❌ Failed to save preferences:', error)
    alert('Помилка збереження налаштувань. Спробуйте ще раз.')
  } finally {
    isSaving.value = false
  }
}

const setQuickPreference = (type: string) => {
  const allChannels = ['email', 'telegram', 'viber']
  
  switch (type) {
    case 'all':
      preferences.value.order_confirmation = [...allChannels]
      preferences.value.order_status_updates = [...allChannels]
      preferences.value.delivery_notifications = [...allChannels]
      preferences.value.review_requests = [...allChannels]
      preferences.value.promotional_messages = [...allChannels]
      break
      
    case 'essential':
      preferences.value.order_confirmation = ['email', 'telegram']
      preferences.value.order_status_updates = ['telegram']
      preferences.value.delivery_notifications = ['telegram']
      preferences.value.review_requests = ['email']
      preferences.value.promotional_messages = []
      break
      
    case 'minimal':
      preferences.value.order_confirmation = ['email']
      preferences.value.order_status_updates = ['email']
      preferences.value.delivery_notifications = ['email']
      preferences.value.review_requests = ['email']
      preferences.value.promotional_messages = []
      break
      
    case 'none':
      preferences.value.order_confirmation = []
      preferences.value.order_status_updates = []
      preferences.value.delivery_notifications = []
      preferences.value.review_requests = []
      preferences.value.promotional_messages = []
      break
  }
}

const loadPreferences = async () => {
  try {
    // Load contact info
    const contactResponse = await fetch('/api/users/contact-info')
    if (contactResponse.ok) {
      const contactData = await contactResponse.json()
      contactInfo.value = { ...contactInfo.value, ...contactData }
    }

    // Load messaging preferences
    const messagingPrefs = await messagingService.getUserPreferences('current_user')
    preferences.value = { ...preferences.value, ...messagingPrefs }
    
  } catch (error) {
    console.error('Failed to load preferences:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadPreferences()
})
</script>
