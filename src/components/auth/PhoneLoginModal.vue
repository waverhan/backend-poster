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
        <!-- Login method selection -->
        <div class="flex space-x-2 mb-4">
          <button
            @click="loginMethod = 'sms'"
            :disabled="userHasPassword"
            :class="[
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              loginMethod === 'sms'
                ? 'bg-orange-600 text-white'
                : userHasPassword
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            SMS код
          </button>
          <button
            @click="loginMethod = 'password'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              loginMethod === 'password'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Пароль
          </button>
        </div>

        <!-- SMS disabled message -->
        <div v-if="userHasPassword && loginMethod === 'sms'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-blue-700 text-sm">
            Для цього номера вже встановлено пароль. Використайте пароль для входу.
          </p>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Номер телефону
          </label>
          <input
            id="phone"
            :value="formatPhoneDisplay(phoneNumber)"
            type="tel"
            placeholder="0XX XXX XX XX"
            maxlength="14"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            :class="{ 'border-red-500': phoneError }"
            @input="onPhoneInput"
            @keyup.enter="loginMethod === 'sms' ? sendCode() : loginWithPassword()"
          />
          <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
          <p class="text-gray-500 text-xs mt-1">Введіть номер у форматі 0XX XXX XX XX</p>
        </div>

        <!-- Password input for password login -->
        <div v-if="loginMethod === 'password'">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введіть пароль"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              @keyup.enter="loginWithPassword"
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

        <button
          v-if="loginMethod === 'sms'"
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

        <button
          v-if="loginMethod === 'password'"
          @click="loginWithPassword"
          :disabled="!isPhoneValid || !password || authStore.isLoading"
          class="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Вхід...
          </span>
          <span v-else>Увійти</span>
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
  success: [user: any, requiresPasswordSetup?: boolean]
  requiresProfileCompletion: [user: any]
}>()

// Store
const authStore = useAuthStore()

// State
const step = ref<'phone' | 'verification'>('phone')
const loginMethod = ref<'sms' | 'password'>('sms')
const phoneNumber = ref('')
const password = ref('')
const showPassword = ref(false)
const verificationCode = ref('')
const userName = ref('')
const phoneError = ref('')
const codeError = ref('')
const showNameInput = ref(false)
const resendCountdown = ref(0)
const resendTimer = ref<number | null>(null)
const userHasPassword = ref(false)
const checkingUser = ref(false)

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

// Format phone number for display
const formatPhoneDisplay = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Format as 0XX XXX XX XX
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }
}

const onPhoneInput = async (event: Event) => {
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

  // Update the input display with formatted value
  target.value = formatPhoneDisplay(value)

  // Check if user has password when phone number is complete
  if (value.length === 10) {
    await checkUserStatus(value)
  } else {
    userHasPassword.value = false
  }
}

const checkUserStatus = async (phone: string) => {
  if (!authStore.validatePhoneNumber(phone)) return

  checkingUser.value = true
  try {
    const result = await authStore.checkUser(phone)
    userHasPassword.value = result.hasPassword

    // If user has password, switch to password login
    if (result.hasPassword) {
      loginMethod.value = 'password'
    }
  } catch (error) {
    console.error('Failed to check user status:', error)
    userHasPassword.value = false
  } finally {
    checkingUser.value = false
  }
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

  // Check if user already has password
  if (userHasPassword.value) {
    phoneError.value = 'Для цього номера вже встановлено пароль. Використайте пароль для входу.'
    return
  }

  try {
    // Add timeout to prevent hanging (increased to 30 seconds to match backend)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Час очікування вичерпано. Спробуйте ще раз.')), 30000)
    })

    const sendPromise = authStore.sendVerificationCode(phoneNumber.value)
    await Promise.race([sendPromise, timeoutPromise])

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
    // Add timeout to prevent hanging (reduced to 30 seconds to match backend)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Час очікування вичерпано. Спробуйте ще раз.')), 30000)
    })

    const verificationPromise = authStore.verifyCodeAndLogin(
      phoneNumber.value,
      verificationCode.value,
      userName.value.trim() || undefined
    )

    const result = await Promise.race([verificationPromise, timeoutPromise])

    // All SMS verified users must complete profile (mandatory)
    emit('requiresProfileCompletion', result.user)
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
    // Add timeout to prevent hanging (increased to 30 seconds to match backend)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Час очікування вичерпано. Спробуйте ще раз.')), 30000)
    })

    const sendPromise = authStore.sendVerificationCode(phoneNumber.value)
    await Promise.race([sendPromise, timeoutPromise])

    startResendCountdown()
  } catch (error: any) {
    codeError.value = error.message
  }
}

const loginWithPassword = async () => {
  if (!isPhoneValid.value || !password.value) return

  try {
    phoneError.value = ''
    const result = await authStore.loginWithPassword(phoneNumber.value, password.value)

    // Check if user needs to set up password
    if (result.requiresPasswordSetup) {
      // This shouldn't happen for password login, but handle it just in case
      emit('success', result.user)
    } else {
      emit('success', result.user)
    }
  } catch (error: any) {
    console.error('Password login failed:', error)

    if (error.message.includes('Password not set')) {
      phoneError.value = 'Пароль не встановлено. Використайте SMS для входу.'
      loginMethod.value = 'sms'
    } else if (error.message.includes('Invalid password')) {
      phoneError.value = 'Невірний пароль'
    } else if (error.message.includes('User not found')) {
      phoneError.value = 'Користувач не знайдений. Спочатку зареєструйтесь.'
    } else {
      phoneError.value = 'Помилка входу. Спробуйте ще раз.'
    }
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
