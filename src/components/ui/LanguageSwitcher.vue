<template>
  <div class="relative">
    <!-- Language Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      :class="{ 'bg-gray-100': isOpen }"
    >
      <span class="text-lg">{{ currentLanguage.flag }}</span>
      <span class="hidden sm:block">{{ currentLanguage.name }}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div class="py-1">
        <button
          v-for="language in availableLanguages"
          :key="language.code"
          @click="selectLanguage(language.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          :class="{ 'bg-blue-50 text-blue-700': language.code === currentLanguage.code }"
        >
          <span class="text-lg mr-3">{{ language.flag }}</span>
          <span>{{ language.name }}</span>
          <svg
            v-if="language.code === currentLanguage.code"
            class="w-4 h-4 ml-auto text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLanguages, changeLanguage, getCurrentLanguage } from '@/i18n'

// Reactive state
const isOpen = ref(false)
const { locale } = useI18n()

// Computed
const currentLanguage = computed(() => getCurrentLanguage())

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectLanguage = (languageCode: string) => {
  changeLanguage(languageCode)
  closeDropdown()
  
  // Show success message
  
}

// Close dropdown on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
