<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Product' : 'Add Product' }}</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Display Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            v-model="formData.display_name"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter display name"
          />
        </div>

        <!-- Name (Internal) -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Internal Name
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Internal name (auto-generated if empty)"
          />
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            v-model="formData.category_id"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.display_name }}
            </option>
          </select>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Product description"
          ></textarea>
        </div>

        <!-- Price -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Price (UAH) *
            </label>
            <input
              v-model.number="formData.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Original Price (UAH)
            </label>
            <input
              v-model.number="formData.original_price"
              type="number"
              step="0.01"
              min="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Image Upload -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>

          <!-- Current Image Preview -->
          <div v-if="currentImageUrl" class="mb-3">
            <p class="text-sm text-gray-600 mb-2">Current image:</p>
            <img
              :src="currentImageUrl"
              :alt="formData.display_name"
              class="h-20 w-20 object-cover rounded-lg border border-gray-200"
              @error="handleImageError"
            />
          </div>

          <!-- File Upload -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />

            <div v-if="!isUploading">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="font-medium text-blue-600 hover:text-blue-500"
                >
                  Upload an image
                </button>
                or drag and drop
              </p>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>

            <div v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm text-gray-600">Uploading...</span>
            </div>
          </div>

          <!-- Manual URL Input (Optional) -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Or enter image URL manually
            </label>
            <input
              v-model="formData.image_url"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <!-- Poster Product ID (for existing products) -->
        <div v-if="isEditing" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Poster Product ID
          </label>
          <input
            v-model="formData.poster_product_id"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
            placeholder="Auto-generated"
            readonly
          />
        </div>

        <!-- Active Status -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="formData.is_active"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <!-- Requires Bottles -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="formData.requires_bottles"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Requires bottle selection (for draft beverages)</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Enable this for draft beverages like beer, wine, cider, or kvas that need bottle size selection
          </p>
        </div>

        <!-- Custom Quantity Settings -->
        <div class="mb-6 border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Custom Quantity Settings</h3>
          <p class="text-xs text-gray-500 mb-3">
            Configure custom quantities for weight-based products (e.g., caviar, snacks sold by grams)
          </p>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Custom Quantity
              </label>
              <input
                v-model.number="formData.custom_quantity"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.05 for 50g"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                v-model="formData.custom_unit"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., г, мл, L"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantity Step
              </label>
              <input
                v-model.number="formData.quantity_step"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.05"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Min Quantity
              </label>
              <input
                v-model.number="formData.min_quantity"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.05"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Quantity
              </label>
              <input
                v-model.number="formData.max_quantity"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
              />
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Product, Category } from '@/types'
import { backendApi } from '@/services/backendApi'

interface Props {
  isOpen: boolean
  product?: Product | null
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', product: Partial<Product>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

const isEditing = computed(() => !!props.product)

const currentImageUrl = computed(() => {
  if (formData.value.image_url) {
    return backendApi.getImageUrl(formData.value.image_url)
  }
  return ''
})

const formData = ref({
  poster_product_id: '',
  category_id: '',
  name: '',
  display_name: '',
  description: '',
  price: 0,
  original_price: 0,
  image_url: '',
  display_image_url: '',
  is_active: true,
  requires_bottles: false,
  custom_quantity: null as number | null,
  custom_unit: '',
  quantity_step: null as number | null,
  min_quantity: null as number | null,
  max_quantity: null as number | null
})

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  
  if (newProduct) {

    formData.value = {
      poster_product_id: newProduct.poster_product_id || '',
      category_id: newProduct.category_id || '',
      name: newProduct.name || '',
      display_name: newProduct.display_name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      original_price: newProduct.original_price || 0,
      image_url: newProduct.image_url || '',
      display_image_url: newProduct.display_image_url || '',
      is_active: newProduct.is_active,
      requires_bottles: newProduct.requires_bottles || false,
      custom_quantity: newProduct.custom_quantity || null,
      custom_unit: newProduct.custom_unit || '',
      quantity_step: newProduct.quantity_step || null,
      min_quantity: newProduct.min_quantity || null,
      max_quantity: newProduct.max_quantity || null
    }

    
  } else {
    // Reset form for new product
    formData.value = {
      poster_product_id: '',
      category_id: '',
      name: '',
      display_name: '',
      description: '',
      price: 0,
      original_price: 0,
      image_url: '',
      display_image_url: '',
      is_active: true,
      requires_bottles: false,
      custom_quantity: null,
      custom_unit: '',
      quantity_step: null,
      min_quantity: null,
      max_quantity: null
    }
  }
}, { immediate: true })

// Auto-generate name from display_name if not provided
watch(() => formData.value.display_name, (newDisplayName) => {
  if (!formData.value.name && newDisplayName) {
    formData.value.name = newDisplayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }
})

// Auto-set display_image_url to image_url if not provided
watch(() => formData.value.image_url, (newImageUrl) => {
  if (!formData.value.display_image_url && newImageUrl) {
    formData.value.display_image_url = newImageUrl
  }
})

const handleSubmit = async () => {
  
  isLoading.value = true

  try {
    const productData = {
      ...formData.value,
      name: formData.value.name || formData.value.display_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_image_url: formData.value.display_image_url || formData.value.image_url,
      original_price: formData.value.original_price || formData.value.price
    }

    
    emit('save', productData)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  isUploading.value = true

  try {
    const uploadedImagePath = await backendApi.uploadProductImage(file)

    // Update form data with the uploaded image path
    formData.value.image_url = uploadedImagePath
    formData.value.display_image_url = uploadedImagePath

    
  } catch (error) {
    console.error('❌ Failed to upload image:', error)
    alert('Failed to upload image. Please try again.')
  } finally {
    isUploading.value = false
    // Clear the file input
    if (target) target.value = ''
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>
