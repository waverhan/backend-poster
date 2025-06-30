<template>
  <div v-if="showNotice" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
    <div class="flex items-start space-x-3">
      <div class="text-blue-600 dark:text-blue-400 text-lg">🛍️</div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          Direct Shop Mode
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          You've been redirected directly to our shop. Start browsing our products below!
        </p>
      </div>
      <button
        @click="dismissNotice"
        class="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteConfigStore } from '@/stores/siteConfig'

const route = useRoute()
const siteConfigStore = useSiteConfigStore()
const showNotice = ref(false)

const dismissNotice = () => {
  showNotice.value = false
  // Store dismissal in session storage so it doesn't show again during this session
  sessionStorage.setItem('homepage-redirect-notice-dismissed', 'true')
}

onMounted(() => {
  // Only show notice if:
  // 1. We're on the shop page
  // 2. Homepage type is 'shop' (meaning user was redirected)
  // 3. User hasn't dismissed it in this session
  // 4. User came from the home route (check referrer or route history)
  
  const isDismissed = sessionStorage.getItem('homepage-redirect-notice-dismissed')
  const isShopPage = route.name === 'shop'
  const isDirectShopMode = siteConfigStore.currentConfig.homepage_type === 'shop'
  
  if (isShopPage && isDirectShopMode && !isDismissed) {
    // Check if user was redirected from home (this is a simple check)
    // In a more sophisticated implementation, you could track this in the router
    const wasRedirected = document.referrer.includes(window.location.origin) || 
                         window.history.length === 1
    
    if (wasRedirected) {
      showNotice.value = true
    }
  }
})
</script>
