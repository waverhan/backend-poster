<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6 relative">
      <!-- Close button -->
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          {{ step === 'phone' ? 'Вхід до особистого кабінету' : 'Підтвердження номера' }}
        </h2>
        <p class="text-gray-600">
          {{ step === 'phone' 
            ? 'Введіть номер телефону для входу або реєстрації' 
            : `Введіть код з SMS, надісланий на ${formatPhoneNumber(phoneNumber)}` 
          }}
        </p>
      </div>

      <!-- Phone input step -->
      <div v-if="step === 'phone'" class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Номер телефону
          </label>
          <input
            id="phone"
            v-model="phoneNumber"
            type="tel"
            placeholder="0XX XXX XX XX"
            maxlength="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            :class="{ 'border-red-500': phoneError }"
            @input="onPhoneInput"
            @keyup.enter="sendCode"
          />
          <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
          <p class="text-gray-500 text-xs mt-1">Введіть номер у форматі 0XX XXX XX XX</p>
        </div>

        <button
          @click="sendCode"
          :disabled="!isPhoneValid || authStore.isLoading"
          class="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Надсилання...
          </span>
          <span v-else>Отримати код</span>
        </button>
      </div>

      <!-- Verification code step -->
      <div v-if="step === 'verification'" class="space-y-4">
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
            Код підтвердження
          </label>
          <input
            id="code"
            v-model="verificationCode"
            type="text"
            placeholder="XXXX"
            maxlength="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
            :class="{ 'border-red-500': codeError }"
            @input="onCodeInput"
            @keyup.enter="verifyCode"
          />
          <p v-if="codeError" class="text-red-500 text-sm mt-1">{{ codeError }}</p>
        </div>

        <!-- Name input for new users -->
        <div v-if="showNameInput">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Ваше ім'я
          </label>
          <input
            id="name"
            v-model="userName"
            type="text"
            placeholder="Введіть ваше ім'я"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            @keyup.enter="verifyCode"
          />
          <p class="text-gray-500 text-xs mt-1">Це ім'я буде використовуватися для замовлень</p>
        </div>

        <button
          @click="verifyCode"
          :disabled="!isCodeValid || authStore.isLoading"
          class="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Перевірка...
          </span>
          <span v-else>Підтвердити</span>
        </button>

        <!-- Resend code -->
        <div class="text-center">
          <button
            v-if="canResendCode"
            @click="resendCode"
            class="text-orange-500 hover:text-orange-600 text-sm"
          >
            Надіслати код повторно
          </button>
          <p v-else class="text-gray-500 text-sm">
            Повторно надіслати код можна через {{ resendCountdown }} сек
          </p>
        </div>

        <!-- Back to phone -->
        <div class="text-center">
          <button
            @click="goBackToPhone"
            class="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Змінити номер телефону
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="authStore.error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ authStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Emits
const emit = defineEmits<{
  close: []
  success: [user: any]
}>()

// Store
const authStore = useAuthStore()

// State
const step = ref<'phone' | 'verification'>('phone')
const phoneNumber = ref('')
const verificationCode = ref('')
const userName = ref('')
const phoneError = ref('')
const codeError = ref('')
const showNameInput = ref(false)
const resendCountdown = ref(0)
const resendTimer = ref<number | null>(null)

// Computed
const isPhoneValid = computed(() => {
  return authStore.validatePhoneNumber(phoneNumber.value)
})

const isCodeValid = computed(() => {
  return verificationCode.value.length === 4 && /^\d{4}$/.test(verificationCode.value)
})

const canResendCode = computed(() => {
  return resendCountdown.value === 0
})

// Methods
const formatPhoneNumber = (phone: string) => {
  return authStore.formatPhoneNumber(phone)
}

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
  
  phoneNumber.value = value
  phoneError.value = ''
  authStore.clearError()
}

const onCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^\d]/g, '')
  
  if (value.length > 4) {
    value = value.slice(0, 4)
  }
  
  verificationCode.value = value
  codeError.value = ''
  authStore.clearError()
}

const sendCode = async () => {
  phoneError.value = ''
  authStore.clearError()
  
  if (!isPhoneValid.value) {
    phoneError.value = 'Введіть коректний номер телефону'
    return
  }
  
  try {
    await authStore.sendVerificationCode(phoneNumber.value)
    step.value = 'verification'
    startResendCountdown()
  } catch (error: any) {
    phoneError.value = error.message
  }
}

const verifyCode = async () => {
  codeError.value = ''
  authStore.clearError()
  
  if (!isCodeValid.value) {
    codeError.value = 'Введіть 4-значний код'
    return
  }
  
  if (showNameInput.value && !userName.value.trim()) {
    codeError.value = 'Введіть ваше ім\'я'
    return
  }
  
  try {
    const result = await authStore.verifyCodeAndLogin(
      phoneNumber.value, 
      verificationCode.value,
      userName.value.trim() || undefined
    )
    
    emit('success', result.user)
    emit('close')
  } catch (error: any) {
    codeError.value = error.message
    
    // If it's a new user, show name input
    if (error.message.includes('name') || error.message.includes('ім\'я')) {
      showNameInput.value = true
    }
  }
}

const resendCode = async () => {
  try {
    await authStore.sendVerificationCode(phoneNumber.value)
    startResendCountdown()
  } catch (error: any) {
    codeError.value = error.message
  }
}

const goBackToPhone = () => {
  step.value = 'phone'
  verificationCode.value = ''
  userName.value = ''
  showNameInput.value = false
  codeError.value = ''
  authStore.clearError()
}

const startResendCountdown = () => {
  resendCountdown.value = 60
  
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
  }
  
  resendTimer.value = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer.value!)
      resendTimer.value = null
    }
  }, 1000)
}

// Cleanup
onUnmounted(() => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
  }
})

// Auto-focus inputs
onMounted(() => {
  const phoneInput = document.getElementById('phone')
  if (phoneInput) {
    phoneInput.focus()
  }
})
</script>
