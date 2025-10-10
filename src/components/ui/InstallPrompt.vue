<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="showPrompt"
      class="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-700 to-red-600 text-white shadow-2xl border-t-4 border-yellow-400"
    >
      <div class="px-4 py-4 max-w-md mx-auto">
        <div class="flex items-start space-x-3">
          <!-- Opillia Logo -->
          <div class="flex-shrink-0">
            <img 
              src="/opillia-192x192.png" 
              alt="Опілля" 
              class="w-12 h-12 rounded-lg shadow-md"
            />
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-white mb-1">
              Додайте Опілля на головний екран!
            </h3>
            <p class="text-red-100 text-sm mb-3 leading-relaxed">
              Швидкий доступ до найкращих напоїв та делікатесів прямо з вашого телефону
            </p>
            
            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <button
                @click="installApp"
                class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-red-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                📱 Додати на екран
              </button>
              <button
                @click="dismissPrompt"
                class="px-3 py-2 text-red-200 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <!-- iOS Instructions -->
        <div v-if="isIOS && !isStandalone" class="mt-4 pt-3 border-t border-red-500">
          <p class="text-red-100 text-xs mb-2">
            📱 <strong>Для iPhone/iPad:</strong>
          </p>
          <div class="flex items-center space-x-2 text-xs text-red-100">
            <span>1. Натисніть</span>
            <div class="bg-red-800 px-2 py-1 rounded">
              <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6L9 7h2l-1-1zM6 10l1-1v2l-1-1zm8 0l-1 1V9l1 1zm-4 4l1-1H9l1 1z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span>2. "Додати на головний екран"</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Reactive state
const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

// Device detection
const isIOS = computed(() => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
})

const isStandalone = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
})

const isAndroid = computed(() => {
  return /Android/.test(navigator.userAgent)
})

// Check if app should show install prompt
const shouldShowPrompt = () => {
  // Don't show if already installed
  if (isStandalone.value) return false
  
  // Don't show if user dismissed recently (within 7 days)
  const dismissed = localStorage.getItem('installPromptDismissed')
  if (dismissed) {
    const dismissedDate = new Date(dismissed)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (dismissedDate > weekAgo) return false
  }
  
  // Don't show if user already installed (within 30 days)
  const installed = localStorage.getItem('appInstalled')
  if (installed) {
    const installedDate = new Date(installed)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (installedDate > monthAgo) return false
  }
  
  return true
}

// Install the app
const installApp = async () => {
  if (deferredPrompt.value) {
    // Android Chrome install
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      localStorage.setItem('appInstalled', new Date().toISOString())
    }
    
    deferredPrompt.value = null
    showPrompt.value = false
  } else if (isIOS.value) {
    // iOS - just hide the prompt as instructions are shown
    showPrompt.value = false
    localStorage.setItem('installPromptDismissed', new Date().toISOString())
  }
}

// Dismiss the prompt
const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('installPromptDismissed', new Date().toISOString())
}

// Setup event listeners
onMounted(() => {
  // Listen for beforeinstallprompt event (Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    
    // Show prompt after a short delay if conditions are met
    setTimeout(() => {
      if (shouldShowPrompt()) {
        showPrompt.value = true
      }
    }, 3000) // Show after 3 seconds
  })
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('appInstalled', new Date().toISOString())
    showPrompt.value = false
  })
  
  // For iOS, show prompt after delay if not standalone
  if (isIOS.value && !isStandalone.value && shouldShowPrompt()) {
    setTimeout(() => {
      showPrompt.value = true
    }, 5000) // Show after 5 seconds on iOS
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.bg-gradient-to-r {
  background: linear-gradient(to right, #B91C1C, #DC2626);
}
</style>
