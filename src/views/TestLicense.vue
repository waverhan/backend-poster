<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">License System Test</h1>
      
      <!-- Current License Status -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Current License Status</h2>
        <div v-if="currentLicense" class="space-y-2">
          <p><strong>License Key:</strong> {{ currentLicense.licenseKey }}</p>
          <p><strong>Domain:</strong> {{ currentLicense.domain }}</p>
          <p><strong>Plan:</strong> {{ currentLicense.subscriptionType }}</p>
          <p><strong>Expires:</strong> {{ formatDate(currentLicense.expiryDate) }}</p>
          <p><strong>Days Remaining:</strong> {{ currentLicense.daysRemaining }}</p>
          <p><strong>Features:</strong> {{ currentLicense.features.join(', ') }}</p>
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="currentLicense.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ currentLicense.isValid ? 'Valid' : 'Invalid' }}
            </span>
          </div>
        </div>
        <div v-else class="text-gray-500">
          No active license found
        </div>
      </div>

      <!-- License Activation -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Test License Activation</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              License Key
            </label>
            <input
              v-model="testLicenseKey"
              type="text"
              placeholder="Enter license key (e.g., 4C91-2T9Z-INTP-6EWS)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex space-x-4">
            <button
              @click="testActivation"
              :disabled="!testLicenseKey || isLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Testing...' : 'Test Activation' }}
            </button>
            <button
              @click="deactivateLicense"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Deactivate License
            </button>
            <button
              @click="refreshStatus"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResult" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Test Results</h2>
        <div class="space-y-2">
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
                  :class="testResult.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ testResult.valid ? 'Success' : 'Failed' }}
            </span>
            <span class="text-sm text-gray-600">{{ testResult.message }}</span>
          </div>
          <pre v-if="testResult.data" class="bg-gray-100 p-3 rounded text-xs overflow-auto">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
        </div>
      </div>

      <!-- API Test -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Direct API Test</h2>
        <div class="space-y-4">
          <button
            @click="testDirectAPI"
            :disabled="isLoading"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Testing...' : 'Test Direct API Call' }}
          </button>
          <div v-if="apiResult" class="mt-4">
            <h3 class="font-medium mb-2">API Response:</h3>
            <pre class="bg-gray-100 p-3 rounded text-xs overflow-auto">{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Predefined Test License -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 class="font-medium text-blue-900 mb-2">Test License Available</h3>
        <p class="text-blue-700 text-sm mb-2">
          Use this license key for testing: <code class="bg-blue-100 px-2 py-1 rounded">4C91-2T9Z-INTP-6EWS</code>
        </p>
        <p class="text-blue-600 text-xs">
          This license is valid for localhost domain and expires on 5/29/2026
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { licenseService } from '@/services/licenseService'
import type { LicenseInfo, LicenseValidationResponse } from '@/services/licenseService'

const currentLicense = ref<LicenseInfo | null>(null)
const testLicenseKey = ref('4C91-2T9Z-INTP-6EWS')
const isLoading = ref(false)
const testResult = ref<{
  valid: boolean
  message: string
  data?: any
} | null>(null)
const apiResult = ref<any>(null)

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const refreshStatus = () => {
  currentLicense.value = licenseService.getCurrentLicense()
}

const testActivation = async () => {
  if (!testLicenseKey.value) return
  
  isLoading.value = true
  testResult.value = null
  
  try {
    const result = await licenseService.activateLicense(testLicenseKey.value)
    
    testResult.value = {
      valid: result.valid,
      message: result.valid ? 'License activated successfully!' : (result.error || 'Activation failed'),
      data: result
    }
    
    if (result.valid) {
      refreshStatus()
    }
  } catch (error) {
    testResult.value = {
      valid: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: error
    }
  } finally {
    isLoading.value = false
  }
}

const deactivateLicense = () => {
  licenseService.deactivateLicense()
  currentLicense.value = null
  testResult.value = {
    valid: true,
    message: 'License deactivated successfully'
  }
}

const testDirectAPI = async () => {
  isLoading.value = true
  apiResult.value = null
  
  try {
    const response = await fetch('http://localhost:3001/api/license/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: testLicenseKey.value,
        domain: window.location.hostname
      })
    })
    
    const data = await response.json()
    apiResult.value = data
  } catch (error) {
    apiResult.value = {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  refreshStatus()
})
</script>
