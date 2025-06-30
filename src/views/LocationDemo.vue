<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Location Services Demo</h1>
        <p class="text-lg text-gray-600">
          Test Capacitor.js geolocation functionality for delivery and pickup
        </p>
      </div>

      <!-- Demo Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Location Detector -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Location Detection</h2>
          <LocationDetector
            :auto-detect="false"
            :show-nearby-branches="true"
            :max-distance="15"
            @location-detected="handleLocationDetected"
            @branch-selected="handleBranchSelected"
            @error="handleLocationError"
          />
        </div>

        <!-- Delivery Method Selector -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Delivery Method</h2>
          <DeliveryMethodSelector
            :show-back-button="false"
            @method-selected="handleMethodSelected"
          />
        </div>
      </div>

      <!-- Location Info Display -->
      <div v-if="locationInfo" class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Current Location -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Current Location</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Latitude:</span>
                <span class="font-mono">{{ locationInfo.latitude.toFixed(6) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Longitude:</span>
                <span class="font-mono">{{ locationInfo.longitude.toFixed(6) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Accuracy:</span>
                <span>±{{ Math.round(locationInfo.accuracy || 0) }}m</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Timestamp:</span>
                <span>{{ formatTimestamp(locationInfo.timestamp) }}</span>
              </div>
              <div v-if="locationInfo.address" class="flex justify-between">
                <span class="text-gray-600">Address:</span>
                <span class="text-right">{{ locationInfo.address }}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Information -->
          <div v-if="deliveryInfo">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Available:</span>
                <span :class="deliveryInfo.isAvailable ? 'text-green-600' : 'text-red-600'">
                  {{ deliveryInfo.isAvailable ? 'Yes' : 'No' }}
                </span>
              </div>
              <div v-if="deliveryInfo.nearestBranch" class="flex justify-between">
                <span class="text-gray-600">Nearest Branch:</span>
                <span class="text-right">{{ deliveryInfo.nearestBranch.name }}</span>
              </div>
              <div v-if="deliveryInfo.distance" class="flex justify-between">
                <span class="text-gray-600">Distance:</span>
                <span>{{ deliveryInfo.distance.toFixed(1) }} km</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Delivery Fee:</span>
                <span class="font-medium text-green-600">{{ deliveryInfo.fee }} UAH</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Estimated Time:</span>
                <span>{{ deliveryInfo.estimatedTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nearby Branches -->
      <div v-if="nearbyBranches.length > 0" class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Nearby Branches</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="branch in nearbyBranches"
            :key="branch.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <h3 class="font-medium text-gray-900 mb-2">{{ branch.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ branch.address }}</p>
            <div class="space-y-1 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Distance:</span>
                <span class="font-medium">{{ branch.distance.toFixed(1) }} km</span>
              </div>
              <div class="flex justify-between">
                <span>Delivery Fee:</span>
                <span class="font-medium text-green-600">{{ branch.deliveryFee }} UAH</span>
              </div>
              <div class="flex justify-between">
                <span>Phone:</span>
                <span>{{ branch.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Method Info -->
      <div v-if="selectedMethodInfo" class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-blue-900 mb-4">Selected Method</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-blue-900 mb-3">Method Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-blue-700">Method:</span>
                <span class="font-medium capitalize">{{ selectedMethodInfo.method }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Fee:</span>
                <span class="font-medium text-green-600">{{ selectedMethodInfo.fee }} UAH</span>
              </div>
              <div v-if="selectedMethodInfo.branch" class="flex justify-between">
                <span class="text-blue-700">Branch:</span>
                <span class="text-right">{{ selectedMethodInfo.branch.name }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedMethodInfo.location">
            <h3 class="text-lg font-medium text-blue-900 mb-3">Location</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-blue-700">Coordinates:</span>
                <span class="font-mono">
                  {{ selectedMethodInfo.location.latitude.toFixed(4) }}, 
                  {{ selectedMethodInfo.location.longitude.toFixed(4) }}
                </span>
              </div>
              <div v-if="selectedMethodInfo.location.address" class="flex justify-between">
                <span class="text-blue-700">Address:</span>
                <span class="text-right">{{ selectedMethodInfo.location.address }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div class="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-2">Location Store State</h3>
            <pre class="text-xs bg-white p-3 rounded border overflow-auto">{{ locationStoreDebug }}</pre>
          </div>
          <div>
            <h3 class="text-md font-medium text-gray-900 mb-2">Branch Store State</h3>
            <pre class="text-xs bg-white p-3 rounded border overflow-auto">{{ branchStoreDebug }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { locationService } from '@/services/location'
import LocationDetector from '@/components/location/LocationDetector.vue'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import type { LocationData, Branch } from '@/types'
import type { DeliveryInfo } from '@/services/location'

// Stores
const locationStore = useLocationStore()
const branchStore = useBranchStore()

// State
const locationInfo = ref<LocationData | null>(null)
const deliveryInfo = ref<DeliveryInfo | null>(null)
const nearbyBranches = ref<Array<Branch & { distance: number; deliveryFee: number }>>([])
const selectedMethodInfo = ref<any>(null)

// Computed
const locationStoreDebug = computed(() => ({
  hasLocation: locationStore.hasLocation,
  isDetecting: locationStore.isDetecting,
  locationError: locationStore.locationError,
  watchId: locationStore.watchId,
  isLocationStale: locationStore.isLocationStale,
  lastUpdated: locationStore.lastUpdated
}))

const branchStoreDebug = computed(() => ({
  branchesCount: branchStore.branches.length,
  selectedBranch: branchStore.selectedBranch?.name || null,
  isLoading: branchStore.isLoading,
  error: branchStore.error,
  isDataStale: branchStore.isDataStale
}))

// Methods
const handleLocationDetected = async (location: LocationData) => {
  
  locationInfo.value = location
  
  // Get delivery information
  const result = await locationService.getDeliveryInfo(location)
  deliveryInfo.value = result
  
  // Get nearby branches
  nearbyBranches.value = locationService.getNearbyBranches(location, 15)
}

const handleBranchSelected = (branch: Branch) => {
  
}

const handleLocationError = (error: string) => {
  console.error('Location error:', error)
}

const handleMethodSelected = (data: any) => {
  
  selectedMethodInfo.value = data
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

// Lifecycle
onMounted(async () => {
  // Load branches
  if (!branchStore.branches.length) {
    await branchStore.fetchBranches()
  }
  
  // Load existing location if available
  if (locationStore.hasLocation && locationStore.userLocation) {
    await handleLocationDetected(locationStore.userLocation)
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
