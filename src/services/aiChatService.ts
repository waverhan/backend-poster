import type { Product } from '@/types'
import type { Order } from '@/stores/orders'
import { useProductStore } from '@/stores/product'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    products?: Product[]
    order?: Order
    action?: string
    confidence?: number
  }
}

export interface ChatContext {
  user_id?: string
  session_id: string
  cart_items: any[]
  current_page: string
  user_location?: string
  order_history: Order[]
  preferences: {
    language: 'uk' | 'en'
    communication_style: 'formal' | 'casual'
  }
}

export interface ChatIntent {
  intent: string
  confidence: number
  entities: Record<string, any>
  suggested_actions: string[]
}

class AIChatService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1/chat/completions'
  private context: ChatContext
  private conversationHistory: ChatMessage[] = []
  private productStore: any

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.productStore = useProductStore()
    this.context = {
      session_id: this.generateSessionId(),
      cart_items: [],
      current_page: '/',
      order_history: [],
      preferences: {
        language: 'uk',
        communication_style: 'casual'
      }
    }
  }

  // Main chat method
  async sendMessage(userMessage: string, context?: Partial<ChatContext>): Promise<ChatMessage> {
    // Update context
    if (context) {
      this.context = { ...this.context, ...context }
    }

    // Add user message to history
    const userChatMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    this.conversationHistory.push(userChatMessage)

    try {
      // Analyze user intent
      const intent = await this.analyzeIntent(userMessage)

      // Generate AI response
      const aiResponse = await this.generateResponse(userMessage, intent)

      // Add AI message to history
      const aiChatMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          confidence: aiResponse.confidence,
          action: aiResponse.action,
          products: aiResponse.products,
          order: aiResponse.order
        }
      }
      this.conversationHistory.push(aiChatMessage)

      return aiChatMessage
    } catch (error) {
      console.error('AI Chat error:', error)
      return this.getFallbackResponse(userMessage)
    }
  }

  // Analyze user intent
  private async analyzeIntent(message: string): Promise<ChatIntent> {
    const systemPrompt = `
You are an intent classifier for a Ukrainian food delivery service.
Analyze the user message and classify the intent.

Available intents:
- product_search: User looking for specific products
- order_status: User asking about their order
- delivery_info: User asking about delivery options
- payment_help: User needs help with payment
- complaint: User has a complaint or issue
- recommendation: User wants product recommendations
- general_info: User asking about store info, hours, etc.
- greeting: User greeting or starting conversation
- goodbye: User ending conversation

Respond in JSON format:
{
  "intent": "intent_name",
  "confidence": 0.8,
  "entities": {
    "product_name": "extracted product name if any",
    "order_number": "extracted order number if any",
    "location": "extracted location if any"
  },
  "suggested_actions": ["action1", "action2"]
}
`

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      })

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    } catch (error) {
      console.error('Intent analysis failed:', error)
      return {
        intent: 'general_info',
        confidence: 0.5,
        entities: {},
        suggested_actions: []
      }
    }
  }

  // Generate AI response
  private async generateResponse(message: string, intent: ChatIntent): Promise<{
    content: string
    confidence: number
    action?: string
    products?: Product[]
    order?: Order
  }> {
    const systemPrompt = this.buildSystemPrompt(intent)
    const contextPrompt = this.buildContextPrompt()

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'system', content: contextPrompt },
            ...this.conversationHistory.slice(-6).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      })

      const data = await response.json()
      const aiContent = data.choices[0].message.content

      // Parse response for actions and data
      const actionMatch = aiContent.match(/\[ACTION:([^\]]+)\]/)
      const action = actionMatch ? actionMatch[1] : undefined

      // Clean content from action tags
      const cleanContent = aiContent.replace(/\[ACTION:[^\]]+\]/g, '').trim()

      // Handle product-related actions
      let products: Product[] = []
      if (action) {
        products = await this.handleProductAction(action, intent)
      }

      return {
        content: cleanContent,
        confidence: 0.8,
        action,
        products
      }
    } catch (error) {
      console.error('Response generation failed:', error)
      return {
        content: this.getFallbackMessage(intent.intent),
        confidence: 0.3
      }
    }
  }

  // Build system prompt based on intent
  private buildSystemPrompt(intent: ChatIntent): string {
    const basePrompt = `
You are a helpful AI assistant for a Ukrainian food delivery service called "PWA Shop".
You should respond in Ukrainian in a friendly, helpful manner.
Always be polite and try to solve the customer's problem.

Current user intent: ${intent.intent}
Confidence: ${intent.confidence}

Guidelines:
- Keep responses concise but helpful
- Use emojis appropriately
- If you need to perform an action, include [ACTION:action_name] in your response
- Always try to guide users toward making a purchase or solving their issue
- Be empathetic with complaints and offer solutions
`

    const intentSpecificPrompts: Record<string, string> = {
      product_search: `
Help the user find products. Ask clarifying questions if needed.
Available actions: [ACTION:search_products], [ACTION:show_category], [ACTION:recommend_products]
`,
      order_status: `
Help the user check their order status. Ask for order number if not provided.
Available actions: [ACTION:check_order_status], [ACTION:track_delivery]
`,
      delivery_info: `
Provide information about delivery options, areas, and timing.
Available actions: [ACTION:show_delivery_info], [ACTION:calculate_delivery_fee]
`,
      recommendation: `
Provide personalized product recommendations based on user preferences.
Available actions: [ACTION:recommend_products], [ACTION:show_popular_items]
`,
      complaint: `
Handle complaints with empathy. Offer solutions and escalate if needed.
Available actions: [ACTION:escalate_to_human], [ACTION:offer_compensation]
`
    }

    return basePrompt + (intentSpecificPrompts[intent.intent] || '')
  }

  // Build context prompt
  private buildContextPrompt(): string {
    return `
Current context:
- Page: ${this.context.current_page}
- Cart items: ${this.context.cart_items.length}
- User location: ${this.context.user_location || 'Unknown'}
- Language: ${this.context.preferences.language}
- Previous orders: ${this.context.order_history.length}

Cart contents: ${this.context.cart_items.map(item => item.name).join(', ') || 'Empty'}
`
  }

  // Handle product-related actions
  private async handleProductAction(action: string, intent: ChatIntent): Promise<Product[]> {
    try {
      // Ensure products are loaded
      if (this.productStore.products.length === 0) {
        await this.productStore.fetchProducts()
      }

      const products = this.productStore.products

      switch (action) {
        case 'show_popular_items':
        case 'recommend_products':
          return this.getPopularProducts(products, 4)

        case 'search_products':
          const searchTerm = intent.entities.product_name || ''
          return this.searchProducts(products, searchTerm, 4)

        case 'show_category':
          const category = intent.entities.category || ''
          return this.getProductsByCategory(products, category, 4)

        default:
          return this.getPopularProducts(products, 4)
      }
    } catch (error) {
      console.error('Failed to handle product action:', error)
      return []
    }
  }

  private getPopularProducts(products: Product[], limit: number): Product[] {
    return products
      .filter(p => p.available)
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
      .slice(0, limit)
  }

  private searchProducts(products: Product[], searchTerm: string, limit: number): Product[] {
    if (!searchTerm) return this.getPopularProducts(products, limit)

    const term = searchTerm.toLowerCase()
    return products
      .filter(p =>
        p.available &&
        (p.display_name.toLowerCase().includes(term) ||
         p.category_name?.toLowerCase().includes(term))
      )
      .slice(0, limit)
  }

  private getProductsByCategory(products: Product[], category: string, limit: number): Product[] {
    if (!category) return this.getPopularProducts(products, limit)

    return products
      .filter(p =>
        p.available &&
        p.category_name?.toLowerCase().includes(category.toLowerCase())
      )
      .slice(0, limit)
  }

  // Fallback responses
  private getFallbackResponse(message: string): ChatMessage {
    const fallbackMessages = [
      "Вибачте, я не зовсім зрозумів ваше питання. Можете перефразувати? 🤔",
      "Дайте мені хвилинку, щоб краще зрозуміти ваш запит... 💭",
      "Схоже, у мене виникли технічні труднощі. Спробуйте ще раз або зверніться до нашої підтримки. 🛠️"
    ]

    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      timestamp: new Date(),
      metadata: { confidence: 0.3 }
    }
  }

  private getFallbackMessage(intent: string): string {
    const messages: Record<string, string> = {
      product_search: "Я можу допомогти вам знайти товари! Що саме ви шукаєте? 🔍",
      order_status: "Щоб перевірити статус замовлення, надайте мені номер замовлення 📋",
      delivery_info: "Ми доставляємо по всьому місту! Хочете дізнатися про доставку у ваш район? 🚚",
      recommendation: "Можу порекомендувати популярні товари! Що вас цікавить? 🌟",
      complaint: "Вибачте за незручності. Розкажіть детальніше про проблему, і я допоможу її вирішити 🙏"
    }

    return messages[intent] || "Як я можу вам допомогти? 😊"
  }

  // Utility methods
  private generateSessionId(): string {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private generateMessageId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Update context
  updateContext(newContext: Partial<ChatContext>): void {
    this.context = { ...this.context, ...newContext }
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }

  // Clear conversation
  clearConversation(): void {
    this.conversationHistory = []
    this.context.session_id = this.generateSessionId()
  }

  // Get quick reply suggestions
  getQuickReplies(intent?: string): string[] {
    const quickReplies: Record<string, string[]> = {
      greeting: [
        "Популярні товари",
        "Показати категорії",
        "Інформація про доставку"
      ],
      product_search: [
        "Показати категорії",
        "Популярні товари",
        "Напої",
        "М'ясо"
      ],
      order_status: [
        "Мої замовлення",
        "Відстежити доставку",
        "Підтримка"
      ],
      delivery_info: [
        "Вартість доставки",
        "Час доставки",
        "Зони доставки"
      ],
      general: [
        "Популярні товари",
        "Кошик",
        "Допомога"
      ]
    }

    return quickReplies[intent || 'greeting'] || [
      "Популярні товари",
      "Показати категорії",
      "Допомога"
    ]
  }
}

export default AIChatService
