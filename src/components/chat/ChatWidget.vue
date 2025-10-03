<template>
  <!-- Chat Toggle Button -->
  <div class="fixed bottom-20 right-4 z-50 md:bottom-4">
    <!-- Chat Button -->
    <button
      v-if="!isOpen"
      @click="toggleChat"
      class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
    >
      <div class="relative">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <!-- Notification badge -->
        <div v-if="unreadCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ unreadCount }}
        </div>
      </div>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden mb-16 md:mb-0"
    >
      <!-- Header -->
      <div class="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 class="font-medium">AI Помічник</h3>
            <p class="text-xs text-blue-100">
              {{ isTyping ? 'Друкує...' : 'Онлайн' }}
            </p>
          </div>
        </div>
        <button
          @click="toggleChat"
          class="text-blue-100 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <!-- Welcome message -->
        <div v-if="messages.length === 0" class="text-center text-gray-500 text-sm">
          <div class="text-2xl mb-2">👋</div>
          <p>Привіт! Я ваш AI помічник.</p>
          <p>Чим можу допомогти?</p>
        </div>

        <!-- Messages -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs px-3 py-2 rounded-lg text-sm"
            :class="message.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'"
          >
            <p class="whitespace-pre-wrap">{{ message.content }}</p>

            <!-- Message metadata - Products -->
            <div v-if="message.metadata?.products && message.metadata.products.length > 0" class="mt-2 space-y-1">
              <div
                v-for="product in message.metadata.products.slice(0, 3)"
                :key="product.id"
                class="text-xs bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                @click="$emit('productSelected', product)"
              >
                <div class="font-medium">{{ product.display_name || product.name }}</div>
                <div class="text-blue-600">{{ product.price }} ₴</div>
              </div>
              <div v-if="message.metadata.products.length > 3" class="text-xs text-gray-500 text-center">
                +{{ message.metadata.products.length - 3 }} більше товарів
              </div>
            </div>

            <!-- Message metadata - Categories -->
            <div v-if="message.metadata?.categories && message.metadata.categories.length > 0" class="mt-2 space-y-1">
              <div
                v-for="category in message.metadata.categories"
                :key="category.name"
                class="text-xs bg-green-50 border border-green-200 text-green-800 p-2 rounded cursor-pointer hover:bg-green-100 transition-colors flex items-center gap-2"
                @click="navigateToCategory(category.name)"
              >
                <span class="text-base">{{ category.icon }}</span>
                <span class="font-medium">{{ category.name }}</span>
              </div>
            </div>

            <!-- Timestamp -->
            <div class="text-xs mt-1 opacity-70">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white text-gray-800 rounded-lg rounded-bl-none shadow-sm border border-gray-200 px-3 py-2">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Replies -->
      <div v-if="quickReplies.length > 0" class="px-4 py-2 border-t border-gray-200">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="reply in quickReplies"
            :key="reply"
            @click="sendQuickReply(reply)"
            class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
          >
            {{ reply }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-gray-200 bg-white">
        <div class="flex gap-2">
          <input
            v-model="inputMessage"
            @keypress.enter="sendMessage"
            :disabled="isTyping"
            placeholder="Напишіть повідомлення..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isTyping"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useLocationStore } from '@/stores/location'
import { useProductStore } from '@/stores/product'
import AIChatService from '@/services/aiChatService'
import type { ChatMessage, ChatContext } from '@/services/aiChatService'
import type { Product } from '@/types'

const emit = defineEmits<{
  productSelected: [product: Product]
}>()

// Services and stores
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const locationStore = useLocationStore()
const chatService = new AIChatService()

// State
const isOpen = ref(false)
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const unreadCount = ref(0)
const quickReplies = ref<string[]>([])
const messagesContainer = ref<HTMLElement>()

// Computed
const chatContext = computed((): Partial<ChatContext> => ({
  cart_items: cartStore.items,
  current_page: route.path,
  user_location: locationStore.userLocation?.address,
  order_history: ordersStore.orders
}))

// Methods
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // Add user message
  const userChatMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  }
  messages.value.push(userChatMessage)

  // Show typing indicator
  isTyping.value = true
  scrollToBottom()

  try {
    // Check if this is a simple command we can handle locally
    const localResponse = await handleLocalCommands(userMessage)
    if (localResponse) {
      messages.value.push(localResponse)
      isTyping.value = false
      scrollToBottom()
      return
    }

    // Get AI response
    const aiResponse = await chatService.sendMessage(userMessage, chatContext.value)

    // Add AI message
    messages.value.push(aiResponse)

    // Update quick replies
    const intent = await extractIntent(userMessage)
    quickReplies.value = chatService.getQuickReplies(intent)

    // Handle actions
    if (aiResponse.metadata?.action) {
      await handleAction(aiResponse.metadata.action, aiResponse.metadata)
    }

  } catch (error) {
    console.error('Chat error:', error)

    // Try fallback response
    const fallbackResponse = await getFallbackResponse(userMessage)
    messages.value.push(fallbackResponse)
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const sendQuickReply = (reply: string) => {
  inputMessage.value = reply
  sendMessage()
}

const navigateToCategory = (categoryName: string) => {
  // Navigate to shop with category filter
  router.push({ path: '/shop', query: { category: categoryName } })
  // Close chat
  isOpen.value = false
}

const handleAction = async (action: string, metadata: any) => {
  switch (action) {
    case 'search_products':
      // Trigger product search
      
      break
    case 'check_order_status':
      // Navigate to orders page
      if (metadata.order_number) {
        // Find and show specific order
      }
      break
    case 'show_delivery_info':
      // Show delivery information
      break
    case 'recommend_products':
      // Show product recommendations
      if (metadata.products) {
        emit('productSelected', metadata.products[0])
      }
      break
    case 'escalate_to_human':
      // Connect to human support
      addSystemMessage('Зараз з\'єднаю вас з оператором...')
      break
  }
}

const addSystemMessage = (content: string) => {
  messages.value.push({
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: new Date()
  })
  scrollToBottom()
}

const extractIntent = async (message: string): Promise<string> => {
  // Simple intent extraction for quick replies
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('товар') || lowerMessage.includes('продукт')) {
    return 'product_search'
  }
  if (lowerMessage.includes('замовлення') || lowerMessage.includes('статус')) {
    return 'order_status'
  }
  if (lowerMessage.includes('доставка')) {
    return 'delivery_info'
  }

  return 'general'
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle simple commands locally
const handleLocalCommands = async (message: string): Promise<ChatMessage | null> => {
  const lowerMessage = message.toLowerCase()

  // Popular products command
  if (lowerMessage.includes('популярні товари') || lowerMessage.includes('показати популярні')) {
    const products = await getPopularProducts()
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: products.length > 0
        ? `Ось наші популярні товари:`
        : 'На жаль, зараз немає доступних товарів.',
      timestamp: new Date(),
      metadata: { products }
    }
  }

  // Categories command
  if (lowerMessage.includes('категорії') || lowerMessage.includes('показати категорії')) {
    const categories = await getCategories()
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: categories.length > 0
        ? `Ось наші категорії товарів:`
        : 'На жаль, зараз немає доступних категорій.',
      timestamp: new Date(),
      metadata: { categories }
    }
  }

  // Cart info
  if (lowerMessage.includes('кошик') || lowerMessage.includes('корзина')) {
    const cartItems = cartStore.items
    if (cartItems.length === 0) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Ваш кошик порожній. Хочете подивитися на популярні товари?',
        timestamp: new Date()
      }
    } else {
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `У вашому кошику ${cartItems.length} товар(ів) на суму ${total.toFixed(2)} UAH:\n\n${cartItems.map(item => `• ${item.name} × ${item.quantity}`).join('\n')}`,
        timestamp: new Date()
      }
    }
  }

  return null
}

// Get popular products from store (randomized)
const getPopularProducts = async (): Promise<Product[]> => {
  try {
    const productStore = useProductStore()
    if (productStore.products.length === 0) {
      await productStore.fetchProducts()
    }

    const availableProducts = productStore.products.filter(p => p.available)

    // Shuffle array and take first 4
    const shuffled = [...availableProducts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  } catch (error) {
    console.error('Failed to get popular products:', error)
    return []
  }
}

// Get categories from store
const getCategories = async (): Promise<Array<{name: string, icon: string}>> => {
  try {
    const productStore = useProductStore()
    if (productStore.products.length === 0) {
      await productStore.fetchProducts()
    }

    // Get unique categories
    const categoryMap = new Map<string, string>()
    productStore.products.forEach(p => {
      if (p.category_name && !categoryMap.has(p.category_name)) {
        // Assign icons based on category name
        let icon = '📦'
        const catLower = p.category_name.toLowerCase()
        if (catLower.includes('напо') || catLower.includes('пиво')) icon = '🍺'
        else if (catLower.includes('м\'ясо') || catLower.includes('ковбас')) icon = '🍖'
        else if (catLower.includes('сир')) icon = '🧀'
        else if (catLower.includes('хліб')) icon = '🍞'
        else if (catLower.includes('десерт') || catLower.includes('солод')) icon = '🍰'
        else if (catLower.includes('кава')) icon = '☕'
        else if (catLower.includes('закус') || catLower.includes('снек')) icon = '🥨'
        else if (catLower.includes('вино')) icon = '🍷'
        else if (catLower.includes('сидр')) icon = '🍎'

        categoryMap.set(p.category_name, icon)
      }
    })

    return Array.from(categoryMap.entries()).map(([name, icon]) => ({ name, icon }))
  } catch (error) {
    console.error('Failed to get categories:', error)
    return []
  }
}

// Fallback response when AI fails
const getFallbackResponse = async (message: string): Promise<ChatMessage> => {
  const lowerMessage = message.toLowerCase()

  let content = 'Вибачте, я не зовсім зрозумів ваше питання. 🤔'
  let products: Product[] = []

  // Try to help based on keywords
  if (lowerMessage.includes('товар') || lowerMessage.includes('продукт')) {
    content = 'Ось наші популярні товари:'
    products = await getPopularProducts()
  } else if (lowerMessage.includes('допомога') || lowerMessage.includes('help')) {
    content = `Я можу допомогти вам з:

🛒 Пошуком товарів
📋 Перевіркою замовлень
🚚 Інформацією про доставку
💬 Відповідями на питання

Просто напишіть, що вас цікавить!`
  } else if (lowerMessage.includes('доставка')) {
    content = `📦 Інформація про доставку:

🚚 Доставка по Києву:
   • В межах 2 км: 99 ₴
   • Кожен додатковий км: +30 ₴

🏪 Самовивіз: безкоштовно

⏰ Час доставки: 1-2 години

📍 Зона доставки: весь Київ

💰 Мінімальна сума замовлення: 300 ₴`
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    metadata: { products, confidence: 0.5 }
  }
}

// Watchers
watch(() => cartStore.items, () => {
  chatService.updateContext(chatContext.value)
}, { deep: true })

watch(() => route.path, () => {
  chatService.updateContext(chatContext.value)
})

// Lifecycle
onMounted(() => {
  // Initialize chat context
  chatService.updateContext(chatContext.value)

  // Set initial quick replies
  quickReplies.value = chatService.getQuickReplies('greeting')

  // Add welcome message after a short delay
  setTimeout(async () => {
    if (messages.value.length === 0) {
      // Show welcome message with popular products
      const products = await getPopularProducts()
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Привіт! 👋 Я ваш AI помічник. Можу допомогти знайти товари, перевірити замовлення або відповісти на питання про доставку.\n\nОсь наші популярні товари:',
        timestamp: new Date(),
        metadata: { products }
      }
      messages.value.push(welcomeMessage)
      scrollToBottom()
    }
  }, 1000)
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for bounce */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}
</style>
