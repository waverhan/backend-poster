<template>
  <div v-if="showPopup" class="fixed bottom-4 left-4 z-50 p-0">
    <div class="bg-white rounded-lg shadow-2xl w-64 relative overflow-hidden md:w-72">
      <!-- Close Button -->
      <button
        @click="closePopup"
        class="absolute top-1.5 right-1.5 md:top-2 md:right-2 z-10 bg-white rounded-full p-0.5 md:p-1 hover:bg-gray-100 transition-colors"
      >
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Slider Container -->
      <div class="relative h-64 overflow-hidden md:h-72">
        <transition-group name="slide" tag="div" class="relative h-full">
          <!-- Slide 1: Sale Product 1 -->
          <div
            v-if="currentSlide === 0 && saleProducts.length > 0"
            key="slide-0"
            class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600 p-3"
          >
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-white mb-0.5">Купуй зараз</div>
              <div class="text-xl md:text-2xl font-bold text-white mb-2">-{{ discountPercent(saleProducts[0]) }}%</div>
              <img
                v-if="saleProducts[0].display_image_url"
                :src="getImageUrl(saleProducts[0])"
                :alt="saleProducts[0].display_name"
                class="h-16 md:h-20 w-16 md:w-20 object-contain mx-auto mb-2"
              />
              <p class="text-white font-semibold mb-0.5 text-xs md:text-sm line-clamp-2">{{ saleProducts[0].display_name }}</p>
              <div class="flex justify-center gap-1 mb-2">
                <span class="text-xs md:text-sm line-through text-white opacity-75">{{ saleProducts[0].original_price }}₴</span>
                <span class="text-sm md:text-base font-bold text-white">{{ saleProducts[0].price }}₴</span>
              </div>
              <button
                @click="goToProduct(saleProducts[0])"
                class="bg-white text-pink-600 font-bold py-1 px-3 md:py-1.5 md:px-4 rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm"
              >
                Замовити
              </button>
            </div>
          </div>

          <!-- Slide 2: Sale Product 2 -->
          <div
            v-if="currentSlide === 1 && saleProducts.length > 1"
            key="slide-1"
            class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 p-3"
          >
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-white mb-0.5">Купуй зараз</div>
              <div class="text-xl md:text-2xl font-bold text-white mb-2">-{{ discountPercent(saleProducts[1]) }}%</div>
              <img
                v-if="saleProducts[1].display_image_url"
                :src="getImageUrl(saleProducts[1])"
                :alt="saleProducts[1].display_name"
                class="h-16 md:h-20 w-16 md:w-20 object-contain mx-auto mb-2"
              />
              <p class="text-white font-semibold mb-0.5 text-xs md:text-sm line-clamp-2">{{ saleProducts[1].display_name }}</p>
              <div class="flex justify-center gap-1 mb-2">
                <span class="text-xs md:text-sm line-through text-white opacity-75">{{ saleProducts[1].original_price }}₴</span>
                <span class="text-sm md:text-base font-bold text-white">{{ saleProducts[1].price }}₴</span>
              </div>
              <button
                @click="goToProduct(saleProducts[1])"
                class="bg-white text-blue-600 font-bold py-1 px-3 md:py-1.5 md:px-4 rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm"
              >
                Замовити
              </button>
            </div>
          </div>

          <!-- Slide 3: Vacancies -->
          <div
            v-if="currentSlide === 2"
            key="slide-2"
            class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-green-600 p-3"
          >
            <div class="text-center">
              <div class="text-3xl md:text-4xl mb-1">💼</div>
              <div class="text-xl md:text-2xl font-bold text-white mb-0.5">Вакансії</div>
              <p class="text-white mb-1 text-xs md:text-sm">Приєднайтесь до нашої команди!</p>
              <p class="text-white mb-2 text-xs md:text-xs line-clamp-2">Продавець консультант</p>
              <button
                @click="goToVacancies"
                class="bg-white text-green-600 font-bold py-1 px-3 md:py-1.5 md:px-4 rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm"
              >
                Дізнатися більше
              </button>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Navigation Dots -->
      <div class="flex justify-center gap-1 py-1.5 md:py-2 bg-gray-100">
        <button
          v-for="(_, index) in totalSlides"
          :key="index"
          @click="currentSlide = index"
          :class="[
            'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors',
            currentSlide === index ? 'bg-gray-800' : 'bg-gray-400'
          ]"
        />
      </div>

      <!-- Navigation Arrows -->
      <div class="absolute inset-0 flex items-center justify-between px-1.5 md:px-2 pointer-events-none">
        <button
          @click="previousSlide"
          class="pointer-events-auto bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-0.5 md:p-1 transition-all"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="pointer-events-auto bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-0.5 md:p-1 transition-all"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/types'

const router = useRouter()
const productStore = useProductStore()

const showPopup = ref(false)
const currentSlide = ref(0)

const saleProducts = computed(() => {
  return productStore.productsOnSale.slice(0, 2)
})

const totalSlides = computed(() => {
  return saleProducts.value.length + 1 // +1 for vacancies slide
})

const discountPercent = (product: Product): number => {
  if (!product.original_price) return 0
  return Math.round(((product.original_price - product.price) / product.original_price) * 100)
}

const getImageUrl = (product: Product): string => {
  const imageUrl = product.display_image_url || product.image_url
  if (!imageUrl) return '/images/placeholder.jpg'
  
  // Handle MinIO URLs
  if (imageUrl.includes('minio://')) {
    const filename = imageUrl.replace('minio://', '').replace('products/', '')
    return `https://backend-api-production-b3a0.up.railway.app/api/upload/minio-image/${filename}`
  }
  
  // Handle relative paths
  if (imageUrl.startsWith('/')) {
    return `https://backend-api-production-b3a0.up.railway.app${imageUrl}`
  }
  
  return imageUrl
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % totalSlides.value
}

const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + totalSlides.value) % totalSlides.value
}

const closePopup = () => {
  showPopup.value = false
  incrementPopupShowCount()
}

const incrementPopupShowCount = () => {
  const showCount = parseInt(localStorage.getItem('promotionPopupShowCount') || '0', 10)
  localStorage.setItem('promotionPopupShowCount', String(showCount + 1))
}

const goToProduct = (product: Product) => {
  closePopup()
  router.push(`/product/${product.slug || product.id}`)
}

const goToVacancies = () => {
  closePopup()
  router.push('/vacancies')
}

const shouldShowPopup = (): boolean => {
  // Check if there are sale products
  if (saleProducts.value.length === 0) {
    return false
  }

  // Get the current show count
  const showCount = parseInt(localStorage.getItem('promotionPopupShowCount') || '0', 10)

  // Max 2-3 times per user (using 3 as the limit)
  if (showCount >= 3) {
    return false
  }

  // Check if popup was shown in the last 30 minutes
  const lastShownTime = localStorage.getItem('promotionPopupLastShown')
  if (lastShownTime) {
    const timeSinceLastShow = Date.now() - parseInt(lastShownTime, 10)
    const thirtyMinutes = 30 * 60 * 1000
    if (timeSinceLastShow < thirtyMinutes) {
      return false
    }
  }

  return true
}

onMounted(() => {
  if (shouldShowPopup()) {
    setTimeout(() => {
      showPopup.value = true
      localStorage.setItem('promotionPopupLastShown', String(Date.now()))
    }, 1000) // Show after 1 second
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>

