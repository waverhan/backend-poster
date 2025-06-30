<template>
  <div class="relative">
    <!-- Theme Toggle Button -->
    <button
      @click="toggleTheme"
      class="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <!-- Sun Icon (Light Mode) -->
      <svg
        v-if="!isDark"
        class="w-5 h-5 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      <!-- Moon Icon (Dark Mode) -->
      <svg
        v-else
        class="w-5 h-5 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>

    <!-- Dropdown Menu (Optional - for advanced options) -->
    <div
      v-if="showDropdown"
      class="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
      @click.stop
    >
      <button
        @click="setLightMode"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        :class="{ 'bg-gray-100 dark:bg-gray-700': !isDark && !isSystemPreference }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Light</span>
      </button>
      
      <button
        @click="setDarkMode"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        :class="{ 'bg-gray-100 dark:bg-gray-700': isDark && !isSystemPreference }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <span>Dark</span>
      </button>
      
      <button
        @click="useSystemPreference"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        :class="{ 'bg-gray-100 dark:bg-gray-700': isSystemPreference }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>System</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDarkModeStore } from '@/stores/darkMode'

interface Props {
  showDropdown?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDropdown: false
})

const darkModeStore = useDarkModeStore()
const showDropdown = ref(false)

// Computed
const isDark = computed(() => darkModeStore.isDark)
const isSystemPreference = computed(() => darkModeStore.isSystemPreference)

// Methods
const toggleTheme = () => {
  if (props.showDropdown) {
    showDropdown.value = !showDropdown.value
  } else {
    darkModeStore.toggleDarkMode()
  }
}

const setLightMode = () => {
  darkModeStore.setDarkMode(false)
  showDropdown.value = false
}

const setDarkMode = () => {
  darkModeStore.setDarkMode(true)
  showDropdown.value = false
}

const useSystemPreference = () => {
  darkModeStore.useSystemPreference()
  showDropdown.value = false
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
