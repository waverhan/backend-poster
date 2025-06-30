<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Messaging Configuration</h1>

      <!-- Viber Configuration -->
      <div class="card p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📱 Viber Bot Configuration
        </h2>

        <!-- Status -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-medium">Status:</span>
            <span v-if="viberStatus.configured" class="text-green-600 font-medium">
              ✅ Configured
            </span>
            <span v-else class="text-red-600 font-medium">
              ❌ Not Configured
            </span>
          </div>
          <p class="text-sm text-gray-600">{{ viberStatus.message }}</p>
        </div>

        <!-- Test Message Form -->
        <div v-if="viberStatus.configured" class="border-t pt-4">
          <h3 class="font-medium mb-3">Test Viber Message</h3>
          <form @submit.prevent="sendTestMessage" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Phone Number</label>
              <input
                v-model="testMessage.phone"
                type="tel"
                placeholder="+380971234567"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Enter phone number in international format (e.g., +380971234567)
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Message</label>
              <textarea
                v-model="testMessage.message"
                rows="4"
                placeholder="Test message..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary"
            >
              <span v-if="isLoading">Sending...</span>
              <span v-else>Send Test Message</span>
            </button>
          </form>
        </div>

        <!-- Configuration Instructions -->
        <div v-else class="border-t pt-4">
          <h3 class="font-medium mb-3">Setup Instructions</h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Create a Viber bot at <a href="https://partners.viber.com" target="_blank" class="text-blue-600 hover:underline">https://partners.viber.com</a></li>
            <li>Get your bot authentication token</li>
            <li>Add the token to your server environment variables as <code class="bg-gray-100 px-1 rounded">VIBER_BOT_TOKEN</code></li>
            <li>Restart the server</li>
          </ol>
        </div>
      </div>

      <!-- Order Notifications -->
      <div class="card p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📦 Order Notifications
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-medium">Automatic Order Confirmations</h3>
              <p class="text-sm text-gray-600">Send Viber messages when orders are placed</p>
            </div>
            <span class="text-green-600 font-medium">✅ Enabled</span>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-medium">Status Update Notifications</h3>
              <p class="text-sm text-gray-600">Send Viber messages when order status changes</p>
            </div>
            <span class="text-green-600 font-medium">✅ Enabled</span>
          </div>
        </div>
      </div>

      <!-- Recent Messages Log -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          📋 Message Log
        </h2>
        
        <div v-if="messageLog.length === 0" class="text-center py-8 text-gray-500">
          No messages sent yet
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="(message, index) in messageLog"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ message.type }}</div>
              <div class="text-sm text-gray-600">{{ message.recipient }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm">{{ message.timestamp }}</div>
              <div class="text-xs" :class="message.success ? 'text-green-600' : 'text-red-600'">
                {{ message.success ? 'Sent' : 'Failed' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// Reactive data
const viberStatus = ref({
  configured: false,
  message: 'Checking configuration...'
})

const testMessage = ref({
  phone: '',
  message: 'Привіт! Це тестове повідомлення з вашого Viber бота. 🤖'
})

const isLoading = ref(false)
const messageLog = ref([])

// Methods
const checkViberStatus = async () => {
  try {
    const response = await fetch('/api/messaging/viber/status')
    const data = await response.json()
    viberStatus.value = data
  } catch (error) {
    console.error('Failed to check Viber status:', error)
    viberStatus.value = {
      configured: false,
      message: 'Failed to check configuration'
    }
  }
}

const sendTestMessage = async () => {
  isLoading.value = true
  
  try {
    const response = await fetch('/api/messaging/viber/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: testMessage.value.phone.replace(/[\s\+\-\(\)]/g, ''),
        message: testMessage.value.message
      })
    })

    const data = await response.json()

    if (data.success) {
      notificationStore.add({
        type: 'success',
        title: 'Test message sent!',
        message: 'Viber test message was sent successfully',
        duration: 5000
      })

      // Add to message log
      messageLog.value.unshift({
        type: 'Test Message',
        recipient: testMessage.value.phone,
        timestamp: new Date().toLocaleString(),
        success: true
      })

      // Clear form
      testMessage.value.phone = ''
      testMessage.value.message = 'Привіт! Це тестове повідомлення з вашого Viber бота. 🤖'

    } else {
      notificationStore.add({
        type: 'error',
        title: 'Failed to send message',
        message: data.error || 'Unknown error occurred',
        duration: 5000
      })

      // Add to message log
      messageLog.value.unshift({
        type: 'Test Message',
        recipient: testMessage.value.phone,
        timestamp: new Date().toLocaleString(),
        success: false
      })
    }

  } catch (error) {
    console.error('Error sending test message:', error)
    notificationStore.add({
      type: 'error',
      title: 'Network error',
      message: 'Failed to send test message due to network error',
      duration: 5000
    })
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  checkViberStatus()
})
</script>
