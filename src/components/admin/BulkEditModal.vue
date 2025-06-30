<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">Bulk Edit Products ({{ selectedProductIds.length }} items)</h2>
      
      <div class="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium text-blue-900 mb-2">Selected Products:</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="product in selectedProducts" :key="product.id" 
                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {{ product.display_name }}
          </span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Category -->
        <div class="mb-4">
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="updateFields.category" class="mr-2">
            <span class="text-sm font-medium text-gray-700">Update Category</span>
          </label>
          <select v-model="formData.category_id" 
                  :disabled="!updateFields.category"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.display_name }}
            </option>
          </select>
        </div>

        <!-- Price Adjustment -->
        <div class="mb-4">
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="updateFields.price" class="mr-2">
            <span class="text-sm font-medium text-gray-700">Update Prices</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Adjustment Type</label>
              <select v-model="priceAdjustment.type" 
                      :disabled="!updateFields.price"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
                <option value="set">Set Fixed Price</option>
                <option value="increase_percent">Increase by %</option>
                <option value="decrease_percent">Decrease by %</option>
                <option value="increase_amount">Increase by Amount</option>
                <option value="decrease_amount">Decrease by Amount</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">
                {{ priceAdjustment.type === 'set' ? 'New Price (UAH)' : 
                   priceAdjustment.type.includes('percent') ? 'Percentage' : 'Amount (UAH)' }}
              </label>
              <input v-model.number="priceAdjustment.value"
                     :disabled="!updateFields.price"
                     type="number"
                     step="0.01"
                     min="0"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-4">
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="updateFields.status" class="mr-2">
            <span class="text-sm font-medium text-gray-700">Update Status</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Active Status</label>
              <select v-model="formData.is_active" 
                      :disabled="!updateFields.status"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Bottle Requirement</label>
              <select v-model="formData.requires_bottles" 
                      :disabled="!updateFields.status"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
                <option :value="false">No Bottles Required</option>
                <option :value="true">Bottles Required</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Custom Quantities -->
        <div class="mb-4">
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="updateFields.customQuantity" class="mr-2">
            <span class="text-sm font-medium text-gray-700">Update Custom Quantities</span>
          </label>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Custom Quantity (kg)</label>
              <input v-model.number="formData.custom_quantity"
                     :disabled="!updateFields.customQuantity"
                     type="number"
                     step="0.001"
                     min="0"
                     placeholder="0.05"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Display Unit</label>
              <input v-model="formData.custom_unit"
                     :disabled="!updateFields.customQuantity"
                     type="text"
                     placeholder="г"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Quantity Step (kg)</label>
              <input v-model.number="formData.quantity_step"
                     :disabled="!updateFields.customQuantity"
                     type="number"
                     step="0.001"
                     min="0"
                     placeholder="0.05"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="hasAnyUpdates" class="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 class="font-medium text-yellow-900 mb-2">Preview Changes:</h3>
          <ul class="text-sm text-yellow-800 space-y-1">
            <li v-if="updateFields.category">• Category will be changed to: {{ getCategoryName(formData.category_id) }}</li>
            <li v-if="updateFields.price">• Prices will be {{ getPriceChangeDescription() }}</li>
            <li v-if="updateFields.status">• Status will be updated</li>
            <li v-if="updateFields.customQuantity">• Custom quantities will be updated</li>
          </ul>
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
            :disabled="isLoading || !hasAnyUpdates"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Updating...' : `Update ${selectedProductIds.length} Products` }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product, Category } from '@/types'

interface Props {
  isOpen: boolean
  selectedProductIds: string[]
  products: Product[]
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', updates: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)

const updateFields = ref({
  category: false,
  price: false,
  status: false,
  customQuantity: false
})

const formData = ref({
  category_id: '',
  is_active: true,
  requires_bottles: false,
  custom_quantity: null as number | null,
  custom_unit: '',
  quantity_step: null as number | null
})

const priceAdjustment = ref({
  type: 'set' as 'set' | 'increase_percent' | 'decrease_percent' | 'increase_amount' | 'decrease_amount',
  value: 0
})

const selectedProducts = computed(() => 
  props.products.filter(p => props.selectedProductIds.includes(p.id))
)

const hasAnyUpdates = computed(() => 
  Object.values(updateFields.value).some(Boolean)
)

const getCategoryName = (categoryId: string) => {
  const category = props.categories.find(c => c.id === categoryId)
  return category?.display_name || 'Unknown'
}

const getPriceChangeDescription = () => {
  const { type, value } = priceAdjustment.value
  switch (type) {
    case 'set': return `set to ${value} ₴`
    case 'increase_percent': return `increased by ${value}%`
    case 'decrease_percent': return `decreased by ${value}%`
    case 'increase_amount': return `increased by ${value} ₴`
    case 'decrease_amount': return `decreased by ${value} ₴`
    default: return 'updated'
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    updateFields.value = {
      category: false,
      price: false,
      status: false,
      customQuantity: false
    }
    formData.value = {
      category_id: '',
      is_active: true,
      requires_bottles: false,
      custom_quantity: null,
      custom_unit: '',
      quantity_step: null
    }
    priceAdjustment.value = {
      type: 'set',
      value: 0
    }
  }
})

const handleSubmit = async () => {
  isLoading.value = true

  try {
    const updates: any = {
      productIds: props.selectedProductIds,
      updates: {}
    }

    if (updateFields.value.category) {
      updates.updates.category_id = formData.value.category_id
    }

    if (updateFields.value.price) {
      updates.updates.priceAdjustment = priceAdjustment.value
    }

    if (updateFields.value.status) {
      updates.updates.is_active = formData.value.is_active
      updates.updates.requires_bottles = formData.value.requires_bottles
    }

    if (updateFields.value.customQuantity) {
      updates.updates.custom_quantity = formData.value.custom_quantity
      updates.updates.custom_unit = formData.value.custom_unit
      updates.updates.quantity_step = formData.value.quantity_step
    }

    emit('save', updates)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}
</script>
