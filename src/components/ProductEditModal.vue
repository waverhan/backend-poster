<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ product ? 'Edit Product' : 'Create Product' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                v-model="formData.display_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Category and Pricing -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                v-model="formData.category_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.display_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price (UAH)</label>
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Original Price (UAH)</label>
              <input
                v-model.number="formData.original_price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- New Product Badge -->
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 class="text-sm font-medium text-green-800 mb-3">✨ New Product Badge</h3>
            <label class="flex items-center mb-2">
              <input
                v-model="formData.is_new"
                type="checkbox"
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-700">Mark as New Product (Новинка)</span>
            </label>
            <div v-if="formData.is_new" class="ml-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Show as New Until
              </label>
              <input
                v-model="formData.new_until"
                type="datetime-local"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p class="text-xs text-gray-500 mt-1">Badge will automatically disappear after this date</p>
            </div>
          </div>

          <!-- Sale Pricing -->
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 class="text-sm font-medium text-red-800 mb-3">🔥 Sale Pricing</h3>
            <div v-if="formData.original_price && formData.original_price > formData.price">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sale Expires At
              </label>
              <input
                v-model="formData.sale_expires_at"
                type="datetime-local"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p class="text-xs text-gray-500 mt-1">Sale will automatically end at this date</p>
            </div>
            <div v-if="formData.original_price && formData.original_price > formData.price" class="mt-2 p-2 bg-red-100 rounded">
              <p class="text-xs text-red-700">
                💰 Sale: {{ ((formData.original_price - formData.price) / formData.original_price * 100).toFixed(0) }}% off
                (Save {{ formData.original_price - formData.price }} UAH)
              </p>
            </div>
            <div v-else class="text-xs text-gray-500">
              Set Original Price higher than Current Price to enable sale countdown
            </div>
          </div>

          <!-- Custom Quantity System -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Custom Quantity System</h3>
            <p class="text-sm text-gray-600 mb-4">
              Configure custom selling quantities for weight-based products. This is essential for proper Poster POS integration where products are priced per gram.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Custom Quantity (kg)
                  <span class="text-xs text-gray-500 block">Selling quantity in kg (e.g., 0.05 for 50g)</span>
                </label>
                <input
                  v-model.number="formData.custom_quantity"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.05"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Display Unit
                  <span class="text-xs text-gray-500 block">Unit shown to customers (e.g., г, мл, шт)</span>
                </label>
                <input
                  v-model="formData.custom_unit"
                  type="text"
                  placeholder="г"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Step (kg)
                  <span class="text-xs text-gray-500 block">Increment step (e.g., 0.5 for beer)</span>
                </label>
                <input
                  v-model.number="formData.quantity_step"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Min Quantity (kg)
                  <span class="text-xs text-gray-500 block">Minimum order quantity</span>
                </label>
                <input
                  v-model.number="formData.min_quantity"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.05"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Max Quantity (kg)
                  <span class="text-xs text-gray-500 block">Maximum order quantity</span>
                </label>
                <input
                  v-model.number="formData.max_quantity"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="5.0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Examples -->
            <div class="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 class="text-sm font-medium text-blue-900 mb-2">Examples:</h4>
              <ul class="text-xs text-blue-800 space-y-1">
                <li><strong>Snacks (50g):</strong> Custom Quantity: 0.05, Unit: г, Step: 0.05</li>
                <li><strong>Beer (500ml):</strong> Custom Quantity: 0.5, Unit: мл, Step: 0.5</li>
                <li><strong>Dried Fish (210g):</strong> Custom Quantity: 0.21, Unit: г, Step: 0.21</li>
              </ul>
            </div>
          </div>

          <!-- Images -->
          <div class="space-y-4">
            <!-- Main Product Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div class="flex items-center space-x-4">
                <!-- Current Image Preview -->
                <div v-if="formData.image_url || imagePreview" class="flex-shrink-0">
                  <img
                    :src="imagePreview || formData.image_url"
                    alt="Product preview"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                </div>

                <!-- Upload Button -->
                <div class="flex-1">
                  <input
                    ref="imageFileInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.imageFileInput?.click()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ formData.image_url || imagePreview ? 'Change Image' : 'Upload Image' }}
                  </button>
                  <p class="mt-1 text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                </div>

                <!-- Remove Button -->
                <button
                  v-if="formData.image_url || imagePreview"
                  type="button"
                  @click="removeImage"
                  class="flex-shrink-0 p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Display Image (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Display Image (Optional)</label>
              <div class="flex items-center space-x-4">
                <!-- Current Display Image Preview -->
                <div v-if="formData.display_image_url || displayImagePreview" class="flex-shrink-0">
                  <img
                    :src="displayImagePreview || formData.display_image_url"
                    alt="Display preview"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                </div>

                <!-- Upload Button -->
                <div class="flex-1">
                  <input
                    ref="displayImageFileInput"
                    type="file"
                    accept="image/*"
                    @change="handleDisplayImageUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.displayImageFileInput?.click()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {{ formData.display_image_url || displayImagePreview ? 'Change Display Image' : 'Upload Display Image' }}
                  </button>
                  <p class="mt-1 text-xs text-gray-500">Higher quality image for product details</p>
                </div>

                <!-- Remove Button -->
                <button
                  v-if="formData.display_image_url || displayImagePreview"
                  type="button"
                  @click="removeDisplayImage"
                  class="flex-shrink-0 p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
              <p class="text-sm text-gray-600 mt-1">Uploading... {{ uploadProgress }}%</p>
            </div>
          </div>

          <!-- Product Attributes -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <label class="block text-sm font-medium text-gray-700">Product Attributes</label>
              <button
                type="button"
                @click="addAttribute"
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Attribute
              </button>
            </div>

            <div v-if="formData.attributes.length === 0" class="text-gray-500 text-sm italic">
              No attributes added. Click "Add Attribute" to add product specifications like alcohol content, bitterness, etc.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(attribute, index) in formData.attributes"
                :key="index"
                class="flex gap-3 items-center p-3 bg-gray-50 rounded-md"
              >
                <div class="flex-1">
                  <input
                    v-model="attribute.name"
                    type="text"
                    placeholder="Attribute name (e.g., Міцність)"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div class="flex-1">
                  <input
                    v-model="attribute.value"
                    type="text"
                    placeholder="Value (e.g., 6.5)"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div class="w-20">
                  <input
                    v-model="attribute.unit"
                    type="text"
                    placeholder="Unit (e.g., °)"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div class="w-24">
                  <select
                    v-model="attribute.color"
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No color</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>
                <button
                  type="button"
                  @click="removeAttribute(index)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="flex items-center space-x-6">
            <label class="flex items-center">
              <input
                v-model="formData.is_active"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Active</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="formData.requires_bottles"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Requires Bottles</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import type { Product, Category, ProductAttribute } from '@/types'

const notificationStore = useNotificationStore()

interface Props {
  isOpen: boolean
  product?: Product | null
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: Partial<Product>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isSubmitting = ref(false)
const uploadProgress = ref(0)
const imagePreview = ref('')
const displayImagePreview = ref('')
const imageFileInput = ref<HTMLInputElement>()
const displayImageFileInput = ref<HTMLInputElement>()

const formData = ref({
  name: '',
  display_name: '',
  description: '',
  category_id: '',
  price: 0,
  original_price: 0,
  image_url: '',
  display_image_url: '',
  is_active: true,
  requires_bottles: false,
  attributes: [] as ProductAttribute[],
  custom_quantity: null as number | null,
  custom_unit: '',
  quantity_step: null as number | null,
  min_quantity: null as number | null,
  max_quantity: null as number | null,
  is_new: false,
  new_until: '',
  sale_expires_at: ''
})

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {
  // Clear previews
  imagePreview.value = ''
  displayImagePreview.value = ''
  uploadProgress.value = 0

  if (newProduct) {
    formData.value = {
      name: newProduct.name || '',
      display_name: newProduct.display_name || '',
      description: newProduct.description || '',
      category_id: newProduct.category_id || '',
      price: newProduct.price || 0,
      original_price: newProduct.original_price || 0,
      image_url: newProduct.image_url || '',
      display_image_url: newProduct.display_image_url || '',
      is_active: newProduct.is_active ?? true,
      requires_bottles: newProduct.requires_bottles || false,
      attributes: newProduct.attributes ? [...newProduct.attributes] : [],
      custom_quantity: newProduct.custom_quantity || null,
      custom_unit: newProduct.custom_unit || '',
      quantity_step: newProduct.quantity_step || null,
      min_quantity: newProduct.min_quantity || null,
      max_quantity: newProduct.max_quantity || null,
      is_new: newProduct.is_new || false,
      new_until: newProduct.new_until ? new Date(newProduct.new_until).toISOString().slice(0, 16) : '',
      sale_expires_at: newProduct.sale_expires_at ? new Date(newProduct.sale_expires_at).toISOString().slice(0, 16) : ''
    }
  } else {
    // Reset form for new product
    formData.value = {
      name: '',
      display_name: '',
      description: '',
      category_id: '',
      price: 0,
      original_price: 0,
      image_url: '',
      display_image_url: '',
      is_active: true,
      requires_bottles: false,
      attributes: [],
      custom_quantity: null,
      custom_unit: '',
      quantity_step: null,
      min_quantity: null,
      max_quantity: null,
      is_new: false,
      new_until: '',
      sale_expires_at: ''
    }
  }
}, { immediate: true })

const addAttribute = () => {
  formData.value.attributes.push({
    name: '',
    value: '',
    unit: '',
    color: ''
  })
}

const removeAttribute = (index: number) => {
  formData.value.attributes.splice(index, 1)
}

// Image upload handlers
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.add({
      type: 'error',
      title: 'File too large',
      message: 'File size must be less than 5MB',
      duration: 5000
    })
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    notificationStore.add({
      type: 'error',
      title: 'Invalid file type',
      message: 'Please select an image file',
      duration: 5000
    })
    return
  }

  try {
    uploadProgress.value = 10

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    uploadProgress.value = 50

    // Upload file to server
    const uploadedUrl = await uploadImageFile(file, 'image')

    uploadProgress.value = 90

    // Update form data
    formData.value.image_url = uploadedUrl

    uploadProgress.value = 100

    // Show success notification
    notificationStore.add({
      type: 'success',
      title: 'Image uploaded',
      message: 'Product image uploaded successfully',
      duration: 3000
    })

    // Reset progress after a short delay
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)

  } catch (error) {
    console.error('Image upload failed:', error)
    notificationStore.add({
      type: 'error',
      title: 'Upload failed',
      message: 'Failed to upload image. Please try again.',
      duration: 5000
    })
    uploadProgress.value = 0
  }
}

const handleDisplayImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.add({
      type: 'error',
      title: 'File too large',
      message: 'File size must be less than 5MB',
      duration: 5000
    })
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    notificationStore.add({
      type: 'error',
      title: 'Invalid file type',
      message: 'Please select an image file',
      duration: 5000
    })
    return
  }

  try {
    uploadProgress.value = 10

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      displayImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    uploadProgress.value = 50

    // Upload file to server
    const uploadedUrl = await uploadImageFile(file, 'display_image')

    uploadProgress.value = 90

    // Update form data
    formData.value.display_image_url = uploadedUrl

    uploadProgress.value = 100

    // Show success notification
    notificationStore.add({
      type: 'success',
      title: 'Display image uploaded',
      message: 'Product display image uploaded successfully',
      duration: 3000
    })

    // Reset progress after a short delay
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)

  } catch (error) {
    console.error('Display image upload failed:', error)
    notificationStore.add({
      type: 'error',
      title: 'Upload failed',
      message: 'Failed to upload display image. Please try again.',
      duration: 5000
    })
    uploadProgress.value = 0
  }
}

const uploadImageFile = async (file: File, type: 'image' | 'display_image'): Promise<string> => {
  const uploadFormData = new FormData()
  uploadFormData.append('image', file)
  uploadFormData.append('type', type)

  const response = await fetch('/api/upload/product-image', {
    method: 'POST',
    body: uploadFormData
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Upload failed')
  }

  const result = await response.json()
  return result.imagePath
}

const removeImage = () => {
  formData.value.image_url = ''
  imagePreview.value = ''
  if (imageFileInput.value) {
    imageFileInput.value.value = ''
  }
}

const removeDisplayImage = () => {
  formData.value.display_image_url = ''
  displayImagePreview.value = ''
  if (displayImageFileInput.value) {
    displayImageFileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Filter out empty attributes
    const cleanedAttributes = formData.value.attributes.filter(attr =>
      attr.name.trim() && attr.value.trim()
    )

    const submitData = {
      ...formData.value,
      attributes: cleanedAttributes
    }

    emit('save', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>
