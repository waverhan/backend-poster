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

        <!-- Slug (URL-friendly identifier) -->
        <div class="mb-4" v-if="isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL Slug (SEO-friendly)
          </label>
          <div class="flex gap-2">
            <input
              v-model="formData.slug"
              type="text"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., my-product-name"
            />
            <button
              v-if="isEditing && formData.slug"
              type="button"
              @click="handleUpdateSlug"
              :disabled="isUpdatingSlug"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {{ isUpdatingSlug ? 'Updating...' : 'Update' }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
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

        <!-- New Product Badge -->
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-sm font-medium text-red-800 mb-3">🔥 Sale Pricing</h3>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Current Price (UAH)
              </label>
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Leave empty if not on sale"
              />
            </div>
          </div>
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

        <!-- Subtitle -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <input
            v-model="formData.subtitle"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Темне, Фільтроване, 6.5°"
          />
          <p class="text-sm text-gray-500 mt-1">
            Short descriptive text shown under the product title
          </p>
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

        <!-- Product Attributes -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-4">
            <label class="block text-sm font-medium text-gray-700">Additional Information</label>
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
              <div class="w-20">
                <select
                  v-model="attribute.color"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Color</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                </select>
              </div>
              <button
                type="button"
                @click="removeAttribute(index)"
                class="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
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



        <!-- Bundle Configuration -->
        <div class="mb-6 border-t pt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">📦 Bundle Configuration</h3>
          <label class="flex items-center mb-4">
            <input
              v-model="formData.is_bundle"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">This is a bundle/gift set product</span>
          </label>

          <div v-if="formData.is_bundle" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Products to Include in Bundle
              </label>
              <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                <div v-if="availableProducts.length === 0" class="text-sm text-gray-500">
                  No products available
                </div>
                <label v-for="product in availableProducts" :key="product.id" class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="isBundleItemSelected(product.id)"
                    @change="toggleBundleItem(product.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ product.display_name }}</span>
                </label>
              </div>
            </div>

            <div v-if="formData.bundle_items && formData.bundle_items.length > 0" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700">Bundle Items Quantities</h4>
              <div
                v-for="(item, index) in formData.bundle_items"
                :key="item.product_id"
                class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-700">
                    {{ getProductName(item.product_id) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600">Qty:</label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    step="1"
                    class="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  @click="removeBundleItem(index)"
                  class="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
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
import type { Product, Category, ProductAttribute } from '@/types'
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
const isUpdatingSlug = ref(false)
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
  slug: '',
  description: '',
  subtitle: '',
  price: 0,
  original_price: 0,
  image_url: '',
  display_image_url: '',
  is_active: true,
  requires_bottles: false,
  is_new: false,
  new_until: '',
  sale_expires_at: '',
  custom_quantity: null as number | null,
  custom_unit: '',
  quantity_step: null as number | null,
  min_quantity: null as number | null,
  max_quantity: null as number | null,
  attributes: [] as ProductAttribute[],
  is_bundle: false,
  bundle_items: [] as Array<{ product_id: string; quantity: number }>
})

const allProducts = ref<Product[]>([])

// Watch for modal open to load all products
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    try {
      // Always fetch products when modal opens to ensure we have the latest list
      const response = await backendApi.get('/products/admin/all?includeInactive=true')
      allProducts.value = response.data as Product[]
      console.log('Loaded products for bundle selection:', allProducts.value.length)
    } catch (error) {
      console.error('Failed to load products:', error)
      allProducts.value = []
    }
  }
})

// Watch for product changes to populate form
watch(() => props.product, (newProduct) => {

  if (newProduct) {
    // Parse attributes if they exist
    let attributes = []
    if (newProduct.attributes) {
      try {
        if (typeof newProduct.attributes === 'string') {
          attributes = JSON.parse(newProduct.attributes)
        } else if (Array.isArray(newProduct.attributes)) {
          attributes = newProduct.attributes
        }
      } catch (e) {
        console.warn('Failed to parse product attributes:', e)
        attributes = []
      }
    }

    // Parse bundle_items if they exist
    let bundleItems = []
    if (newProduct.bundle_items) {
      try {
        if (typeof newProduct.bundle_items === 'string') {
          bundleItems = JSON.parse(newProduct.bundle_items)
        } else if (Array.isArray(newProduct.bundle_items)) {
          bundleItems = newProduct.bundle_items
        }
      } catch (e) {
        console.warn('Failed to parse bundle items:', e)
        bundleItems = []
      }
    }

    formData.value = {
      poster_product_id: newProduct.poster_product_id || '',
      category_id: newProduct.category_id || '',
      name: newProduct.name || '',
      display_name: newProduct.display_name || '',
      slug: newProduct.slug || '',
      description: newProduct.description || '',
      subtitle: newProduct.subtitle || '',
      price: newProduct.price || 0,
      original_price: newProduct.original_price || 0,
      image_url: newProduct.image_url || '',
      display_image_url: newProduct.display_image_url || '',
      is_active: newProduct.is_active,
      requires_bottles: newProduct.requires_bottles || false,
      is_new: newProduct.is_new || false,
      new_until: newProduct.new_until ? new Date(newProduct.new_until).toISOString().slice(0, 16) : '',
      sale_expires_at: newProduct.sale_expires_at ? new Date(newProduct.sale_expires_at).toISOString().slice(0, 16) : '',
      custom_quantity: newProduct.custom_quantity || null,
      custom_unit: newProduct.custom_unit || '',
      quantity_step: newProduct.quantity_step || null,
      min_quantity: newProduct.min_quantity || null,
      max_quantity: newProduct.max_quantity || null,
      attributes: attributes,
      is_bundle: newProduct.is_bundle || false,
      bundle_items: bundleItems
    }


  } else {
    // Reset form for new product
    formData.value = {
      poster_product_id: '',
      category_id: '',
      name: '',
      display_name: '',
      slug: '',
      description: '',
      subtitle: '',
      price: 0,
      original_price: 0,
      image_url: '',
      display_image_url: '',
      is_active: true,
      requires_bottles: false,
      is_new: false,
      new_until: '',
      sale_expires_at: '',
      custom_quantity: null,
      custom_unit: '',
      quantity_step: null,
      min_quantity: null,
      max_quantity: null,
      attributes: [],
      is_bundle: false,
      bundle_items: []
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

// Computed property for available products (exclude current product)
const availableProducts = computed(() => {
  return allProducts.value.filter(p => p.id !== props.product?.id)
})

// Bundle item management methods
const isBundleItemSelected = (productId: string): boolean => {
  return formData.value.bundle_items.some(item => item.product_id === productId)
}

const toggleBundleItem = (productId: string) => {
  const index = formData.value.bundle_items.findIndex(item => item.product_id === productId)
  if (index >= 0) {
    formData.value.bundle_items.splice(index, 1)
  } else {
    formData.value.bundle_items.push({ product_id: productId, quantity: 1 })
  }
}

const removeBundleItem = (index: number) => {
  formData.value.bundle_items.splice(index, 1)
}

const getProductName = (productId: string): string => {
  const product = allProducts.value.find(p => p.id === productId)
  return product?.display_name || 'Unknown Product'
}

const handleSubmit = async () => {

  isLoading.value = true

  try {
    const productData = {
      ...formData.value,
      name: formData.value.name || formData.value.display_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      display_image_url: formData.value.display_image_url || formData.value.image_url,
      original_price: formData.value.original_price || formData.value.price,
      attributes: formData.value.attributes, // Send as array, backend will stringify
      bundle_items: formData.value.is_bundle ? formData.value.bundle_items : [] // Send bundle items if it's a bundle
    }


    emit('save', productData)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}

const handleUpdateSlug = async () => {
  if (!formData.value.slug || !formData.value.slug.trim()) {
    alert('Please enter a slug')
    return
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(formData.value.slug)) {
    alert('Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)')
    return
  }

  isUpdatingSlug.value = true

  try {
    const response = await backendApi.put(`/products/${props.product?.id}/slug`, {
      slug: formData.value.slug
    })

    if (response.ok) {
      alert('Slug updated successfully!')
    } else {
      const error = await response.json()
      alert(`Error: ${error.error || 'Failed to update slug'}`)
    }
  } catch (error) {
    console.error('Error updating slug:', error)
    alert('Failed to update slug')
  } finally {
    isUpdatingSlug.value = false
  }
}

// Attribute management methods
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
