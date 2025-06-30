<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h2>
      
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

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category description"
          ></textarea>
        </div>

        <!-- Image URL -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            v-model="formData.image_url"
            type="url"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <!-- Sort Order -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <input
            v-model.number="formData.sort_order"
            type="number"
            min="0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <!-- Active Status -->
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="formData.is_active"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Active</span>
          </label>
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
import type { Category } from '@/types'

interface Props {
  isOpen: boolean
  category?: Category | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', category: Partial<Category>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isLoading = ref(false)

const isEditing = computed(() => !!props.category)

const formData = ref({
  name: '',
  display_name: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: true
})

// Watch for category changes to populate form
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formData.value = {
      name: newCategory.name || '',
      display_name: newCategory.display_name || '',
      description: newCategory.description || '',
      image_url: newCategory.image_url || '',
      sort_order: newCategory.sort_order || 0,
      is_active: newCategory.is_active
    }
  } else {
    // Reset form for new category
    formData.value = {
      name: '',
      display_name: '',
      description: '',
      image_url: '',
      sort_order: 0,
      is_active: true
    }
  }
}, { immediate: true })

// Auto-generate name from display_name if not provided
watch(() => formData.value.display_name, (newDisplayName) => {
  if (!formData.value.name && newDisplayName) {
    formData.value.name = newDisplayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }
})

const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    const categoryData = {
      ...formData.value,
      name: formData.value.name || formData.value.display_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }
    
    emit('save', categoryData)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}
</script>
