<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ isEditing ? 'Редагувати відгук' : 'Написати відгук' }}
    </h3>

    <form @submit.prevent="submitReview" class="space-y-6">
      <!-- Product Info -->
      <div v-if="product" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
          <img
            v-if="getImageUrl(product)"
            :src="getImageUrl(product)"
            :alt="product.display_name || product.name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">{{ product.display_name || product.name }}</h4>
          <p class="text-sm text-gray-600">{{ product.category_name }}</p>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Електронна пошта *
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Номер телефону *
          </label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+380..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
        </div>
      </div>

      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Загальна оцінка *
        </label>
        <div class="flex items-center gap-2">
          <div class="flex items-center">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="setRating(star)"
              class="text-2xl transition-colors duration-200"
              :class="star <= form.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'"
            >
              ⭐
            </button>
          </div>
          <span class="text-sm text-gray-600 ml-2">
            {{ getRatingText(form.rating) }}
          </span>
        </div>
        <p v-if="errors.rating" class="text-red-500 text-sm mt-1">{{ errors.rating }}</p>
      </div>

      <!-- Review Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Заголовок відгуку
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Коротко опишіть ваш досвід..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="100"
        />
        <p class="text-xs text-gray-500 mt-1">{{ form.title?.length || 0 }}/100 символів</p>
      </div>

      <!-- Review Comment -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ваш відгук
        </label>
        <textarea
          v-model="form.comment"
          rows="4"
          placeholder="Розкажіть іншим про ваш досвід з цим товаром..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="1000"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">{{ form.comment?.length || 0 }}/1000 символів</p>
      </div>

      <!-- reCAPTCHA -->
      <div>
        <div id="recaptcha-container" class="flex justify-center"></div>
        <p v-if="errors.recaptcha" class="text-red-500 text-xs mt-1 text-center">{{ errors.recaptcha }}</p>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {{ isSubmitting ? 'Надсилання...' : (isEditing ? 'Оновити відгук' : 'Надіслати відгук') }}
        </button>
        <button
          v-if="showCancel"
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Скасувати
        </button>
      </div>

      <!-- Guidelines -->
      <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p class="font-medium mb-1">Правила написання відгуків:</p>
        <ul class="space-y-1">
          <li>• Будьте чесними та корисними для інших покупців</li>
          <li>• Зосередьтеся на якості товару та вашому досвіді</li>
          <li>• Уникайте особистої інформації або неприйнятного контенту</li>
          <li>• Відгуки модеруються і можуть з'явитися через 24-48 годин</li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import reviewService from '@/services/reviewService'
import { backendApi } from '@/services/backendApi'
import type { Product } from '@/types'
import type { ReviewFormData } from '@/types/review'

// Global reCAPTCHA declarations
declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaLoad: () => void
  }
}

interface Props {
  product?: Product
  orderId: string
  existingReview?: any
  showCancel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCancel: false
})

const emit = defineEmits<{
  submitted: [review: any]
  cancel: []
}>()

// State
const form = ref<ReviewFormData>({
  product_id: props.product?.id || '',
  order_id: props.orderId,
  rating: 0,
  title: '',
  comment: '',
  email: '',
  phone: '',
  images: []
})

const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})
const recaptchaWidget = ref<any>(null)

// Computed
const isEditing = computed(() => !!props.existingReview)
const isFormValid = computed(() =>
  form.value.rating > 0 &&
  form.value.email &&
  form.value.phone &&
  recaptchaWidget.value
)

// Methods
const setRating = (rating: number) => {
  form.value.rating = rating
  delete errors.value.rating
}

const getRatingText = (rating: number): string => {
  const texts = {
    0: 'Оберіть оцінку',
    1: 'Погано',
    2: 'Задовільно',
    3: 'Добре',
    4: 'Дуже добре',
    5: 'Відмінно'
  }
  return texts[rating as keyof typeof texts] || ''
}

const getImageUrl = (product: Product): string => {
  const primaryImage = product.display_image_url || product.image_url
  if (!primaryImage) return ''
  return backendApi.getImageUrl(primaryImage)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src.includes('/images/') && props.product?.poster_product_id) {
    img.src = backendApi.getPosterImageUrl(props.product.poster_product_id)
  } else {
    img.style.display = 'none'
  }
}

// reCAPTCHA functions
const loadRecaptcha = () => {
  if (window.grecaptcha) {
    renderRecaptcha()
    return
  }

  // Load reCAPTCHA script
  const script = document.createElement('script')
  script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit'
  script.async = true
  script.defer = true
  document.head.appendChild(script)

  // Set global callback
  window.onRecaptchaLoad = renderRecaptcha
}

const renderRecaptcha = () => {
  if (window.grecaptcha && document.getElementById('recaptcha-container')) {
    recaptchaWidget.value = window.grecaptcha.render('recaptcha-container', {
      sitekey: '6LeYK94rAAAAAIKY4bYJkHJl4lN23vKv-r6eISfl', // Your actual reCAPTCHA v3 site key
      callback: (response: string) => {
        delete errors.value.recaptcha
      },
      'expired-callback': () => {
        errors.value.recaptcha = 'reCAPTCHA expired. Please verify again.'
      }
    })
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (form.value.rating === 0) {
    errors.value.rating = 'Будь ласка, оберіть оцінку'
    return false
  }

  if (!form.value.email) {
    errors.value.email = 'Електронна пошта обов\'язкова'
    return false
  }

  if (!form.value.phone) {
    errors.value.phone = 'Номер телефону обов\'язковий'
    return false
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Невірний формат електронної пошти'
    return false
  }

  // Validate phone format (Ukrainian)
  const phoneRegex = /^\+380\d{9}$/
  if (!phoneRegex.test(form.value.phone)) {
    errors.value.phone = 'Невірний формат телефону (приклад: +380981234567)'
    return false
  }

  // Validate reCAPTCHA
  if (!window.grecaptcha || !recaptchaWidget.value) {
    errors.value.recaptcha = 'Будь ласка, підтвердіть, що ви не робот'
    return false
  }

  const recaptchaResponse = window.grecaptcha.getResponse(recaptchaWidget.value)
  if (!recaptchaResponse) {
    errors.value.recaptcha = 'Будь ласка, підтвердіть, що ви не робот'
    return false
  }

  return true
}

const submitReview = async () => {
  if (!validateForm() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Get reCAPTCHA response
    const recaptchaResponse = window.grecaptcha.getResponse(recaptchaWidget.value)

    // Prepare form data
    const reviewData = {
      ...form.value,
      recaptcha_response: recaptchaResponse,
      images: [] // No images for now
    }

    const review = await reviewService.submitReview(reviewData)

    emit('submitted', review)

    // Reset form
    form.value = {
      product_id: props.product?.id || '',
      order_id: props.orderId,
      rating: 0,
      title: '',
      comment: '',
      email: '',
      phone: '',
      images: []
    }

    // Reset reCAPTCHA
    if (window.grecaptcha && recaptchaWidget.value) {
      window.grecaptcha.reset(recaptchaWidget.value)
    }

  } catch (error) {
    console.error('Failed to submit review:', error)
    alert('Не вдалося надіслати відгук. Спробуйте ще раз.')
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (props.existingReview) {
    form.value = {
      ...form.value,
      rating: props.existingReview.rating,
      title: props.existingReview.title || '',
      comment: props.existingReview.comment || '',
      email: props.existingReview.email || '',
      phone: props.existingReview.phone || ''
    }
  }

  // Load reCAPTCHA
  loadRecaptcha()
})

onUnmounted(() => {
  // Clean up global callback
  if (window.onRecaptchaLoad) {
    delete window.onRecaptchaLoad
  }
})
</script>

<style scoped>
/* Custom styles for drag and drop */
.drag-over {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>
