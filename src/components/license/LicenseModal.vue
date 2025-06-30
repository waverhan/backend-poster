<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            {{ modalType === 'expired' ? 'License Expired' : 'Activate License' }}
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ modalType === 'expired' 
                ? 'Your license has expired. Please enter a new license key to continue.' 
                : 'Enter your license key to activate the application.' }}
          </p>
        </div>

        <!-- Current Domain Info -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600">
            <strong>Domain:</strong> {{ currentDomain }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            This license will be bound to this domain only.
          </div>
        </div>

        <!-- License Input Form -->
        <form @submit.prevent="activateLicense">
          <div class="mb-4">
            <label for="licenseKey" class="block text-sm font-medium text-gray-700 mb-2">
              License Key
            </label>
            <input
              id="licenseKey"
              v-model="licenseKey"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': error }"
              required
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">License Activation Failed</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">License Activated Successfully!</h3>
                <p class="mt-1 text-sm text-green-700">{{ success }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              type="submit"
              :disabled="isLoading || !licenseKey.trim()"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
              <span v-else>Activate License</span>
            </button>
            
            <button
              type="button"
              @click="openPurchaseLink"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Buy License
            </button>
          </div>
        </form>

        <!-- License Info -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="text-xs text-gray-500 space-y-1">
            <p>• Monthly license: $29/month</p>
            <p>• Yearly license: $299/year (save $49)</p>
            <p>• One license per domain</p>
            <p>• Includes all features and updates</p>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="mt-4 text-center">
          <button
            @click="openSupportLink"
            class="text-sm text-blue-600 hover:text-blue-500"
          >
            Need help? Contact Support
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { licenseService } from '@/services/licenseService'

// Props
interface Props {
  modalType?: 'activation' | 'expired'
}

const props = withDefaults(defineProps<Props>(), {
  modalType: 'activation'
})

// State
const isOpen = ref(false)
const licenseKey = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Computed
const currentDomain = computed(() => window.location.hostname)

// Methods
const activateLicense = async () => {
  if (!licenseKey.value.trim()) return

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await licenseService.activateLicense(licenseKey.value.trim())
    
    if (result.valid) {
      success.value = `License activated successfully! Expires: ${new Date(result.license!.expiryDate).toLocaleDateString()}`
      
      // Close modal after 2 seconds and reload app
      setTimeout(() => {
        isOpen.value = false
        window.location.reload()
      }, 2000)
    } else {
      error.value = result.error || 'Invalid license key. Please check and try again.'
    }
  } catch (err) {
    error.value = 'Failed to validate license. Please check your internet connection.'
  } finally {
    isLoading.value = false
  }
}

const openPurchaseLink = () => {
  const purchaseUrl = `https://your-license-server.com/purchase?domain=${currentDomain.value}`
  window.open(purchaseUrl, '_blank')
}

const openSupportLink = () => {
  const supportUrl = `https://your-license-server.com/support?domain=${currentDomain.value}`
  window.open(supportUrl, '_blank')
}

const showModal = () => {
  isOpen.value = true
  error.value = ''
  success.value = ''
  licenseKey.value = ''
}

const hideModal = () => {
  isOpen.value = false
}

// Event listeners
const handleShowLicenseModal = () => showModal()
const handleShowLicenseExpiredModal = () => showModal()

onMounted(() => {
  window.addEventListener('show-license-modal', handleShowLicenseModal)
  window.addEventListener('show-license-expired-modal', handleShowLicenseExpiredModal)
})

onUnmounted(() => {
  window.removeEventListener('show-license-modal', handleShowLicenseModal)
  window.removeEventListener('show-license-expired-modal', handleShowLicenseExpiredModal)
})

// Expose methods for parent component
defineExpose({
  showModal,
  hideModal
})
</script>
