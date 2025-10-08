<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Особистий кабінет</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Керуйте своїм профілем та переглядайте бонуси</p>
      </div>

      <!-- Login Required -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-12">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Увійдіть до особистого кабінету</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Для перегляду профілю та бонусів необхідно увійти в систему</p>
          <button
            @click="showLoginModal = true"
            class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Увійти
          </button>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Bonus Display -->
        <BonusDisplay />

        <!-- Profile Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Інформація профілю</h2>
            <button
              @click="isEditing = !isEditing"
              class="text-orange-500 hover:text-orange-600 transition-colors"
            >
              {{ isEditing ? 'Скасувати' : 'Редагувати' }}
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ім'я
                </label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  :disabled="!isEditing"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Телефон
                </label>
                <input
                  id="phone"
                  :value="formatPhoneNumber(authStore.user?.phone || '')"
                  type="text"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Номер телефону не можна змінити</p>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (необов'язково)
                </label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  :disabled="!isEditing"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <!-- Poster Client ID (if available) -->
              <div v-if="authStore.user?.posterClientId">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID клієнта в системі
                </label>
                <input
                  :value="authStore.user.posterClientId"
                  type="text"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Save Button -->
            <div v-if="isEditing" class="flex justify-end space-x-3">
              <button
                type="button"
                @click="cancelEdit"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Скасувати
              </button>
              <button
                type="submit"
                :disabled="authStore.isLoading"
                class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="authStore.isLoading">Збереження...</span>
                <span v-else>Зберегти</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Password Management -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Безпека</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Пароль для входу</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ authStore.user?.is_password_set ? 'Пароль встановлено' : 'Пароль не встановлено' }}
                </p>
              </div>
              <button
                @click="showPasswordModal = true"
                class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                {{ authStore.user?.is_password_set ? 'Змінити пароль' : 'Встановити пароль' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Bonus History (Placeholder) -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Історія бонусів</h2>
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>Історія нарахування та використання бонусів буде доступна незабаром</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Швидкі дії</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link
              to="/shop"
              class="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Магазин</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Переглянути товари</p>
              </div>
            </router-link>

            <router-link
              to="/orders"
              class="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Мої замовлення</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Історія покупок</p>
              </div>
            </router-link>

            <button
              @click="refreshBonusInfo"
              :disabled="isRefreshing"
              class="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-6 h-6 text-orange-500" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">Оновити бонуси</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Синхронізувати з системою</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <PhoneLoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @success="onLoginSuccess"
    />

    <!-- Password Setup Modal -->
    <PasswordSetupModal
      v-if="showPasswordModal"
      @close="showPasswordModal = false"
      @skip="showPasswordModal = false"
      @success="onPasswordSetupSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BonusDisplay from '@/components/auth/BonusDisplay.vue'
import PhoneLoginModal from '@/components/auth/PhoneLoginModal.vue'
import PasswordSetupModal from '@/components/auth/PasswordSetupModal.vue'

// Store
const authStore = useAuthStore()

// State
const showLoginModal = ref(false)
const showPasswordModal = ref(false)
const isEditing = ref(false)
const isRefreshing = ref(false)

const profileForm = reactive({
  name: '',
  email: ''
})

// Methods
const formatPhoneNumber = (phone: string) => {
  return authStore.formatPhoneNumber(phone)
}

const loadProfileData = () => {
  if (authStore.user) {
    profileForm.name = authStore.user.name || ''
    profileForm.email = authStore.user.email || ''
  }
}

const saveProfile = async () => {
  try {
    await authStore.updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim() || undefined
    })
    isEditing.value = false
  } catch (error) {
    console.error('Failed to save profile:', error)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  loadProfileData() // Reset form data
}

const refreshBonusInfo = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    await authStore.getBonusInfo()
  } catch (error) {
    console.error('Failed to refresh bonus info:', error)
  } finally {
    isRefreshing.value = false
  }
}

const onLoginSuccess = () => {
  showLoginModal.value = false
  loadProfileData()
}

const onPasswordSetupSuccess = () => {
  showPasswordModal.value = false
  console.log('Password setup completed')
}

// Initialize
onMounted(() => {
  loadProfileData()
})
</script>
