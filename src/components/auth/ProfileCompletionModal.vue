<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 00-8 0v4h8z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Завершіть реєстрацію</h2>
        <p class="text-gray-600 mt-2">Заповніть профіль та встановіть пароль для майбутніх входів</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ім'я *
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Введіть ваше ім'я"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            :class="{ 'border-red-500': errors.name }"
            required
          />
          <div v-if="errors.name" class="text-red-500 text-sm mt-1">
            {{ errors.name }}
          </div>
        </div>

        <!-- Email Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email (необов'язково)
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Введіть ваш email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            :class="{ 'border-red-500': errors.email }"
          />
          <div v-if="errors.email" class="text-red-500 text-sm mt-1">
            {{ errors.email }}
          </div>
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Пароль *
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введіть пароль (мінімум 6 символів)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              :class="{ 'border-red-500': errors.password }"
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
          <div v-if="errors.password" class="text-red-500 text-sm mt-1">
            {{ errors.password }}
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Підтвердіть пароль *
          </label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Повторіть пароль"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              :class="{ 'border-red-500': errors.confirmPassword }"
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
          <div v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {{ loading ? 'Збереження...' : 'Завершити реєстрацію' }}
        </button>
      </form>

      <!-- Note -->
      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-blue-700 text-sm">
          <strong>Важливо:</strong> Після встановлення паролю ви зможете входити тільки через пароль. SMS-коди більше не будуть доступні.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Props
interface Props {
  user: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  success: []
}>()

// Store
const authStore = useAuthStore()

// State
const form = ref({
  name: props.user?.name || '',
  email: props.user?.email || '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.password.length >= 6 &&
         form.value.password === form.value.confirmPassword &&
         !errors.value.name &&
         !errors.value.email &&
         !errors.value.password &&
         !errors.value.confirmPassword
})

// Methods
const validateForm = () => {
  errors.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  if (!form.value.name.trim()) {
    errors.value.name = "Ім'я є обов'язковим"
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Введіть коректний email'
  }

  if (form.value.password.length < 6) {
    errors.value.password = 'Пароль повинен містити мінімум 6 символів'
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Паролі не співпадають'
  }

  return Object.values(errors.value).every(error => !error)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    // Update profile
    await authStore.updateProfile({
      name: form.value.name.trim(),
      email: form.value.email.trim() || undefined
    })

    // Set password
    await authStore.setPassword(form.value.password)

    emit('success')
  } catch (error) {
    console.error('Failed to complete profile:', error)
  } finally {
    loading.value = false
  }
}
</script>
