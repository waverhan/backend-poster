import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
  // State
  const isDark = ref(false)
  const isSystemPreference = ref(true)

  // Getters
  const currentTheme = computed(() => isDark.value ? 'dark' : 'light')
  const systemPrefersDark = computed(() => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Actions
  const toggleDarkMode = () => {
    isSystemPreference.value = false
    isDark.value = !isDark.value
    applyTheme()
    saveToStorage()
  }

  const setDarkMode = (dark: boolean) => {
    isSystemPreference.value = false
    isDark.value = dark
    applyTheme()
    saveToStorage()
  }

  const useSystemPreference = () => {
    isSystemPreference.value = true
    isDark.value = systemPrefersDark.value
    applyTheme()
    saveToStorage()
  }

  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('darkMode', JSON.stringify({
        isDark: isDark.value,
        isSystemPreference: isSystemPreference.value
      }))
    } catch (error) {
      console.error('Failed to save dark mode preference:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('darkMode')
      if (saved) {
        const { isDark: savedIsDark, isSystemPreference: savedIsSystemPreference } = JSON.parse(saved)
        isSystemPreference.value = savedIsSystemPreference ?? true
        
        if (isSystemPreference.value) {
          isDark.value = systemPrefersDark.value
        } else {
          isDark.value = savedIsDark ?? false
        }
      } else {
        // First time - use system preference
        isDark.value = systemPrefersDark.value
      }
    } catch (error) {
      console.error('Failed to load dark mode preference:', error)
      isDark.value = systemPrefersDark.value
    }
  }

  const initialize = () => {
    loadFromStorage()
    applyTheme()
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (isSystemPreference.value) {
          isDark.value = e.matches
          applyTheme()
        }
      })
    }
  }

  // Watch for changes and apply theme
  watch(isDark, () => {
    applyTheme()
  })

  return {
    // State
    isDark,
    isSystemPreference,
    
    // Getters
    currentTheme,
    systemPrefersDark,
    
    // Actions
    toggleDarkMode,
    setDarkMode,
    useSystemPreference,
    applyTheme,
    saveToStorage,
    loadFromStorage,
    initialize
  }
})
