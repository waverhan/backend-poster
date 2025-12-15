<template>
  <div
    v-if="showConsent"
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6"
  >
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">🍪 Зберігаємо кукі-файли</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Ми збираємо необхідні кукі-файли, щоб сайт працював справно. 
            Докладніше — 
            <router-link 
              to="/privacy-policy" 
              class="text-blue-600 hover:text-blue-800 underline"
            >
              Політиці приватності
            </router-link>.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            @click="acceptCookies"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Гаразд
          </button>
          <button
            @click="showSettings = true"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Налаштування
          </button>
        </div>
      </div>
    </div>

    <!-- Cookie Settings Modal -->
    <div
      v-if="showSettings"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
      @click.self="showSettings = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Налаштування кукі-файлів</h2>
            <button
              @click="showSettings = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <div class="border-b pb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Необхідні кукі-файли</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Ці кукі-файли необхідні для роботи сайту і не можуть бути відключені.
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-500">Завжди активні</span>
                </div>
              </div>
            </div>

            <div class="border-b pb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Функціональні кукі-файли</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Запам'ятовують ваші налаштування та вибір для покращення досвіду.
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="cookieSettings.functional"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div class="border-b pb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Аналітичні кукі-файли</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Допомагають нам зрозуміти, як ви використовуєте сайт, щоб покращити його.
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="cookieSettings.analytics"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Маркетингові кукі-файли</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Використовуються для показу релевантної реклами та пропозицій.
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="cookieSettings.marketing"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              @click="saveSettings"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Зберегти налаштування
            </button>
            <button
              @click="acceptAllCookies"
              class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Прийняти всі
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showConsent = ref(false)
const showSettings = ref(false)

const cookieSettings = ref({
  necessary: true, // Always true, cannot be disabled
  functional: true,
  analytics: true,
  marketing: false
})

const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_SETTINGS_KEY = 'cookie-settings'

onMounted(() => {
  // Check if user has already given consent
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) {
    showConsent.value = true
  } else {
    // Load saved settings
    const savedSettings = localStorage.getItem(COOKIE_SETTINGS_KEY)
    if (savedSettings) {
      cookieSettings.value = { ...cookieSettings.value, ...JSON.parse(savedSettings) }
    }
  }
})

const acceptCookies = () => {
  // Accept all cookies by default
  acceptAllCookies()
}

const acceptAllCookies = () => {
  cookieSettings.value = {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  }
  saveSettings()
}

const saveSettings = () => {
  // Save consent and settings
  localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
  localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(cookieSettings.value))
  
  // Hide consent banner and settings modal
  showConsent.value = false
  showSettings.value = false
  
  // Initialize analytics and other services based on settings
  initializeServices()
}

const initializeServices = () => {
  // Initialize services based on cookie settings
  if (cookieSettings.value.analytics) {
    // Initialize analytics (Google Analytics, etc.)
    
  }
  
  if (cookieSettings.value.marketing) {
    // Initialize marketing tools
    
  }
  
  if (cookieSettings.value.functional) {
    // Initialize functional features
    
  }
}

// Expose method to check if specific cookie type is allowed
const isCookieAllowed = (type: keyof typeof cookieSettings.value) => {
  return cookieSettings.value[type]
}

// Expose method for other components to use
defineExpose({
  isCookieAllowed
})
</script>
