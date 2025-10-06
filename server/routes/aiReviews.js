import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// AI-generated review templates for beer products
const beerReviewTemplates = [
  {
    rating: 4,
    templates: [
      "Приємне нефільтроване пиво з насиченим солодовим смаком. Легка хмелева гіркота добре збалансована. Рекомендую для вечірнього відпочинку.",
      "Якісне пиво з традиційним смаком. Природна мутність додає автентичності. Гарно поєднується з м'ясними стравами.",
      "Солодовий аромат одразу привертає увагу. Смак збалансований, без зайвої гіркоти. Хороший вибір для поціновувачів класичного пива.",
      "Нефільтроване пиво з характерним смаком. Легке тіло, приємне післясмак. Ідеально підходить для дружніх посиденьок."
    ]
  },
  {
    rating: 5,
    templates: [
      "Чудове нефільтроване пиво! Багатий солодовий смак з тонкими нотами хмелю. Справжня насолода для справжніх поціновувачів пива.",
      "Відмінна якість! Природна мутність, насичений смак, ідеальний баланс. Одне з найкращих нефільтрованих пив, що я куштував.",
      "Вражаючий смак і аромат! Солодова основа прекрасно доповнена хмелевими нотами. Обов'язково буду замовляти ще.",
      "Неперевершене пиво! Автентичний смак, якісні інгредієнти, чудова збалансованість. Рекомендую всім любителям якісного пива."
    ]
  },
  {
    rating: 3,
    templates: [
      "Непогане пиво, але могло б бути краще. Смак трохи простуватий, хоча питкий. За таку ціну цілком прийнятно.",
      "Середнє пиво. Нічого особливого, але й нічого поганого. Підійде для щоденного вживання.",
      "Звичайне нефільтроване пиво. Смак не вражає, але й не розчаровує. Можна спробувати раз."
    ]
  }
]

// Ukrainian names for generated reviews
const ukrainianNames = [
  'Олександр', 'Андрій', 'Володимир', 'Дмитро', 'Іван', 'Максим', 'Сергій', 'Юрій',
  'Анна', 'Катерина', 'Марія', 'Наталія', 'Олена', 'Тетяна', 'Юлія', 'Ірина'
]

// Generate random Ukrainian name
function generateRandomName() {
  const firstName = ukrainianNames[Math.floor(Math.random() * ukrainianNames.length)]
  const lastNames = ['Петренко', 'Іваненко', 'Коваленко', 'Шевченко', 'Бондаренко', 'Мельник', 'Кравченко', 'Ткаченко']
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

// Generate random email
function generateRandomEmail(name) {
  const domains = ['gmail.com', 'ukr.net', 'i.ua', 'meta.ua']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const username = name.toLowerCase().replace(' ', '.').replace(/[^a-z.]/g, '')
  return `${username}@${domain}`
}

// Check if product is a beer product
function isBeerProduct(product) {
  const categoryName = product.category_name?.toLowerCase() || ''
  const productName = product.name?.toLowerCase() || ''
  
  return categoryName.includes('пиво') || 
         categoryName.includes('beer') || 
         productName.includes('пиво') || 
         productName.includes('beer')
}

// Generate AI review for a product
function generateAIReview(product) {
  // Select random rating (weighted towards 4-5 stars)
  const ratingWeights = [
    { rating: 3, weight: 0.2 },
    { rating: 4, weight: 0.5 },
    { rating: 5, weight: 0.3 }
  ]
  
  const random = Math.random()
  let cumulativeWeight = 0
  let selectedRating = 4
  
  for (const { rating, weight } of ratingWeights) {
    cumulativeWeight += weight
    if (random <= cumulativeWeight) {
      selectedRating = rating
      break
    }
  }
  
  // Get templates for selected rating
  const ratingTemplates = beerReviewTemplates.find(r => r.rating === selectedRating)
  const templates = ratingTemplates ? ratingTemplates.templates : beerReviewTemplates[1].templates
  
  // Select random template
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  // Generate random reviewer
  const name = generateRandomName()
  const email = generateRandomEmail(name)
  
  return {
    customer_name: name,
    customer_email: email,
    rating: selectedRating,
    comment: template,
    verified_purchase: false,
    status: 'approved'
  }
}

// POST /api/ai-reviews/generate/:productId
router.post('/generate/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { count = 2 } = req.body // Default to 2 reviews
    
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Check if it's a beer product
    if (!isBeerProduct(product)) {
      return res.status(400).json({ error: 'AI reviews are only available for beer products' })
    }
    
    // Check if product already has reviews
    const existingReviews = await prisma.review.count({
      where: { product_id: productId }
    })
    
    if (existingReviews > 0) {
      return res.status(400).json({ error: 'Product already has reviews' })
    }
    
    // Generate AI reviews
    const generatedReviews = []
    const reviewCount = Math.min(count, 3) // Limit to max 3 reviews
    
    for (let i = 0; i < reviewCount; i++) {
      const reviewData = generateAIReview(product)
      
      const review = await prisma.review.create({
        data: {
          product_id: productId,
          ...reviewData
        }
      })
      
      generatedReviews.push(review)
    }
    
    res.json({
      success: true,
      generated_count: generatedReviews.length,
      reviews: generatedReviews
    })
    
  } catch (error) {
    console.error('Error generating AI reviews:', error)
    res.status(500).json({ error: 'Failed to generate AI reviews' })
  }
})

// POST /api/ai-reviews/generate-all-beer
router.post('/generate-all-beer', async (req, res) => {
  try {
    const { count = 2 } = req.body
    
    // Get all beer products without reviews
    const products = await prisma.product.findMany({
      include: { 
        category: true,
        _count: {
          select: { reviews: true }
        }
      }
    })
    
    // Filter beer products without reviews
    const beerProductsWithoutReviews = products.filter(product => 
      isBeerProduct(product) && product._count.reviews === 0
    )
    
    const results = []
    
    for (const product of beerProductsWithoutReviews) {
      try {
        const reviewCount = Math.min(count, 3)
        const generatedReviews = []
        
        for (let i = 0; i < reviewCount; i++) {
          const reviewData = generateAIReview(product)
          
          const review = await prisma.review.create({
            data: {
              product_id: product.id,
              ...reviewData
            }
          })
          
          generatedReviews.push(review)
        }
        
        results.push({
          product_id: product.id,
          product_name: product.name,
          generated_count: generatedReviews.length
        })
        
      } catch (error) {
        console.error(`Error generating reviews for product ${product.id}:`, error)
        results.push({
          product_id: product.id,
          product_name: product.name,
          error: error.message
        })
      }
    }
    
    res.json({
      success: true,
      processed_products: results.length,
      results
    })
    
  } catch (error) {
    console.error('Error generating AI reviews for all beer products:', error)
    res.status(500).json({ error: 'Failed to generate AI reviews for beer products' })
  }
})

export default router
