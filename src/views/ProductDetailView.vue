<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <router-link to="/shop" class="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад до магазину
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-gray-600">Завантаження деталей товару...</p>
      </div>

      <!-- Product Not Found -->
      <div v-else-if="!product" class="text-center py-16">
        <div class="text-6xl mb-4">❌</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Товар не знайдено</h1>
        <p class="text-gray-600 mb-8">Товар, який ви шукаєте, не існує.</p>
        <router-link to="/shop" class="btn-primary">
          Назад до магазину
        </router-link>
      </div>

      <!-- Product Details -->
      <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              v-if="product.display_image_url"
              :src="getImageUrl(product.display_image_url)"
              :alt="product.display_name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Title -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.display_name }}</h1>

              <!-- Rating and Like Button Row -->
              <div class="flex items-center justify-between mb-4">
                <!-- Rating on the left -->
                <div v-if="combinedRating && combinedRating.totalReviews > 0" class="flex items-center gap-2">
                  <div class="flex">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="text-lg"
                      :class="star <= Math.round(combinedRating.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
                    >
                      ⭐
                    </span>
                  </div>
                  <a
                    href="#reviews-section"
                    class="text-sm text-gray-600 hover:text-blue-600 underline cursor-pointer"
                    @click="scrollToReviews"
                  >
                    ({{ combinedRating.totalReviews }})
                  </a>
                </div>

                <!-- Like Button on the right -->
                <LikeButton
                  :product="product"
                  size="normal"
                  variant="default"
                  :show-count="true"
                />
              </div>
            </div>

            <!-- Price and Add to Cart -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex flex-col">
                <div class="flex items-center gap-4">
                  <span :class="[
                    'text-3xl font-black tracking-tight',
                    product.original_price && product.original_price > product.price
                      ? 'text-red-600'
                      : 'text-gray-900'
                  ]" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
                    {{ formatPrice(product.price) }} ₴
                  </span>
                  <span v-if="product.original_price && product.original_price > product.price"
                        class="text-lg text-gray-500 line-through">
                    {{ formatPrice(product.original_price) }} ₴
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ getUnitLabel(product.unit) }}</p>
              </div>
              <div class="flex-shrink-0 ml-6">
                <button
                  @click="addToCart"
                  :disabled="!product.available"
                  class="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
                >
                  {{ product.available ? 'КУПИТИ' : 'Немає в наявності' }}
                </button>
              </div>
            </div>

            <!-- Product Attributes -->
            <div v-if="displayAttributes && displayAttributes.length > 0" class="space-y-4 mb-6">
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="attribute in displayAttributes"
                  :key="attribute.name"
                  class="text-center"
                >
                  <div class="text-sm text-gray-600 mb-1">{{ attribute.name }}</div>
                  <div
                    class="text-lg font-bold"
                    :class="attribute.color === 'orange' ? 'text-orange-500' : 'text-gray-900'"
                  >
                    {{ attribute.value }}{{ attribute.unit }}
                  </div>
                  <div v-if="attribute.color === 'orange'" class="w-full h-1 bg-orange-500 rounded mt-1"></div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="displayDescription" class="mt-6">
              <div class="text-gray-600 whitespace-pre-line">
                <span v-if="!isLongDescription || showFullDescription">{{ displayDescription }}</span>
                <span v-else>{{ truncatedDescription }}</span>
              </div>
              <button
                v-if="isLongDescription"
                @click="showFullDescription = !showFullDescription"
                class="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
              >
                {{ showFullDescription ? 'Показати менше' : 'Показати більше' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div id="reviews-section" v-if="siteConfigStore.currentConfig.enable_reviews" class="mt-8 border-t border-gray-200 pt-8 px-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Відгуки</h2>
            <button
              @click="showReviewForm = !showReviewForm"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {{ showReviewForm ? 'Скасувати' : 'Написати відгук' }}
            </button>
          </div>

          <!-- Review Form -->
          <div v-if="showReviewForm" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Ваш відгук</h3>
            <ReviewForm
              v-if="product"
              :product="product"
              :order-id="'guest-review'"
              :show-cancel="true"
              @submitted="handleReviewSubmitted"
              @cancel="showReviewForm = false"
            />
          </div>

          <!-- Review List -->
          <div class="mt-8">
            <ReviewList
              v-if="product"
              :product-id="product.id"
              :show-summary="false"
              :show-filters="false"
            />
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div v-if="product" class="mt-8">
        <RelatedProducts
          :current-product="product"
          :max-products="4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { backendApi } from '@/services/backendApi'
import ratingService from '@/services/ratingService'
import type { CombinedRating } from '@/services/ratingService'
import {
  isDraftBeverage,
  getDefaultBottleSelection,
  calculateBottleCost,
  getBottleCartItems
} from '@/utils/bottleUtils'
import ReviewList from '@/components/reviews/ReviewList.vue'
import ReviewForm from '@/components/reviews/ReviewForm.vue'
import RelatedProducts from '@/components/product/RelatedProducts.vue'
import LikeButton from '@/components/product/LikeButton.vue'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()

// Translation
const { t } = useI18n()

const productStore = useProductStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()

const loading = ref(true)
const product = ref<Product | null>(null)
const showReviewForm = ref(false)
const combinedRating = ref<CombinedRating | null>(null)
const showFullDescription = ref(false)

// Computed properties
const isBeerProduct = computed(() => {
  if (!product.value) return false
  const categoryName = product.value.category_name?.toLowerCase() || ''
  const productName = product.value.name.toLowerCase()
  return categoryName.includes('пиво') ||
         categoryName.includes('beer') ||
         productName.includes('пиво') ||
         productName.includes('beer')
})

// Parse product attributes from JSON string or array
const parsedAttributes = computed(() => {
  if (!product.value?.attributes) return {}

  // If attributes is already an array (old format), convert to object
  if (Array.isArray(product.value.attributes)) {
    const obj: Record<string, any> = {}
    product.value.attributes.forEach(attr => {
      obj[attr.name] = attr.value
    })
    return obj
  }

  // If attributes is a JSON string, parse it
  if (typeof product.value.attributes === 'string') {
    try {
      return JSON.parse(product.value.attributes)
    } catch (e) {
      console.error('Failed to parse product attributes:', e)
      return {}
    }
  }

  // If attributes is already an object, return as is
  return product.value.attributes || {}
})

// Extract Untappd rating
const untappdRating = computed(() => {
  const attrs = parsedAttributes.value
  return attrs.untappd_rating ? parseFloat(attrs.untappd_rating) : null
})

// Extract Untappd rating count
const untappdRatingCount = computed(() => {
  const attrs = parsedAttributes.value
  return attrs.untappd_rating_count ? parseInt(attrs.untappd_rating_count) : null
})

// Format description (clean, without ABV/IBU since they're shown as attributes)
const displayDescription = computed(() => {
  return product.value?.description || ''
})

// Check if description is long (more than 300 characters)
const isLongDescription = computed(() => {
  return displayDescription.value.length > 300
})

// Truncated description for show more/less functionality
const truncatedDescription = computed(() => {
  if (displayDescription.value.length <= 300) return displayDescription.value
  return displayDescription.value.substring(0, 300) + '...'
})

// Convert attributes to display format for the UI
const displayAttributes = computed(() => {
  if (!product.value?.attributes) return []

  let attrs = []

  // Parse attributes if it's a JSON string
  if (typeof product.value.attributes === 'string') {
    try {
      attrs = JSON.parse(product.value.attributes)
    } catch (error) {
      console.error('Error parsing attributes:', error)
      return []
    }
  } else if (Array.isArray(product.value.attributes)) {
    attrs = product.value.attributes
  } else {
    return []
  }

  // Filter and format attributes for display
  const result = []

  attrs.forEach(attr => {
    // Show ABV, IBU, and OG with orange color
    if (attr.name === 'ABV' && attr.value && parseFloat(attr.value) > 0) {
      result.push({
        name: 'Міцність',
        value: attr.value,
        unit: attr.unit || '%',
        color: 'orange'
      })
    } else if (attr.name === 'IBU' && attr.value && parseInt(attr.value) > 0) {
      result.push({
        name: 'Гіркота',
        value: attr.value,
        unit: ' IBU',
        color: 'orange'
      })
    } else if (attr.name === 'OG' && attr.value && parseFloat(attr.value) > 0) {
      result.push({
        name: 'Щільність',
        value: attr.value,
        unit: attr.unit || '%',
        color: 'orange'
      })
    }
  })

  return result
})

// Add Google Rich Snippets structured data for SEO
const addStructuredData = () => {
  if (!product.value) return

  // Remove existing structured data
  const existingProductScript = document.querySelector('script[type="application/ld+json"][data-product-schema]')
  if (existingProductScript) {
    existingProductScript.remove()
  }

  const existingBreadcrumbScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb-schema]')
  if (existingBreadcrumbScript) {
    existingBreadcrumbScript.remove()
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.value.display_name,
    "description": product.value.description || '',
    "image": product.value.display_image_url ? backendApi.getImageUrl(product.value.display_image_url) : undefined,
    "brand": {
      "@type": "Brand",
      "name": "Опілля"
    },
    "offers": {
      "@type": "Offer",
      "price": product.value.price.toString(),
      "priceCurrency": "UAH",
      "availability": product.value.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Опілля"
      }
    }
  }

  // Add combined rating if available
  if (combinedRating.value && combinedRating.value.totalReviews > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": combinedRating.value.averageRating.toString(),
      "ratingCount": combinedRating.value.totalReviews.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }

    // Add review information if available
    if (combinedRating.value.hasLocalReviews || combinedRating.value.hasUntappdRating) {
      structuredData.review = []

      // Add a summary review indicating the source of ratings
      let reviewText = `Середня оцінка ${combinedRating.value.averageRating.toFixed(1)} з 5 зірок`
      if (combinedRating.value.hasLocalReviews && combinedRating.value.hasUntappdRating) {
        reviewText += ` на основі ${combinedRating.value.localReviewCount} місцевих відгуків та ${combinedRating.value.untappdReviewCount} відгуків з Untappd`
      } else if (combinedRating.value.hasLocalReviews) {
        reviewText += ` на основі ${combinedRating.value.localReviewCount} місцевих відгуків`
      } else if (combinedRating.value.hasUntappdRating) {
        reviewText += ` на основі ${combinedRating.value.untappdReviewCount} відгуків з Untappd`
      }

      structuredData.review.push({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": combinedRating.value.averageRating.toString(),
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Organization",
          "name": "Opillia"
        },
        "reviewBody": reviewText
      })
    }
  }

  // Add additional properties for beer products
  if (isBeerProduct.value) {
    const attrs = parsedAttributes.value
    structuredData.category = "Alcoholic Beverage"
    structuredData.additionalProperty = []

    if (attrs.abv) {
      structuredData.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "Alcohol by Volume",
        "value": `${attrs.abv}%`
      })
    }

    if (attrs.ibu) {
      structuredData.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "International Bitterness Units",
        "value": attrs.ibu.toString()
      })
    }

    if (attrs.og) {
      structuredData.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "Original Gravity",
        "value": `${attrs.og}%`
      })
    }

    if (attrs.style) {
      structuredData.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "Beer Style",
        "value": attrs.style
      })
    }
  }

  // Update page title and meta tags
  const productTitle = product.value.display_name
  const productDescription = product.value.description ?
    product.value.description.substring(0, 160) + (product.value.description.length > 160 ? '...' : '') :
    `${productTitle} - Замовляйте найкращі напої, пиво, м'ясо та делікатеси з доставкою по Києву.`

  // Update page title
  document.title = `${productTitle} | OpilliaShop`

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', productDescription)

  // Update or create Open Graph meta tags
  const ogTags = [
    { property: 'og:title', content: productTitle },
    { property: 'og:description', content: productDescription },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:site_name', content: 'OpilliaShop' },
    { property: 'product:price:amount', content: product.value.price.toString() },
    { property: 'product:price:currency', content: 'UAH' }
  ]

  if (product.value.display_image_url) {
    ogTags.push({
      property: 'og:image',
      content: backendApi.getImageUrl(product.value.display_image_url)
    })
  }

  ogTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[property="${tag.property}"]`)
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('property', tag.property)
      document.head.appendChild(metaTag)
    }
    metaTag.setAttribute('content', tag.content)
  })

  // Create breadcrumb structured data
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Головна",
      "item": "https://opillia.com.ua/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Магазин",
      "item": "https://opillia.com.ua/shop"
    }
  ]

  // Add category if available
  if (product.value.category_name) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": product.value.category_name,
      "item": `https://opillia.com.ua/shop?category=${product.value.category_id}`
    })
  }

  // Add product as final item
  breadcrumbItems.push({
    "@type": "ListItem",
    "position": breadcrumbItems.length + 1,
    "name": product.value.display_name,
    "item": window.location.href
  })

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  }

  // Create and append product structured data script tag
  const productScript = document.createElement('script')
  productScript.type = 'application/ld+json'
  productScript.setAttribute('data-product-schema', 'true')
  productScript.textContent = JSON.stringify(structuredData, null, 2)
  document.head.appendChild(productScript)

  // Create and append breadcrumb structured data script tag
  const breadcrumbScript = document.createElement('script')
  breadcrumbScript.type = 'application/ld+json'
  breadcrumbScript.setAttribute('data-breadcrumb-schema', 'true')
  breadcrumbScript.textContent = JSON.stringify(breadcrumbData, null, 2)
  document.head.appendChild(breadcrumbScript)
}

const getImageUrl = (imagePath: string): string => {
  return backendApi.getImageUrl(imagePath)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement

  if (img.src.includes('/images/products/') && product.value?.poster_product_id) {
    img.src = backendApi.getPosterImageUrl(product.value.poster_product_id)
  }
}

const formatPrice = (price: number): string => {
  // If product has custom quantity (weight-based), show price per custom unit
  if (product.value?.custom_quantity && product.value?.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = price * product.value.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return price.toFixed(2)
}

const getUnitLabel = (unit: string | undefined): string => {
  // If product has custom quantity, show the custom unit
  if (product.value?.custom_quantity && product.value?.custom_unit) {
    // Convert custom_quantity to display format
    if (product.value.custom_unit === 'г') {
      const grams = product.value.custom_quantity * 1000
      return `${grams}г`
    } else if (product.value.custom_unit === 'мл') {
      const ml = product.value.custom_quantity * 1000
      return `${ml}мл`
    }
    return product.value.custom_unit
  }

  // For regular products, show the unit
  if (!unit) return 'за шт'

  const unitMap: Record<string, string> = {
    'kg': 'за кг',
    'g': 'за г',
    'l': 'за л',
    'ml': 'за мл',
    'p': 'за шт',
    'pcs': 'за шт',
    'piece': 'за шт'
  }

  return unitMap[unit.toLowerCase()] || `за ${unit}`
}

const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500'
  }
  return colorMap[color] || 'bg-gray-500'
}

// Get Untappd URL for this product (if mapped)
const getUntappdUrl = (): string | null => {
  const attrs = parsedAttributes.value
  return attrs.untappd_url || null
}

const scrollToReviews = () => {
  const reviewsSection = document.getElementById('reviews-section')
  if (reviewsSection) {
    reviewsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const addToCart = () => {
  if (!product.value) return

  // Check if this is a draft beverage that requires bottles
  if (isDraftBeverage(product.value)) {
    // For draft beverages, use default 1L quantity and auto bottle selection
    const quantity = 1 // Default 1L
    const autoBottles = getDefaultBottleSelection(quantity)

    // Create cart item for the beverage
    const cartItem: any = {
      product_id: product.value.id,
      poster_product_id: product.value.poster_product_id,
      name: product.value.display_name,
      price: product.value.price,
      quantity: quantity,
      image_url: product.value.display_image_url,
      unit: product.value.unit || 'L',
      max_quantity: product.value.quantity,
      is_draft_beverage: true,
      bottle_selection: autoBottles
    }

    cartStore.addItem(cartItem)

    // Add bottles to cart if auto selection is enabled
    if (autoBottles && autoBottles.bottles && autoBottles.bottles.length > 0) {
      autoBottles.bottles.forEach(bottle => {
        if (bottle.quantity > 0) {
          const bottleCartItem = {
            cart_item_id: `bottle_${bottle.id}_${Date.now()}`,
            product_id: bottle.id,
            poster_product_id: bottle.poster_product_id,
            name: bottle.name,
            price: bottle.price,
            quantity: bottle.quantity,
            subtotal: bottle.price * bottle.quantity,
            image_url: bottle.image_url,
            unit: bottle.unit,
            max_quantity: bottle.max_quantity,
            is_draft_beverage: false,
            is_bottle_product: true
          }
          cartStore.addItem(bottleCartItem)
        }
      })
    }

    notificationStore.add({
      type: 'success',
      title: t('cart.addedToCart'),
      message: `${product.value.display_name} (${quantity}L) з пляшками додано до кошика`,
      duration: 3000
    })
  } else {
    // Regular product (non-draft)
    const cartItem: any = {
      product_id: product.value.id,
      poster_product_id: product.value.poster_product_id,
      name: product.value.display_name,
      price: product.value.price,
      quantity: 1,
      image_url: product.value.display_image_url,
      unit: product.value.unit,
      max_quantity: product.value.quantity
    }

    // Add custom quantity information for weight-based products
    if (product.value.custom_quantity) {
      cartItem.custom_quantity = product.value.custom_quantity
      cartItem.custom_unit = product.value.custom_unit
      cartItem.quantity_step = product.value.quantity_step || product.value.custom_quantity
    }

    cartStore.addItem(cartItem)

    notificationStore.add({
      type: 'success',
      title: t('cart.addedToCart'),
      message: `${product.value.display_name} ${t('cart.addedToCart')}`,
      duration: 3000
    })
  }
}



const handleReviewSubmitted = (review: any) => {
  showReviewForm.value = false
  notificationStore.add({
    type: 'success',
    title: 'Дякуємо!',
    message: 'Ваш відгук успішно надіслано. Він з\'явиться після модерації.',
    duration: 5000
  })
  // Reload reviews and rating
  loadCombinedRating()
  window.location.reload()
}

// Load combined rating
const loadCombinedRating = async () => {
  if (!product.value) return

  try {
    const rating = await ratingService.getCombinedRating(product.value)
    combinedRating.value = rating
  } catch (error) {
    console.error('Error loading combined rating:', error)
  }
}

// Watch for product changes to update structured data
watch(product, (newProduct) => {
  if (newProduct) {
    nextTick(() => {
      addStructuredData()
    })
  }
}, { immediate: true })

onMounted(async () => {
  try {
    const productId = route.params.id as string

    // Try to find product in store first
    const existingProduct = productStore.productById(productId)
    if (existingProduct) {
      product.value = existingProduct
      loading.value = false
      // Load combined rating and add structured data after product is loaded
      await loadCombinedRating()
      nextTick(() => {
        addStructuredData()
      })
      return
    }

    // If not found in store, fetch from API
    const fetchedProduct = await productStore.fetchProduct(productId)
    if (fetchedProduct) {
      product.value = fetchedProduct
      // Load combined rating and add structured data after product is loaded
      await loadCombinedRating()
      nextTick(() => {
        addStructuredData()
      })
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    notificationStore.add({
      type: 'error',
      title: 'Error',
      message: 'Failed to load product details',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
})

// Cleanup meta tags when component is unmounted
onUnmounted(() => {
  // Remove product-specific structured data
  const existingProductScript = document.querySelector('script[type="application/ld+json"][data-product-schema]')
  if (existingProductScript) {
    existingProductScript.remove()
  }

  // Remove breadcrumb structured data
  const existingBreadcrumbScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb-schema]')
  if (existingBreadcrumbScript) {
    existingBreadcrumbScript.remove()
  }

  // Reset page title to default
  document.title = 'OpilliaShop - Найкращі напої та делікатеси'
})
</script>
