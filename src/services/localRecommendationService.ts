import type { Product, CartItem, Order } from '@/types'

interface ProductVector {
  productId: string
  features: number[] // [price_normalized, category_encoded, popularity, seasonal_score, etc.]
}

interface CustomerProfile {
  preferredCategories: string[]
  averageOrderValue: number
  frequentlyBoughtTogether: string[][]
  timePreferences: Record<number, string[]> // hour -> preferred categories
  seasonalPreferences: Record<string, string[]>
}

class LocalRecommendationService {
  private productVectors: Map<string, ProductVector> = new Map()
  private customerProfiles: Map<string, CustomerProfile> = new Map()
  private categoryEmbeddings: Map<string, number[]> = new Map()
  private associationRules: Map<string, string[]> = new Map() // product -> frequently bought with
  private randomSeed: number = Date.now()

  constructor() {
    this.initializeCategoryEmbeddings()
  }

  // Initialize category embeddings (simple approach)
  private initializeCategoryEmbeddings() {
    const categories = [
      'Напої', 'Алкоголь', 'М\'ясо', 'Десерти', 'Кава', 'Закуски',
      'Хліб', 'Сири', 'Соуси', 'Випічка', 'Салати', 'Обіди'
    ]

    categories.forEach((category, index) => {
      // Simple one-hot encoding with some semantic relationships
      const embedding = new Array(categories.length).fill(0)
      embedding[index] = 1

      // Add semantic relationships
      if (category === 'Алкоголь') {
        embedding[categories.indexOf('Закуски')] = 0.7
        embedding[categories.indexOf('М\'ясо')] = 0.6
      }
      if (category === 'Кава') {
        embedding[categories.indexOf('Десерти')] = 0.8
        embedding[categories.indexOf('Випічка')] = 0.7
      }

      this.categoryEmbeddings.set(category, embedding)
    })
  }

  // Build product vectors for similarity calculations
  buildProductVectors(products: Product[]) {
    const maxPrice = Math.max(...products.map(p => p.price))

    products.forEach(product => {
      const categoryEmbedding = this.categoryEmbeddings.get(product.category_name) || []

      const features = [
        product.price / maxPrice, // normalized price
        ...categoryEmbedding,
        product.popularity_score || 0,
        this.getSeasonalScore(product),
        this.getTimeScore(product, new Date().getHours())
      ]

      this.productVectors.set(product.id, {
        productId: product.id,
        features
      })
    })
  }

  // Calculate cosine similarity between products
  private calculateSimilarity(vector1: number[], vector2: number[]): number {
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))

    return dotProduct / (magnitude1 * magnitude2)
  }

  // Get similar products based on content
  getSimilarProducts(productId: string, products: Product[], limit = 4): Product[] {
    const targetVector = this.productVectors.get(productId)
    if (!targetVector) return []

    const similarities = products
      .filter(p => p.id !== productId && p.available && p.is_active) // Filter out unavailable products
      .map(product => {
        const productVector = this.productVectors.get(product.id)
        if (!productVector) return { product, similarity: 0 }

        const similarity = this.calculateSimilarity(
          targetVector.features,
          productVector.features
        )

        return { product, similarity }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return similarities.map(s => s.product)
  }

  // Get complementary products for cart
  getCartRecommendations(cartItems: CartItem[], products: Product[], limit = 4): Product[] {
    if (cartItems.length === 0) {
      return this.getTrendingProducts(products, limit)
    }

    // Find products frequently bought together
    const cartProductIds = cartItems.map(item => item.product_id)
    const complementaryProducts = new Set<string>()

    cartProductIds.forEach(productId => {
      const associated = this.associationRules.get(productId) || []
      associated.forEach(assocId => {
        if (!cartProductIds.includes(assocId)) {
          complementaryProducts.add(assocId)
        }
      })
    })

    // If we have association rules, use them
    if (complementaryProducts.size > 0) {
      const recommended = Array.from(complementaryProducts)
        .map(id => products.find(p => p.id === id))
        .filter(Boolean)
        .filter(p => p.available && p.is_active) // Filter out unavailable products
        .slice(0, limit)

      if (recommended.length >= limit) {
        return recommended as Product[]
      }
    }

    // Fallback to category-based recommendations
    return this.getCategoryBasedRecommendations(cartItems, products, limit)
  }

  private getCategoryBasedRecommendations(
    cartItems: CartItem[],
    products: Product[],
    limit: number
  ): Product[] {
    const cartCategories = cartItems.map(item => item.category_name).filter(Boolean)
    const complementaryCategories = this.getComplementaryCategories(cartCategories)
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const filtered = products
      .filter(product =>
        complementaryCategories.includes(product.category_name) &&
        !cartItems.some(item => item.product_id === product.id) &&
        product.available && product.is_active // Filter out unavailable products
      )

    // Enhanced scoring based on multiple factors
    const enhanced = filtered.map(product => ({
      ...product,
      score: (product.popularity_score || 0) * 0.4 +
             this.getPriceCompatibilityScore(product, cartTotal) * 0.3 +
             this.getSeasonalScore(product) * 0.2 +
             Math.random() * 0.1 // Add randomness for variety
    }))

    return enhanced
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private getPriceCompatibilityScore(product: Product, cartTotal: number): number {
    // Recommend products that match the customer's spending pattern
    const avgCartItemPrice = cartTotal > 0 ? cartTotal / 3 : 100 // Assume 3 items average
    const priceDiff = Math.abs(product.price - avgCartItemPrice)
    const maxDiff = avgCartItemPrice * 2 // Allow 2x difference

    return Math.max(0, 1 - (priceDiff / maxDiff))
  }

  private getComplementaryCategories(categories: string[]): string[] {
    const rules: Record<string, string[]> = {
      'Пиво Скло Опілля': ['Закуски штучні', 'Сир', 'Тара', 'Напої б/а'],
      'Пиво розлив': ['Закуски штучні', 'Сир', 'Тара'],
      'Вино': ['Сир', 'Закуски штучні', 'Напої б/а'],
      'Сир': ['Пиво Скло Опілля', 'Вино', 'Закуски штучні'],
      'Закуски штучні': ['Пиво Скло Опілля', 'Пиво розлив', 'Напої', 'Вино'],
      'Напої': ['Закуски штучні', 'Сир'],
      'Напої б/а': ['Закуски штучні', 'Сир', 'Пиво Скло Опілля'],
      'Тара': ['Пиво Скло Опілля', 'Пиво розлив'],
      'Закуски Вагові': ['Пиво Скло Опілля', 'Вино', 'Напої'],
      'Напої': ['Закуски', 'Десерти'],
      'Алкоголь': ['Закуски', 'М\'ясо', 'Сири'],
      'М\'ясо': ['Алкоголь', 'Хліб', 'Соуси'],
      'Десерти': ['Напої', 'Кава'],
      'Кава': ['Десерти', 'Випічка'],
      'Закуски': ['Напої', 'Алкоголь'],
      'Хліб': ['М\'ясо', 'Сири'],
      'Сири': ['Алкоголь', 'Хліб'],
      'Соуси': ['М\'ясо', 'Закуски']
    }

    const complementary = new Set<string>()
    categories.forEach(category => {
      rules[category]?.forEach(comp => complementary.add(comp))
    })

    // If no complementary categories found, suggest popular ones
    if (complementary.size === 0) {
      ['Пиво Скло Опілля', 'Закуски штучні', 'Сир', 'Напої'].forEach(cat =>
        complementary.add(cat)
      )
    }

    return Array.from(complementary)
  }

  // Get trending/popular products
  getTrendingProducts(products: Product[], limit = 4): Product[] {
    const filtered = products
      .filter(product => product.available && product.is_active) // Filter out unavailable products
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))

    // Add randomness by taking more products and shuffling
    const expanded = filtered.slice(0, Math.min(limit * 3, filtered.length))
    return this.shuffleArray(expanded).slice(0, limit)
  }

  // Time-based recommendations
  getTimeBasedRecommendations(products: Product[], hour: number, limit = 4): Product[] {
    const timeCategories = this.getTimeBasedCategories(hour)

    const filtered = products
      .filter(product => timeCategories.includes(product.category_name) && product.available && product.is_active)
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))

    // Add randomness and seasonal factors
    const enhanced = filtered.map(product => ({
      ...product,
      score: (product.popularity_score || 0) +
             this.getSeasonalScore(product) * 0.3 +
             this.getTimeScore(product, hour) * 0.2 +
             Math.random() * 0.1 // Add small random factor
    }))

    return enhanced
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private getTimeBasedCategories(hour: number): string[] {
    if (hour >= 6 && hour < 11) return ['Кава', 'Випічка', 'Напої']
    if (hour >= 11 && hour < 15) return ['М\'ясо', 'Салати', 'Напої']
    if (hour >= 15 && hour < 18) return ['Закуски', 'Кава', 'Десерти']
    if (hour >= 18 && hour < 22) return ['Алкоголь', 'М\'ясо', 'Закуски']
    return ['Закуски', 'Напої', 'Десерти']
  }

  private getSeasonalScore(product: Product): number {
    const month = new Date().getMonth()
    const season = this.getSeason(month)

    const seasonalCategories: Record<string, string[]> = {
      'winter': ['Кава', 'Алкоголь', 'М\'ясо'],
      'spring': ['Салати', 'Напої'],
      'summer': ['Напої', 'Закуски', 'Десерти'],
      'autumn': ['Кава', 'Випічка', 'М\'ясо']
    }

    return seasonalCategories[season]?.includes(product.category_name) ? 1 : 0.5
  }

  private getTimeScore(product: Product, hour: number): number {
    const timeCategories = this.getTimeBasedCategories(hour)
    return timeCategories.includes(product.category_name) ? 1 : 0.5
  }

  private getSeason(month: number): string {
    if (month >= 11 || month <= 1) return 'winter'
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    return 'autumn'
  }

  // Learn from order history to build association rules
  buildAssociationRules(orders: Order[]) {
    const itemsets: string[][] = orders.map(order =>
      order.items.map(item => item.product_id)
    )

    // Simple frequent itemset mining
    const itemCounts = new Map<string, number>()
    const pairCounts = new Map<string, number>()

    itemsets.forEach(itemset => {
      // Count individual items
      itemset.forEach(item => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
      })

      // Count pairs
      for (let i = 0; i < itemset.length; i++) {
        for (let j = i + 1; j < itemset.length; j++) {
          const pair = [itemset[i], itemset[j]].sort().join(',')
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1)
        }
      }
    })

    // Build association rules with minimum support
    const minSupport = Math.max(2, Math.floor(orders.length * 0.05)) // 5% minimum support

    pairCounts.forEach((count, pair) => {
      if (count >= minSupport) {
        const [item1, item2] = pair.split(',')

        // Add bidirectional associations
        if (!this.associationRules.has(item1)) {
          this.associationRules.set(item1, [])
        }
        if (!this.associationRules.has(item2)) {
          this.associationRules.set(item2, [])
        }

        this.associationRules.get(item1)!.push(item2)
        this.associationRules.get(item2)!.push(item1)
      }
    })
  }

  // Add randomness for refresh functionality
  addRandomness() {
    this.randomSeed = Date.now()
  }

  // Shuffle array using Fisher-Yates algorithm with seed
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    let seed = this.randomSeed

    for (let i = shuffled.length - 1; i > 0; i--) {
      // Simple seeded random number generator
      seed = (seed * 9301 + 49297) % 233280
      const randomValue = seed / 233280
      const j = Math.floor(randomValue * (i + 1))

      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }
}

export default LocalRecommendationService
