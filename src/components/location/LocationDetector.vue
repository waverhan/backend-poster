<template>
  <div class="location-detector">
    <!-- Location Services Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
        <span class="text-red-600 text-lg">📍</span>
      </div>
      <h2 class="text-lg font-semibold text-gray-900">Location Services</h2>
    </div>

    <!-- Current Location Status -->
    <div v-if="hasLocation" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <span class="text-green-600 text-lg mt-0.5">✅</span>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800">Location Detected</h3>
          <p class="text-sm text-green-700 mt-1">
            {{ formattedLocation }}
          </p>
          <p class="text-xs text-green-600 mt-1">
            Accuracy: ±{{ Math.round(userLocation?.accuracy || 0) }}m
            <span v-if="lastUpdated" class="ml-2">
              • Updated {{ formatTimeAgo(lastUpdated) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="locationError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <span class="text-red-600 text-lg mt-0.5">⚠️</span>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800">Location Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ locationError }}</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-3">
      <!-- Get Current Location Button -->
      <button
        @click="getCurrentLocation"
        :disabled="isDetecting"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <div v-if="isDetecting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span v-else class="text-lg">📍</span>
        {{ isDetecting ? 'Detecting Location...' : 'Get Current Location' }}
      </button>

      <!-- Watch Location Button -->
      <button
        v-if="!watchId"
        @click="startWatchingLocation"
        :disabled="isDetecting"
        class="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span class="text-lg">👁️</span>
        Watch Location
      </button>

      <!-- Stop Watching Button -->
      <button
        v-if="watchId"
        @click="stopWatchingLocation"
        class="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span class="text-lg">🚫</span>
        Stop Watching
      </button>
    </div>

    <!-- Nearby Branches -->
    <div v-if="hasLocation && nearbyBranches.length > 0" class="mt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Nearby Branches</h3>
      <div class="space-y-2">
        <div
          v-for="branch in nearbyBranches"
          :key="branch.id"
          class="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
          @click="selectBranch(branch)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ branch.name }}</h4>
              <p class="text-xs text-gray-600 mt-1">{{ branch.address }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-blue-600">{{ branch.distance?.toFixed(1) }} km</p>
              <p class="text-xs text-gray-500">{{ getDeliveryFee(branch.distance || 0) }} UAH</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Autocomplete -->
    <div class="mt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Або введіть адресу в Києві</h3>
      <AddressAutocomplete
        v-model="manualAddress"
        placeholder="Введіть вулицю та номер будинку..."
        :show-manual-entry="true"
        :show-help="false"
        @select="handleAddressSelected"
        @manual="handleManualAddress"
        @error="handleAddressError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
// Using text icons instead of Heroicons for now
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { capacitorService } from '@/services/capacitor'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import type { Branch, LocationData } from '@/types'
import type { AddressSuggestion } from '@/services/addressAutocomplete'

// Props
interface Props {
  autoDetect?: boolean
  showNearbyBranches?: boolean
  maxDistance?: number // km
}

const props = withDefaults(defineProps<Props>(), {
  autoDetect: false,
  showNearbyBranches: true,
  maxDistance: 10
})

// Emits
const emit = defineEmits<{
  locationDetected: [location: LocationData]
  branchSelected: [branch: Branch]
  error: [error: string]
}>()

// Stores
const locationStore = useLocationStore()
const branchStore = useBranchStore()

// Reactive state
const manualAddress = ref('')
const isGeocoding = ref(false)

// Computed properties
const {
  userLocation,
  locationError,
  isDetecting,
  watchId,
  lastUpdated,
  hasLocation
} = locationStore

const formattedLocation = computed(() => {
  if (!userLocation.value) return ''

  const { latitude, longitude } = userLocation.value
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
})

const nearbyBranches = computed(() => {
  if (!hasLocation.value || !branchStore.branches.length) return []

  return branchStore.branches
    .map(branch => {
      const distance = locationStore.getDistanceTo(branch.latitude || 0, branch.longitude || 0)
      return { ...branch, distance }
    })
    .filter(branch => branch.distance !== null && branch.distance <= props.maxDistance)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, 5) // Show top 5 nearest branches
})

// Methods
const getCurrentLocation = async () => {
  try {
    locationStore.setDetecting(true)
    locationStore.setError('')

    const location = await capacitorService.getCurrentPosition()

    if (location && locationStore.isValidLocation(location)) {
      locationStore.setLocation(location)
      emit('locationDetected', location)

      // Show success toast
      await capacitorService.showToast({
        text: 'Location detected successfully!',
        duration: 'short',
        position: 'bottom'
      })
    } else {
      throw new Error('Invalid location data received')
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to get current location'
    locationStore.setError(errorMessage)
    emit('error', errorMessage)

    // Show error toast
    await capacitorService.showToast({
      text: errorMessage,
      duration: 'long',
      position: 'bottom'
    })
  } finally {
    locationStore.setDetecting(false)
  }
}

const startWatchingLocation = async () => {
  try {
    const id = await capacitorService.watchPosition((location) => {
      if (locationStore.isValidLocation(location)) {
        locationStore.setLocation(location)
        emit('locationDetected', location)
      }
    })

    locationStore.setWatchId(id)

    await capacitorService.showToast({
      text: 'Started watching your location',
      duration: 'short',
      position: 'bottom'
    })
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to start watching location'
    locationStore.setError(errorMessage)
    emit('error', errorMessage)
  }
}

const stopWatchingLocation = async () => {
  try {
    if (watchId.value) {
      await capacitorService.clearWatch(watchId.value)
      locationStore.setWatchId(null)

      await capacitorService.showToast({
        text: 'Stopped watching your location',
        duration: 'short',
        position: 'bottom'
      })
    }
  } catch (error: any) {
    console.error('Failed to stop watching location:', error)
  }
}

const selectBranch = (branch: Branch) => {
  emit('branchSelected', branch)

  capacitorService.showToast({
    text: `Selected ${branch.name}`,
    duration: 'short',
    position: 'bottom'
  })
}

const handleAddressSelected = async (suggestion: AddressSuggestion) => {
  try {
    isGeocoding.value = true

    let location: LocationData

    if (suggestion.coordinates) {
      // Use coordinates from suggestion
      location = {
        latitude: suggestion.coordinates.lat,
        longitude: suggestion.coordinates.lng,
        address: suggestion.full_address
      }
    } else {
      // Fallback to geocoding
      const geocoded = await locationStore.geocodeAddress(suggestion.full_address)
      if (!geocoded || !locationStore.isValidLocation(geocoded)) {
        throw new Error('Could not find location for this address')
      }
      location = { ...geocoded, address: suggestion.full_address }
    }

    locationStore.setLocation(location)
    emit('locationDetected', location)

    await capacitorService.showToast({
      text: 'Адресу знайдено!',
      duration: 'short',
      position: 'bottom'
    })

    manualAddress.value = ''
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to find address location'
    locationStore.setError(errorMessage)
    emit('error', errorMessage)
  } finally {
    isGeocoding.value = false
  }
}

const handleManualAddress = async (address: string) => {
  try {
    isGeocoding.value = true

    const location = await locationStore.geocodeAddress(address)

    if (location && locationStore.isValidLocation(location)) {
      location.address = address
      locationStore.setLocation(location)
      emit('locationDetected', location)

      await capacitorService.showToast({
        text: 'Адресу знайдено!',
        duration: 'short',
        position: 'bottom'
      })

      manualAddress.value = ''
    } else {
      throw new Error('Could not find location for this address')
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to geocode address'
    locationStore.setError(errorMessage)
    emit('error', errorMessage)
  } finally {
    isGeocoding.value = false
  }
}

const handleAddressError = (error: string) => {
  locationStore.setError(error)
  emit('error', error)
}

const getDeliveryFee = (distance: number): number => {
  // Base delivery fee: 99 UAH for first 2km, then 30 UAH per additional km
  if (distance <= 2) return 99
  return 99 + Math.ceil(distance - 2) * 30
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// Lifecycle
onMounted(async () => {
  // Load branches if not already loaded
  if (!branchStore.branches.length) {
    await branchStore.fetchBranches()
  }

  // Auto-detect location if requested
  if (props.autoDetect && !hasLocation.value) {
    await getCurrentLocation()
  }
})

onUnmounted(async () => {
  // Clean up location watching
  if (watchId.value) {
    await stopWatchingLocation()
  }
})
</script>

<style scoped>
.location-detector {
  @apply max-w-md mx-auto;
}
</style>
