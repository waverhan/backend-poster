<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Встановіть пароль</h2>
        <p class="text-gray-600 mt-2">Для зручності входу в майбутньому встановіть пароль</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Password Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Пароль *
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введіть пароль (мінімум 6 символів)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': passwordError }"
              required
              minlength="6"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          <div v-if="passwordError" class="text-red-500 text-sm mt-1">
            {{ passwordError }}
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Підтвердіть пароль *
          </label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Повторіть пароль"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': confirmPasswordError }"
              required
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          <div v-if="confirmPasswordError" class="text-red-500 text-sm mt-1">
            {{ confirmPasswordError }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            type="button"
            @click="$emit('skip')"
            class="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Пропустити
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {{ loading ? 'Збереження...' : 'Встановити пароль' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Emits
const emit = defineEmits<{
  close: []
  skip: []
  success: []
}>()

// Store
const authStore = useAuthStore()

// State
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

// Computed
const passwordError = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 6) return 'Пароль повинен містити мінімум 6 символів'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return ''
  if (password.value !== confirmPassword.value) return 'Паролі не співпадають'
  return ''
})

const isFormValid = computed(() => {
  return password.value.length >= 6 && 
         password.value === confirmPassword.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    await authStore.setPassword(password.value)
    emit('success')
  } catch (error) {
    console.error('Failed to set password:', error)
  } finally {
    loading.value = false
  }
}
</script>
