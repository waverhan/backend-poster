<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          How was your order?
        </h1>
        <p class="text-lg text-gray-600">
          Your feedback helps us improve and helps other customers make better choices
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Loading your order...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-4xl mb-4">❌</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ error }}</h2>
        <p class="text-gray-600 mb-6">
          This review link may have expired or the order was not found.
        </p>
        <router-link
          to="/shop"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Continue Shopping
        </router-link>
      </div>

      <!-- Order Info and Review Forms -->
      <div v-else-if="orderData" class="space-y-8">
        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Order #{{ orderData.order_id }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Order Date:</span>
              <span class="ml-2 font-medium">{{ formatDate(orderData.created_at) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Total:</span>
              <span class="ml-2 font-medium">{{ orderData.total }} ₴</span>
            </div>
            <div>
              <span class="text-gray-600">Delivery Method:</span>
              <span class="ml-2 font-medium">{{ orderData.delivery_method === 'delivery' ? 'Delivery' : 'Pickup' }}</span>
            </div>
            <div>
              <span class="text-gray-600">Status:</span>
              <span class="ml-2 font-medium text-green-600">{{ orderData.status }}</span>
            </div>
          </div>
        </div>

        <!-- Products to Review -->
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900">
            Rate your products ({{ pendingReviews.length }} remaining)
          </h2>

          <!-- Progress Bar -->
          <div class="bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${reviewProgress}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-600">
            {{ completedReviews.length }} of {{ totalProducts }} products reviewed
          </p>

          <!-- Review Forms -->
          <div class="space-y-8">
            <!-- Completed Reviews -->
            <div v-for="review in completedReviews" :key="review.product_id" class="bg-green-50 border border-green-200 rounded-lg p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    v-if="review.product.image_url"
                    :src="review.product.image_url"
                    :alt="review.product.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ review.product.name }}</h3>
                  <p class="text-sm text-gray-600">{{ review.product.category_name }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="text-sm"
                        :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                      >
                        ⭐
                      </span>
                    </div>
                    <span class="text-sm text-green-600 font-medium">✓ Reviewed</span>
                  </div>
                </div>
                <button
                  @click="editReview(review)"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>

            <!-- Pending Reviews -->
            <div v-for="product in pendingReviews" :key="product.product_id" class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
                    <p class="text-sm text-gray-600">{{ product.category_name }}</p>
                    <p class="text-sm text-gray-500">{{ product.price }} ₴</p>
                  </div>
                </div>
              </div>

              <!-- Review Form -->
              <div class="p-6">
                <ReviewForm
                  :product="product"
                  :order-id="orderId"
                  @submitted="handleReviewSubmitted"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Message -->
        <div v-if="pendingReviews.length === 0" class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div class="text-4xl mb-4">🎉</div>
          <h2 class="text-xl font-semibold text-green-900 mb-2">
            Thank you for your reviews!
          </h2>
          <p class="text-green-700 mb-6">
            Your feedback helps us improve our products and service. We really appreciate you taking the time to share your experience.
          </p>
          
          <!-- Incentive for next order -->
          <div class="bg-white border border-green-300 rounded-lg p-4 mb-6">
            <h3 class="font-medium text-green-900 mb-2">🎁 Thank you bonus!</h3>
            <p class="text-sm text-green-700">
              As a thank you for your reviews, here's a 10% discount code for your next order:
            </p>
            <div class="mt-2 p-2 bg-green-100 rounded font-mono text-green-900 font-bold">
              REVIEW10
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <router-link
              to="/shop"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Continue Shopping
            </router-link>
            <button
              @click="shareReviews"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Share Your Experience
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import reviewService from '@/services/reviewService'
import { useOrdersStore } from '@/stores/orders'
import ReviewForm from '@/components/reviews/ReviewForm.vue'
import type { Review } from '@/types/review'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

// State
const orderId = ref(route.params.orderId as string)
const orderData = ref<any>(null)
const completedReviews = ref<Review[]>([])
const pendingReviews = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string>('')

// Computed
const totalProducts = computed(() => completedReviews.value.length + pendingReviews.value.length)
const reviewProgress = computed(() => {
  if (totalProducts.value === 0) return 0
  return (completedReviews.value.length / totalProducts.value) * 100
})

// Methods
const loadOrderData = async () => {
  try {
    isLoading.value = true
    
    // Get order details
    const order = await ordersStore.getOrder(orderId.value)
    if (!order) {
      error.value = 'Order not found'
      return
    }
    
    orderData.value = order

    // Get existing reviews and pending products
    const reviewData = await reviewService.getOrderReviews(orderId.value)
    completedReviews.value = reviewData.reviews
    
    // Get products that can still be reviewed
    pendingReviews.value = reviewData.pending_products
      .filter(p => p.can_review)
      .map(p => ({
        id: p.product_id,
        name: p.product_name,
        // Add other product details from order items
        ...order.items.find(item => item.product_id === p.product_id)
      }))

  } catch (err) {
    console.error('Failed to load order data:', err)
    error.value = 'Failed to load order information'
  } finally {
    isLoading.value = false
  }
}

const handleReviewSubmitted = (review: Review) => {
  // Move product from pending to completed
  const productIndex = pendingReviews.value.findIndex(p => p.id === review.product_id)
  if (productIndex !== -1) {
    const product = pendingReviews.value.splice(productIndex, 1)[0]
    completedReviews.value.push({
      ...review,
      product
    })
  }

  // Show success message
  
}

const editReview = (review: Review) => {
  // Move back to pending for editing
  const reviewIndex = completedReviews.value.findIndex(r => r.id === review.id)
  if (reviewIndex !== -1) {
    const completedReview = completedReviews.value.splice(reviewIndex, 1)[0]
    pendingReviews.value.unshift(completedReview.product)
  }
}

const shareReviews = () => {
  // Share functionality - could open social media share or copy link
  const shareText = `I just reviewed my order from [Store Name]. Check out their great products!`
  const shareUrl = window.location.origin
  
  if (navigator.share) {
    navigator.share({
      title: 'My Product Reviews',
      text: shareText,
      url: shareUrl
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
    alert('Link copied to clipboard!')
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  if (!orderId.value) {
    error.value = 'Invalid order ID'
    return
  }
  
  loadOrderData()
})
</script>
