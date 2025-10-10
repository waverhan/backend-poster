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
      class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-red-700 to-red-600 text-white shadow-2xl border-t-4 border-yellow-400"
      style="margin-bottom: env(safe-area-inset-bottom, 0px);"
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

            <!-- Debug info (remove in production) -->
            <div class="mt-2 text-xs text-red-200 opacity-75">
              {{ isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other' }} |
              {{ deferredPrompt ? 'Native' : 'Manual' }} |
              {{ isStandalone ? 'Standalone' : 'Browser' }}
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
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'

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
  
  // Don't show if user dismissed recently (within 1 day for testing)
  const dismissed = localStorage.getItem('installPromptDismissed')
  if (dismissed) {
    const dismissedDate = new Date(dismissed)
    const dayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    if (dismissedDate > dayAgo) return false
  }

  // Don't show if user already installed (within 7 days for testing)
  const installed = localStorage.getItem('appInstalled')
  if (installed) {
    const installedDate = new Date(installed)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (installedDate > weekAgo) return false
  }
  
  return true
}

// Install the app
const installApp = async () => {
  console.log('🔄 Install button clicked')
  console.log('📱 Device info:', { isIOS: isIOS.value, isAndroid: isAndroid.value, isStandalone: isStandalone.value })
  console.log('🎯 Deferred prompt available:', !!deferredPrompt.value)

  if (deferredPrompt.value) {
    try {
      console.log('🚀 Showing native install prompt...')
      // Android Chrome install
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice

      console.log('✅ User choice:', outcome)

      if (outcome === 'accepted') {
        localStorage.setItem('appInstalled', new Date().toISOString())
        console.log('🎉 App installed successfully!')
      } else {
        console.log('❌ User dismissed install prompt')
      }

      deferredPrompt.value = null
      showPrompt.value = false
    } catch (error) {
      console.error('❌ Install prompt error:', error)
      // Fallback: show manual instructions
      showManualInstructions()
    }
  } else if (isIOS.value) {
    console.log('🍎 iOS device - showing manual instructions')
    // iOS - just hide the prompt as instructions are shown
    showPrompt.value = false
    localStorage.setItem('installPromptDismissed', new Date().toISOString())
  } else {
    console.log('🔧 No native install available - showing manual instructions')
    showManualInstructions()
  }
}

// Show manual installation instructions
const showManualInstructions = () => {
  alert(`📱 Додати на головний екран:

🤖 Android (Chrome):
1. Натисніть меню (⋮) у браузері
2. Виберіть "Додати на головний екран"

🍎 iPhone/iPad (Safari):
1. Натисніть кнопку "Поділитися" (□↗)
2. Виберіть "Додати на головний екран"

🌐 Інші браузери:
Скористайтеся функцією "Додати закладку" або "Додати на головний екран" у меню браузера.`)

  showPrompt.value = false
  localStorage.setItem('installPromptDismissed', new Date().toISOString())
}

// Dismiss the prompt
const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('installPromptDismissed', new Date().toISOString())
}

// Manual trigger for testing (expose globally for debugging)
const showPromptManually = () => {
  console.log('🔧 Manual trigger activated')
  showPrompt.value = true
}

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).showInstallPrompt = showPromptManually
  (window as any).resetInstallPrompt = () => {
    localStorage.removeItem('installPromptDismissed')
    localStorage.removeItem('appInstalled')
    console.log('🔄 Install prompt storage cleared')
  }
}

// Add body padding when prompt is shown
watch(showPrompt, (newValue) => {
  if (newValue) {
    document.body.style.paddingBottom = '120px'
  } else {
    document.body.style.paddingBottom = ''
  }
})

// Setup event listeners
onMounted(() => {
  console.log('🔧 InstallPrompt mounted')
  console.log('📱 Device detection:', {
    isIOS: isIOS.value,
    isAndroid: isAndroid.value,
    isStandalone: isStandalone.value,
    userAgent: navigator.userAgent
  })

  // Listen for beforeinstallprompt event (Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎯 beforeinstallprompt event fired!')
    e.preventDefault()
    deferredPrompt.value = e

    // Show prompt after a short delay if conditions are met
    setTimeout(() => {
      if (shouldShowPrompt()) {
        console.log('✅ Showing install prompt (Android)')
        showPrompt.value = true
      } else {
        console.log('❌ Install prompt conditions not met')
      }
    }, 2000) // Show after 2 seconds
  })

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App installed event fired!')
    localStorage.setItem('appInstalled', new Date().toISOString())
    showPrompt.value = false
  })

  // For iOS or if no beforeinstallprompt event, show prompt after delay
  setTimeout(() => {
    if (!deferredPrompt.value && shouldShowPrompt()) {
      console.log('✅ Showing install prompt (iOS/fallback)')
      showPrompt.value = true
    }
  }, 3000) // Show after 3 seconds

  // Debug: Check if prompt should show immediately
  console.log('🔍 Should show prompt:', shouldShowPrompt())
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.paddingBottom = ''
})

// Global functions for manual testing
if (typeof window !== 'undefined') {
  (window as any).showInstallPrompt = () => {
    showPrompt.value = true
  }

  (window as any).resetInstallPrompt = () => {
    localStorage.removeItem('installPromptDismissed')
    localStorage.removeItem('appInstalled')
    showPrompt.value = false
    console.log('🔄 Install prompt storage cleared')
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
.bg-gradient-to-r {
  background: linear-gradient(to right, #B91C1C, #DC2626);
}
</style>
