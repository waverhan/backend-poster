<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          🗺️ Address Autocomplete & Map Demo
        </h1>
        <p class="text-lg text-gray-600">
          Test Kyiv address autocomplete with interactive delivery map
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Address Autocomplete Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            📍 Address Autocomplete
          </h2>

          <div class="space-y-4">
            <p class="text-gray-600">
              Smart address autocomplete for Kyiv with house numbers and multiple data sources:
            </p>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-medium text-blue-900 mb-2">🔍 Data Sources:</h4>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• <strong>Google Places API</strong> - Most accurate (requires API key)</li>
                <li>• <strong>OpenStreetMap</strong> - Free, good coverage</li>
                <li>• <strong>Local Database</strong> - 200+ Kyiv streets offline</li>
              </ul>
            </div>

            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">
                Try typing these examples:
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="example in addressExamples"
                  :key="example"
                  @click="testAddress = example"
                  class="text-left bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded text-sm transition-colors"
                >
                  {{ example }}
                </button>
              </div>
            </div>

            <AddressAutocomplete
              v-model="testAddress"
              placeholder="Введіть адресу в Києві..."
              :show-manual-entry="true"
              :show-help="true"
              @select="handleAddressSelected"
              @manual="handleManualAddress"
              @error="handleAddressError"
            />

            <div v-if="selectedAddress" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-medium text-green-900 mb-2">✅ Selected Address:</h4>
              <div class="text-sm text-green-700 space-y-1">
                <p><strong>Address:</strong> {{ selectedAddress.full_address }}</p>
                <p><strong>Street:</strong> {{ selectedAddress.street }}</p>
                <p v-if="selectedAddress.house_number"><strong>House:</strong> {{ selectedAddress.house_number }}</p>
                <p v-if="selectedAddress.district"><strong>District:</strong> {{ selectedAddress.district }}</p>
                <p><strong>Source:</strong> {{ getSourceLabel(selectedAddress.source) }}</p>
                <p v-if="selectedAddress.coordinates">
                  <strong>Coordinates:</strong>
                  {{ selectedAddress.coordinates.lat.toFixed(4) }}, {{ selectedAddress.coordinates.lng.toFixed(4) }}
                </p>
              </div>
            </div>

            <div v-if="addressError" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-800">❌ {{ addressError }}</p>
            </div>
          </div>
        </div>

        <!-- Map Demo -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            🗺️ Interactive Delivery Map
          </h2>

          <div class="space-y-4">
            <p class="text-gray-600">
              Interactive map showing delivery zones and pricing:
            </p>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-medium text-yellow-900 mb-2">💰 Delivery Pricing:</h4>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• <span class="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span><strong>0-2 km:</strong> 99 ₴ (base price)</li>
                <li>• <span class="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span><strong>2-5 km:</strong> +30 ₴ per km</li>
                <li>• <span class="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span><strong>5-10 km:</strong> +30 ₴ per km</li>
              </ul>
            </div>

            <DeliveryMapSelector
              :initial-address="testAddress"
              @delivery-selected="handleDeliverySelected"
              @error="handleMapError"
            />

            <div v-if="deliveryInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-medium text-blue-900 mb-2">📦 Delivery Information:</h4>
              <div class="text-sm text-blue-700 space-y-1">
                <p><strong>Address:</strong> {{ deliveryInfo.address }}</p>
                <p><strong>Nearest Branch:</strong> {{ deliveryInfo.branch.name }}</p>
                <p><strong>Distance:</strong> {{ deliveryInfo.distance.toFixed(1) }} km</p>
                <p><strong>Delivery Fee:</strong> {{ deliveryInfo.fee }} UAH</p>
                <p><strong>Coordinates:</strong>
                  {{ deliveryInfo.location.latitude.toFixed(4) }}, {{ deliveryInfo.location.longitude.toFixed(4) }}
                </p>
              </div>
            </div>

            <div v-if="mapError" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm text-red-800">❌ {{ mapError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Overview -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          🚀 Features Overview
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 class="font-medium text-green-900 mb-3">✅ Address Autocomplete</h3>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Multi-source data (Google, OSM, Local)</li>
              <li>• House number autocomplete</li>
              <li>• Real-time suggestions</li>
              <li>• Kyiv-specific filtering</li>
              <li>• Fallback to manual entry</li>
              <li>• Coordinate extraction</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-blue-900 mb-3">🗺️ Interactive Map</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• OpenStreetMap with Leaflet.js</li>
              <li>• Branch markers with info</li>
              <li>• Delivery zone visualization</li>
              <li>• Distance calculation</li>
              <li>• Real-time pricing</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-purple-900 mb-3">💰 Smart Pricing</h3>
            <ul class="text-sm text-purple-700 space-y-1">
              <li>• Distance-based calculation</li>
              <li>• Nearest branch selection</li>
              <li>• Zone-based pricing</li>
              <li>• Free delivery thresholds</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Implementation Notes -->
      <div class="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          🔧 Implementation Notes
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-900 mb-2">Configuration Required:</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• <code>VITE_GOOGLE_MAPS_API_KEY</code> - For Google Places (optional)</li>
              <li>• Leaflet.js loaded from CDN</li>
              <li>• OpenStreetMap tiles (free)</li>
              <li>• Local Kyiv streets database</li>
            </ul>
          </div>

          <div>
            <h3 class="font-medium text-gray-900 mb-2">Performance Features:</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Debounced search (300ms)</li>
              <li>• Cached results</li>
              <li>• Fallback providers</li>
              <li>• Offline support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import DeliveryMapSelector from '@/components/delivery/DeliveryMapSelector.vue'
import type { AddressSuggestion } from '@/services/addressAutocomplete'
import type { Branch, LocationData } from '@/types'

// State
const testAddress = ref('')
const selectedAddress = ref<AddressSuggestion | null>(null)
const addressError = ref('')
const deliveryInfo = ref<{
  address: string
  branch: Branch
  distance: number
  fee: number
  location: LocationData
} | null>(null)
const mapError = ref('')

// Demo data
const addressExamples = [
  'Хрещатик 22',
  'Володимирська 15А',
  'Саксаганського 50',
  'Лесі Українки 26',
  'Перемоги 100',
  'Оболонський 1',
  'Науки 45',
  'Антоновича 12Б'
]

// Methods
const handleAddressSelected = (suggestion: AddressSuggestion) => {
  selectedAddress.value = suggestion
  addressError.value = ''
  
}

const handleManualAddress = (address: string) => {
  selectedAddress.value = {
    id: 'manual',
    display_name: address,
    street: address,
    full_address: address,
    source: 'local'
  }
  addressError.value = ''
  
}

const handleAddressError = (error: string) => {
  addressError.value = error
  selectedAddress.value = null
}

const handleDeliverySelected = (data: {
  address: string
  branch: Branch
  distance: number
  fee: number
  location: LocationData
}) => {
  deliveryInfo.value = data
  mapError.value = ''
  
}

const handleMapError = (error: string) => {
  mapError.value = error
  deliveryInfo.value = null
}

const getSourceLabel = (source: string): string => {
  switch (source) {
    case 'google': return 'Google Places API'
    case 'osm': return 'OpenStreetMap'
    case 'local': return 'Local Database'
    default: return source
  }
}
</script>
