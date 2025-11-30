<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="showPrompt" class="fixed inset-0 z-50 flex items-center justify-center p-4 safe-area">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="dismissPrompt"></div>

      <!-- Modal Card - Like FoodAppi -->
      <div class="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <!-- Header with gradient background -->
        <div class="bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-6 pt-6 pb-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img
                src="/opillia-192x192.png"
                alt="Опілля"
                class="w-14 h-14 rounded-2xl shadow-lg"
              />
              <div>
                <h2 class="text-xl font-bold text-white">Опілля</h2>
                <p class="text-red-100 text-xs">PWA Магазин</p>
              </div>
            </div>
            <button
              @click="dismissPrompt"
              class="text-red-200 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Додайте на головний екран?
          </h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
            Швидкий доступ до найкращих напоїв та делікатесів прямо з вашого телефону. Працює без інтернету!
          </p>

          <!-- Features -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Швидкий доступ з екрана</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Працює без інтернету</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Миттєве завантаження</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="dismissPrompt"
              class="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Скасувати
            </button>
            <button
              @click="installApp"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Встановити
            </button>
          </div>

          <!-- iOS Instructions -->
          <div v-if="isIOS && !isStandalone" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
              📱 Для iPhone/iPad:
            </p>
            <ol class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li class="flex gap-2">
                <span class="font-semibold flex-shrink-0">1.</span>
                <span>Натисніть кнопку "Поділитися" (квадрат зі стрілкою)</span>
              </li>
              <li class="flex gap-2">
                <span class="font-semibold flex-shrink-0">2.</span>
                <span>Прокрутіть вниз і виберіть "Додати на головний екран"</span>
              </li>
              <li class="flex gap-2">
                <span class="font-semibold flex-shrink-0">3.</span>
                <span>Натисніть "Додати" у верхньому правому куті</span>
              </li>
            </ol>
          </div>

          <!-- macOS Instructions -->
          <div v-if="isMacOS && !isStandalone" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
              🖥️ Для macOS:
            </p>
            <ol class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li class="flex gap-2">
                <span class="font-semibold flex-shrink-0">1.</span>
                <span>Натисніть меню браузера (⋮ або ⌘)</span>
              </li>
              <li class="flex gap-2">
                <span class="font-semibold flex-shrink-0">2.</span>
                <span>Виберіть "Додати Опілля на Dock"</span>
              </li>
            </ol>
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

const isAndroid = computed(() => {
  return /Android/.test(navigator.userAgent)
})

const isMacOS = computed(() => {
  return /Macintosh|Mac OS X/.test(navigator.userAgent) && !isIOS.value
})

const isStandalone = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
})

// Check if app should show install prompt
const shouldShowPrompt = () => {
  // Don't show if already installed
  if (isStandalone.value) {
    console.log('✅ App already installed (standalone mode)')
    return false
  }

  // Don't show if user dismissed recently (within 7 days)
  const dismissed = localStorage.getItem('installPromptDismissed')
  if (dismissed) {
    const dismissedDate = new Date(dismissed)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (dismissedDate > weekAgo) {
      console.log('⏳ User dismissed prompt recently')
      return false
    }
  }

  // Don't show if user already installed (within 30 days)
  const installed = localStorage.getItem('appInstalled')
  if (installed) {
    const installedDate = new Date(installed)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    if (installedDate > monthAgo) {
      console.log('✅ User already installed app recently')
      return false
    }
  }

  console.log('✅ Should show install prompt')
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
  let instructions = `📱 Додати на головний екран:\n\n`

  if (isAndroid.value) {
    instructions += `🤖 Android (Chrome):\n1. Натисніть меню (⋮) у браузері\n2. Виберіть "Додати на головний екран"\n\n`
  }

  if (isIOS.value) {
    instructions += `🍎 iPhone/iPad (Safari):\n1. Натисніть кнопку "Поділитися" (□↗)\n2. Виберіть "Додати на головний екран"\n\n`
  }

  if (isMacOS.value) {
    instructions += `🖥️ macOS:\n1. Натисніть меню браузера (⋮ або ⌘)\n2. Виберіть "Додати на Dock"\n\n`
  }

  instructions += `🌐 Інші браузери:\nСкористайтеся функцією "Додати закладку" або "Додати на головний екран" у меню браузера.`

  alert(instructions)

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

// Expose for debugging (only in browser context)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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
    isMacOS: isMacOS.value,
    isStandalone: isStandalone.value,
    userAgent: navigator.userAgent
  })

  // Check if service worker is registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('✅ Service Workers registered:', registrations.length)
      registrations.forEach(reg => {
        console.log('  - Scope:', reg.scope)
      })
    }).catch(err => {
      console.error('❌ Error checking service workers:', err)
    })
  } else {
    console.warn('⚠️ Service Worker not supported')
  }

  // Listen for beforeinstallprompt event (Android)
  const handleBeforeInstallPrompt = (e: any) => {
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
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Listen for app installed event
  const handleAppInstalled = () => {
    console.log('🎉 App installed event fired!')
    localStorage.setItem('appInstalled', new Date().toISOString())
    showPrompt.value = false
  }

  window.addEventListener('appinstalled', handleAppInstalled)

  // For iOS or if no beforeinstallprompt event, show prompt after delay
  const fallbackTimeout = setTimeout(() => {
    if (!deferredPrompt.value && shouldShowPrompt()) {
      console.log('✅ Showing install prompt (iOS/fallback)')
      showPrompt.value = true
    }
  }, 3000) // Show after 3 seconds

  // Debug: Check if prompt should show immediately
  console.log('🔍 Should show prompt:', shouldShowPrompt())

  // Cleanup function
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    clearTimeout(fallbackTimeout)
  }
})

// Cleanup on unmount is handled in onMounted return function

// Global functions for manual testing (only in browser context)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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
