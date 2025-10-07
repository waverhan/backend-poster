<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Вхід з паролем</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Phone Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Номер телефону
          </label>
          <input
            v-model="phone"
            type="tel"
            placeholder="0XX XXX XX XX"
            maxlength="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': !isPhoneValid && phone }"
            @input="onPhoneInput"
            required
          />
          <div v-if="!isPhoneValid && phone" class="text-red-500 text-sm mt-1">
            Введіть номер у форматі 0XX XXX XX XX
          </div>
        </div>

        <!-- Password Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введіть пароль"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {{ loading ? 'Вхід...' : 'Увійти' }}
          </button>
          
          <button
            type="button"
            @click="$emit('switchToSms')"
            class="w-full text-blue-600 hover:text-blue-700 text-sm transition-colors"
          >
            Увійти через SMS
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
  switchToSms: []
  success: [user: any]
}>()

// Store
const authStore = useAuthStore()

// State
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Computed
const isPhoneValid = computed(() => {
  return phone.value.length === 10 && phone.value.startsWith('0') && /^\d{10}$/.test(phone.value)
})

const isFormValid = computed(() => {
  return isPhoneValid.value && password.value.length > 0
})

// Methods
const onPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^\d]/g, '')
  
  // Ensure it starts with 0 and is max 10 digits
  if (value.length > 0 && !value.startsWith('0')) {
    value = '0' + value.slice(0, 9)
  }
  if (value.length > 10) {
    value = value.slice(0, 10)
  }
  
  phone.value = value
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.loginWithPassword(phone.value, password.value)
    emit('success', result.user)
  } catch (error: any) {
    console.error('Password login failed:', error)
    
    if (error.response?.data?.requiresSmsLogin) {
      errorMessage.value = 'Пароль не встановлено. Використайте SMS для входу.'
    } else if (error.response?.data?.error === 'Invalid password') {
      errorMessage.value = 'Невірний пароль'
    } else if (error.response?.data?.error === 'User not found. Please register first.') {
      errorMessage.value = 'Користувач не знайдений. Спочатку зареєструйтесь.'
    } else {
      errorMessage.value = 'Помилка входу. Спробуйте ще раз.'
    }
  } finally {
    loading.value = false
  }
}
</script>
