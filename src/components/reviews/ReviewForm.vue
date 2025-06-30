<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ isEditing ? 'Edit Your Review' : 'Write a Review' }}
    </h3>

    <form @submit.prevent="submitReview" class="space-y-6">
      <!-- Product Info -->
      <div v-if="product" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
          <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
          <p class="text-sm text-gray-600">{{ product.category_name }}</p>
        </div>
      </div>

      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating *
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
          Review Title
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Summarize your experience..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="100"
        />
        <p class="text-xs text-gray-500 mt-1">{{ form.title?.length || 0 }}/100 characters</p>
      </div>

      <!-- Review Comment -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          v-model="form.comment"
          rows="4"
          placeholder="Tell others about your experience with this product..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxlength="1000"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">{{ form.comment?.length || 0 }}/1000 characters</p>
      </div>

      <!-- Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (Optional)
        </label>
        <div class="space-y-3">
          <!-- Upload Area -->
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="text-gray-600">
              <span class="text-2xl block mb-2">📷</span>
              <p class="text-sm">
                Drag and drop photos here, or
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Max 5 images, 5MB each (JPG, PNG, WebP)
              </p>
            </div>
          </div>

          <!-- Preview Images -->
          <div v-if="selectedImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="(image, index) in selectedImages"
              :key="index"
              class="relative group"
            >
              <img
                :src="image.preview"
                :alt="`Preview ${index + 1}`"
                class="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {{ isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review') }}
        </button>
        <button
          v-if="showCancel"
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>

      <!-- Guidelines -->
      <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p class="font-medium mb-1">Review Guidelines:</p>
        <ul class="space-y-1">
          <li>• Be honest and helpful to other customers</li>
          <li>• Focus on the product quality and your experience</li>
          <li>• Avoid personal information or inappropriate content</li>
          <li>• Reviews are moderated and may take 24-48 hours to appear</li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import reviewService from '@/services/reviewService'
import type { Product } from '@/types'
import type { ReviewFormData } from '@/types/review'

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
  images: []
})

const selectedImages = ref<Array<{ file: File; preview: string }>>([])
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})
const fileInput = ref<HTMLInputElement>()

// Computed
const isEditing = computed(() => !!props.existingReview)
const isFormValid = computed(() => form.value.rating > 0)

// Methods
const setRating = (rating: number) => {
  form.value.rating = rating
  delete errors.value.rating
}

const getRatingText = (rating: number): string => {
  const texts = {
    0: 'Select rating',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }
  return texts[rating as keyof typeof texts] || ''
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    addImages(Array.from(files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    addImages(Array.from(files))
  }
}

const addImages = (files: File[]) => {
  const maxImages = 5
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  files.forEach(file => {
    if (selectedImages.value.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    if (file.size > maxSize) {
      alert(`Image ${file.name} is too large. Maximum size is 5MB.`)
      return
    }

    if (!allowedTypes.includes(file.type)) {
      alert(`Image ${file.name} has unsupported format. Use JPG, PNG, or WebP.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file,
        preview: e.target?.result as string
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const validateForm = (): boolean => {
  errors.value = {}

  if (form.value.rating === 0) {
    errors.value.rating = 'Please select a rating'
    return false
  }

  return true
}

const submitReview = async () => {
  if (!validateForm() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Prepare form data with images
    const reviewData = {
      ...form.value,
      images: selectedImages.value.map(img => img.file)
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
      images: []
    }
    selectedImages.value = []

  } catch (error) {
    console.error('Failed to submit review:', error)
    alert('Failed to submit review. Please try again.')
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
      comment: props.existingReview.comment || ''
    }
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
