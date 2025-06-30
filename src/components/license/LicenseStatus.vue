<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">License Status</h3>
      <button
        @click="refreshLicense"
        :disabled="isRefreshing"
        class="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
      >
        <svg v-if="isRefreshing" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div v-if="license" class="space-y-4">
      <!-- License Status Badge -->
      <div class="flex items-center space-x-2">
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          <svg
            :class="[
              'w-2 h-2 mr-1',
              isValid ? 'text-green-400' : 'text-red-400'
            ]"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx="4" cy="4" r="3" />
          </svg>
          {{ isValid ? 'Active' : 'Expired' }}
        </span>
        <span class="text-sm text-gray-500">
          {{ license.subscriptionType === 'yearly' ? 'Yearly' : 'Monthly' }} Subscription
        </span>
      </div>

      <!-- License Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">License Key</dt>
          <dd class="mt-1 text-sm text-gray-900 font-mono">
            {{ maskedLicenseKey }}
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Domain</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ license.domain }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Expiry Date</dt>
          <dd class="mt-1 text-sm text-gray-900">
            {{ formatDate(license.expiryDate) }}
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Days Remaining</dt>
          <dd class="mt-1 text-sm" :class="daysRemainingColor">
            {{ license.daysRemaining }} days
          </dd>
        </div>
      </div>

      <!-- Features -->
      <div>
        <dt class="text-sm font-medium text-gray-500 mb-2">Included Features</dt>
        <dd class="flex flex-wrap gap-2">
          <span
            v-for="feature in license.features"
            :key="feature"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {{ formatFeature(feature) }}
          </span>
        </dd>
      </div>

      <!-- Progress Bar -->
      <div>
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>License Period</span>
          <span>{{ Math.round(progressPercentage) }}% remaining</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="progressBarColor"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          @click="renewLicense"
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Renew License
        </button>
        <button
          @click="changeLicense"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Change License
        </button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No License Found</h3>
      <p class="mt-1 text-sm text-gray-500">Please activate your license to use the application.</p>
      <div class="mt-6">
        <button
          @click="activateLicense"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Activate License
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { licenseService, type LicenseInfo } from '@/services/licenseService'

// State
const license = ref<LicenseInfo | null>(null)
const isRefreshing = ref(false)

// Computed
const isValid = computed(() => license.value?.isValid || false)

const maskedLicenseKey = computed(() => {
  if (!license.value?.licenseKey) return ''
  const key = license.value.licenseKey
  const parts = key.split('-')
  return parts.map((part, index) => 
    index === 0 ? part : '*'.repeat(part.length)
  ).join('-')
})

const daysRemainingColor = computed(() => {
  const days = license.value?.daysRemaining || 0
  if (days <= 7) return 'text-red-600'
  if (days <= 30) return 'text-yellow-600'
  return 'text-green-600'
})

const progressPercentage = computed(() => {
  if (!license.value) return 0
  const totalDays = license.value.subscriptionType === 'yearly' ? 365 : 30
  const remaining = license.value.daysRemaining
  return Math.max(0, Math.min(100, (remaining / totalDays) * 100))
})

const progressBarColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage <= 20) return 'bg-red-500'
  if (percentage <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
})

// Methods
const refreshLicense = async () => {
  isRefreshing.value = true
  try {
    const currentLicense = licenseService.getCurrentLicense()
    if (currentLicense) {
      const validation = await licenseService.activateLicense(currentLicense.licenseKey)
      if (validation.valid) {
        license.value = validation.license!
      }
    }
  } catch (error) {
    console.error('Failed to refresh license:', error)
  } finally {
    isRefreshing.value = false
  }
}

const renewLicense = () => {
  const renewalUrl = licenseService.getRenewalUrl()
  window.open(renewalUrl, '_blank')
}

const changeLicense = () => {
  window.dispatchEvent(new CustomEvent('show-license-modal'))
}

const activateLicense = () => {
  window.dispatchEvent(new CustomEvent('show-license-modal'))
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFeature = (feature: string): string => {
  return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Initialize
onMounted(() => {
  license.value = licenseService.getCurrentLicense()
})
</script>
