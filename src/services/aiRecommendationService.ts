import type { Product, CartItem, Order } from '@/types'

interface RecommendationContext {
  cartItems: CartItem[]
  customerHistory?: Order[]
  location?: string
  timeOfDay?: number
  weather?: string
  season?: string
  customerPreferences?: string[]
}

interface RecommendationResponse {
  products: Product[]
  reasoning: string
  confidence: number
  category: 'complementary' | 'similar' | 'trending' | 'seasonal' | 'personalized'
}

class AIRecommendationService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getRecommendations(
    context: RecommendationContext,
    availableProducts: Product[],
    maxRecommendations = 4
  ): Promise<RecommendationResponse> {
    // Filter out out-of-stock products before processing
    const inStockProducts = availableProducts.filter(product => (product.stock_quantity === undefined || product.stock_quantity === null || product.stock_quantity > 0) && product.is_active)

    try {
      const prompt = this.buildPrompt(context, inStockProducts, maxRecommendations)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert sales assistant for a food/beverage delivery service. 
                       Your goal is to recommend products that customers will actually want to buy.
                       Focus on complementary items, popular combinations, and contextual relevance.
                       Always consider practical factors like meal pairing, occasion, and customer satisfaction.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await response.json()
      return this.parseAIResponse(data.choices[0].message.content, inStockProducts)
    } catch (error) {
      console.error('AI recommendation error:', error)
      return this.getFallbackRecommendations(context, inStockProducts, maxRecommendations)
    }
  }

  private buildPrompt(
    context: RecommendationContext,
    products: Product[],
    maxRecommendations: number
  ): string {
    const cartDescription = context.cartItems.map(item => 
      `${item.name} (${item.quantity}x, ${item.price} UAH)`
    ).join(', ')

    const productList = products.map(p => 
      `${p.id}: ${p.name} - ${p.price} UAH (Category: ${p.category_name})`
    ).join('\n')

    return `
Current cart: ${cartDescription || 'Empty'}
Time: ${context.timeOfDay ? `${context.timeOfDay}:00` : 'Unknown'}
Weather: ${context.weather || 'Unknown'}
Season: ${context.season || 'Unknown'}
Location: ${context.location || 'Unknown'}

Available products:
${productList}

Please recommend exactly ${maxRecommendations} products that would:
1. Complement the current cart items
2. Be relevant for the current time/weather/season
3. Create a satisfying meal or experience
4. Have high likelihood of purchase

Respond in JSON format:
{
  "recommendations": [
    {
      "productId": "product_id",
      "reason": "why this product fits well",
      "confidence": 0.8
    }
  ],
  "category": "complementary|similar|trending|seasonal|personalized",
  "overallReasoning": "explanation of the recommendation strategy"
}
`
  }

  private parseAIResponse(aiResponse: string, products: Product[]): RecommendationResponse {
    try {
      const parsed = JSON.parse(aiResponse)
      const recommendedProducts = parsed.recommendations
        .map((rec: any) => products.find(p => p.id === rec.productId))
        .filter(Boolean)

      return {
        products: recommendedProducts,
        reasoning: parsed.overallReasoning,
        confidence: parsed.recommendations.reduce((avg: number, rec: any) => avg + rec.confidence, 0) / parsed.recommendations.length,
        category: parsed.category
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return this.getFallbackRecommendations({ cartItems: [] }, products, 4)
    }
  }

  private getFallbackRecommendations(
    context: RecommendationContext,
    products: Product[],
    maxRecommendations: number
  ): RecommendationResponse {
    // Simple rule-based fallback
    let recommendations: Product[] = []

    if (context.cartItems.length > 0) {
      // Find complementary products based on categories
      const cartCategories = context.cartItems.map(item => item.category_name).filter(Boolean)
      const complementaryCategories = this.getComplementaryCategories(cartCategories)
      
      recommendations = products
        .filter(p => complementaryCategories.includes(p.category_name) && (p.stock_quantity === undefined || p.stock_quantity === null || p.stock_quantity > 0) && p.is_active)
        .slice(0, maxRecommendations)
    }

    if (recommendations.length < maxRecommendations) {
      // Add popular/trending products
      const popular = products
        .filter(p => !recommendations.includes(p) && (p.stock_quantity === undefined || p.stock_quantity === null || p.stock_quantity > 0) && p.is_active)
        .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
        .slice(0, maxRecommendations - recommendations.length)
      
      recommendations.push(...popular)
    }

    return {
      products: recommendations,
      reasoning: 'Fallback recommendations based on complementary categories and popularity',
      confidence: 0.6,
      category: 'similar'
    }
  }

  private getComplementaryCategories(cartCategories: string[]): string[] {
    const complementaryMap: Record<string, string[]> = {
      'Напої': ['Закуски', 'Десерти', 'Алкоголь'],
      'Алкоголь': ['Закуски', 'М\'ясо', 'Сири'],
      'М\'ясо': ['Алкоголь', 'Хліб', 'Соуси'],
      'Десерти': ['Напої', 'Кава'],
      'Кава': ['Десерти', 'Випічка'],
      'Закуски': ['Напої', 'Алкоголь']
    }

    const complementary = new Set<string>()
    cartCategories.forEach(category => {
      complementaryMap[category]?.forEach(comp => complementary.add(comp))
    })

    return Array.from(complementary)
  }

  // Contextual recommendations
  async getContextualRecommendations(
    location: string,
    timeOfDay: number,
    weather?: string
  ): Promise<string[]> {
    const contextPrompt = `
Time: ${timeOfDay}:00
Weather: ${weather || 'Unknown'}
Location: ${location}

What types of food/drinks would people want right now? 
Respond with 3-5 product categories that would be most appealing.
Consider factors like:
- Meal times (breakfast, lunch, dinner, snacks)
- Weather conditions (hot/cold drinks, comfort food)
- Local preferences
- Time-appropriate items

Respond with just a comma-separated list of categories.
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
          messages: [{ role: 'user', content: contextPrompt }],
          temperature: 0.5,
          max_tokens: 100
        })
      })

      const data = await response.json()
      return data.choices[0].message.content
        .split(',')
        .map((cat: string) => cat.trim())
        .filter(Boolean)
    } catch (error) {
      console.error('Contextual recommendation error:', error)
      return this.getTimeBasedCategories(timeOfDay)
    }
  }

  private getTimeBasedCategories(hour: number): string[] {
    if (hour >= 6 && hour < 11) return ['Кава', 'Випічка', 'Сніданки']
    if (hour >= 11 && hour < 15) return ['Обіди', 'Напої', 'Салати']
    if (hour >= 15 && hour < 18) return ['Закуски', 'Кава', 'Десерти']
    if (hour >= 18 && hour < 22) return ['Вечеря', 'Алкоголь', 'М\'ясо']
    return ['Закуски', 'Напої', 'Десерти']
  }
}

export default AIRecommendationService
