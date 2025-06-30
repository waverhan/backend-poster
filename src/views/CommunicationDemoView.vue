<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          🤖 AI Communication & Review System Demo
        </h1>
        <p class="text-lg text-gray-600">
          Test all the communication features: AI Chat, Reviews, Multi-channel Messaging
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- AI Chat Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            🤖 AI Chat Assistant
          </h2>
          <div class="space-y-4">
            <p class="text-gray-600">
              The AI chat widget is always available in the bottom-right corner. Try these commands:
            </p>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="command in chatCommands"
                :key="command"
                @click="testChatCommand(command)"
                class="text-left bg-blue-50 hover:bg-blue-100 text-blue-800 p-3 rounded-lg transition-colors"
              >
                "{{ command }}"
              </button>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-medium text-green-900 mb-2">✅ Features Working:</h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• Local command handling (no API needed)</li>
                <li>• Product recommendations</li>
                <li>• Cart information</li>
                <li>• Delivery information</li>
                <li>• Category browsing</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Review System Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            ⭐ Review System
          </h2>
          <div class="space-y-4">
            <p class="text-gray-600">
              Complete review system with post-order email requests:
            </p>
            <div class="space-y-3">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 class="font-medium text-blue-900">📝 Review Components</h4>
                <ul class="text-sm text-blue-700 mt-1">
                  <li>• ReviewForm.vue - Complete review submission</li>
                  <li>• ReviewList.vue - Display with filtering</li>
                  <li>• ReviewWidget.vue - Homepage widget</li>
                </ul>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 class="font-medium text-green-900">🔄 Automated Flow</h4>
                <ul class="text-sm text-green-700 mt-1">
                  <li>• Order completion → 24h delay → Review request</li>
                  <li>• Email + Telegram/Viber notifications</li>
                  <li>• Incentivized with 10% discount</li>
                  <li>• Follow-up reminders</li>
                </ul>
              </div>
              <router-link
                to="/review-order/demo"
                class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test Review Page
              </router-link>
            </div>
          </div>
        </div>

        <!-- Messaging Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            📱 Multi-Channel Messaging
          </h2>
          <div class="space-y-4">
            <p class="text-gray-600">
              Send notifications via multiple channels:
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div class="text-2xl mb-1">📧</div>
                <div class="text-sm font-medium text-blue-900">Email</div>
                <div class="text-xs text-blue-700">HTML Templates</div>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div class="text-2xl mb-1">📱</div>
                <div class="text-sm font-medium text-blue-900">Telegram</div>
                <div class="text-xs text-blue-700">Bot API</div>
              </div>
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <div class="text-2xl mb-1">💜</div>
                <div class="text-sm font-medium text-purple-900">Viber</div>
                <div class="text-xs text-purple-700">Rich Messages</div>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div class="text-2xl mb-1">💬</div>
                <div class="text-sm font-medium text-green-900">SMS</div>
                <div class="text-xs text-green-700">Fallback</div>
              </div>
            </div>
            <button
              @click="testMessaging"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Order Notification
            </button>
          </div>
        </div>

        <!-- Product Recommendations Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            🎯 AI Product Recommendations
          </h2>
          <div class="space-y-4">
            <p class="text-gray-600">
              Smart product suggestions based on context:
            </p>
            <div class="space-y-3">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 class="font-medium text-yellow-900">🧠 AI-Powered</h4>
                <ul class="text-sm text-yellow-700 mt-1">
                  <li>• OpenAI GPT-4 integration</li>
                  <li>• Context-aware suggestions</li>
                  <li>• Natural language reasoning</li>
                </ul>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 class="font-medium text-blue-900">🔧 Local ML</h4>
                <ul class="text-sm text-blue-700 mt-1">
                  <li>• Content-based filtering</li>
                  <li>• Association rules</li>
                  <li>• Privacy-focused</li>
                </ul>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <router-link
                  to="/cart"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cart Recommendations
                </router-link>
                <router-link
                  to="/shop"
                  class="bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Product Suggestions
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Implementation Status -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          🚀 Implementation Status
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="font-medium text-green-900 mb-3">✅ Frontend Complete</h3>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• AI Chat Widget</li>
              <li>• Review Components</li>
              <li>• Messaging Preferences</li>
              <li>• Product Recommendations</li>
              <li>• Communication Hub</li>
            </ul>
          </div>
          <div>
            <h3 class="font-medium text-yellow-900 mb-3">⚠️ Backend Needed</h3>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Review API endpoints</li>
              <li>• Email service integration</li>
              <li>• Telegram/Viber bots</li>
              <li>• Message scheduling</li>
              <li>• User preferences storage</li>
            </ul>
          </div>
          <div>
            <h3 class="font-medium text-blue-900 mb-3">🔧 Configuration</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• OpenAI API key</li>
              <li>• Telegram bot token</li>
              <li>• Viber bot token</li>
              <li>• SMTP settings</li>
              <li>• Webhook endpoints</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Expected Results -->
      <div class="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          📊 Expected Business Impact
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">15-25%</div>
            <div class="text-sm text-gray-600">Increase in AOV</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">5-8x</div>
            <div class="text-sm text-gray-600">More Reviews</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">80%</div>
            <div class="text-sm text-gray-600">Support Automation</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">60%+</div>
            <div class="text-sm text-gray-600">Message Open Rate</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { communicationHub } from '@/services/communicationHub'

// Demo data
const chatCommands = [
  'Популярні товари',
  'Показати категорії',
  'Інформація про доставку',
  'Кошик',
  'Допомога'
]

// Methods
const testChatCommand = (command: string) => {
  // This would trigger the chat widget to open and send the command
  
  alert(`Спробуйте написати "${command}" в чат-віджеті (синя кнопка внизу справа)`)
}

const testMessaging = async () => {
  // Demo order for testing
  const demoOrder = {
    id: 'demo-123',
    order_number: 'DEMO-001',
    customer_name: 'Тестовий Користувач',
    customer_email: 'test@example.com',
    total: 450.00,
    subtotal: 350.00,
    delivery_fee: 99.00,
    delivery_method: 'delivery',
    delivery_address: 'вул. Хрещатик, 1, Київ',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    items: [
      { name: 'Пиво Stella Artois', quantity: 2, price: 75 },
      { name: 'Сир Гауда', quantity: 1, price: 200 }
    ]
  } as any

  try {
    await communicationHub.orderCreated(demoOrder)
    alert('✅ Тестове повідомлення надіслано! Перевірте консоль для деталей.')
  } catch (error) {
    console.error('Messaging test failed:', error)
    alert('⚠️ Тест повідомлень потребує налаштування backend API')
  }
}
</script>
