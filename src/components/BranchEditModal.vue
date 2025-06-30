<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ branch ? 'Edit Branch' : 'Add New Branch' }}
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
          <!-- Branch Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Branch Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              placeholder="e.g., Branch 4, Main Store, Downtown Location"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Display Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              v-model="formData.display_name"
              type="text"
              placeholder="Friendly name for customers"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              v-model="formData.address"
              required
              rows="3"
              placeholder="Full address including street, city, postal code"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Coordinates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                v-model.number="formData.latitude"
                type="number"
                step="any"
                placeholder="e.g., 50.4501"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                v-model.number="formData.longitude"
                type="number"
                step="any"
                placeholder="e.g., 30.5234"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="+380 XX XXX XXXX"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                placeholder="branch@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Working Hours -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Working Hours
            </label>
            <input
              v-model="formData.working_hours"
              type="text"
              placeholder="e.g., Mon-Sun: 9:00-22:00"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Services -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-4">
              Available Services
            </label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="formData.pickup_available"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Pickup Available</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="formData.delivery_available"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Delivery Available</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="formData.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving...' : (branch ? 'Update Branch' : 'Create Branch') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Branch } from '@/types'

interface Props {
  isOpen: boolean
  branch?: Branch | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', branch: Partial<Branch>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isSubmitting = ref(false)

const formData = ref({
  name: '',
  display_name: '',
  address: '',
  latitude: null as number | null,
  longitude: null as number | null,
  phone: '',
  email: '',
  working_hours: '',
  pickup_available: true,
  delivery_available: true,
  is_active: true
})

// Watch for branch changes to populate form
watch(() => props.branch, (newBranch) => {
  if (newBranch) {
    formData.value = {
      name: newBranch.name || '',
      display_name: newBranch.display_name || '',
      address: newBranch.address || '',
      latitude: newBranch.latitude || null,
      longitude: newBranch.longitude || null,
      phone: newBranch.phone || '',
      email: newBranch.email || '',
      working_hours: newBranch.working_hours || '',
      pickup_available: newBranch.pickup_available ?? true,
      delivery_available: newBranch.delivery_available ?? true,
      is_active: newBranch.is_active ?? true
    }
  } else {
    // Reset form for new branch
    formData.value = {
      name: '',
      display_name: '',
      address: '',
      latitude: null,
      longitude: null,
      phone: '',
      email: '',
      working_hours: '',
      pickup_available: true,
      delivery_available: true,
      is_active: true
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    emit('save', formData.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
