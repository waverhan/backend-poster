<template>
  <div v-if="showWarning" class="fixed top-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-40">
    <div class="p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-yellow-800">
            License Expiring Soon
          </h3>
          <p class="mt-1 text-sm text-yellow-700">
            Your license expires in {{ daysRemaining }} {{ daysRemaining === 1 ? 'day' : 'days' }}.
            Renew now to avoid service interruption.
          </p>
          <div class="mt-3 flex space-x-2">
            <button
              @click="renewLicense"
              class="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Renew Now
            </button>
            <button
              @click="dismissWarning"
              class="bg-white text-yellow-800 px-3 py-1 rounded text-sm border border-yellow-300 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="dismissWarning"
            class="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { licenseService } from '@/services/licenseService'

// State
const showWarning = ref(false)
const daysRemaining = ref(0)

// Methods
const renewLicense = () => {
  const renewalUrl = licenseService.getRenewalUrl()
  window.open(renewalUrl, '_blank')
}

const dismissWarning = () => {
  showWarning.value = false
  // Don't show again for 24 hours
  localStorage.setItem('license-warning-dismissed', Date.now().toString())
}

const handleLicenseWarning = (event: CustomEvent) => {
  const dismissedTime = localStorage.getItem('license-warning-dismissed')
  const now = Date.now()
  
  // Don't show if dismissed within last 24 hours
  if (dismissedTime && (now - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000) {
    return
  }

  daysRemaining.value = event.detail.daysRemaining
  showWarning.value = true
}

// Event listeners
onMounted(() => {
  window.addEventListener('show-license-warning', handleLicenseWarning as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('show-license-warning', handleLicenseWarning as EventListener)
})
</script>
