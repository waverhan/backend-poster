<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Admin Access Required</h3>
        <p class="text-sm text-gray-500 mt-2">
          Please enter the admin password to access the admin panel.
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Admin Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter admin password"
            :disabled="authStore.isLoading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ authStore.error }}</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="authStore.isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="authStore.isLoading || !password.trim()"
          >
            <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </div>
      </form>

      <!-- Help Text -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500">
          Default password: <code class="bg-gray-100 px-1 rounded">admin123</code>
        </p>
        <p class="text-xs text-gray-400 mt-1">
          (Change this in production via VITE_ADMIN_PASSWORD environment variable)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const password = ref('')

const handleSubmit = async () => {
  if (!password.value.trim()) return

  const success = await authStore.adminLogin(password.value)
  
  if (success) {
    emit('success')
  }
  // Error is handled by the store and displayed in the template
}
</script>
