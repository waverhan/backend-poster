<template>
  <div class="delivery-map-selector">
    <!-- Address Input with Autocomplete -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        📍 Адреса доставки в Києві
      </label>
      <AddressAutocomplete
        v-model="deliveryAddress"
        placeholder="Введіть вулицю та номер будинку..."
        :show-manual-entry="true"
        :show-help="true"
        @select="handleAddressSelected"
        @manual="handleManualAddress"
        class="mb-4"
      />
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div
        ref="mapContainer"
        class="w-full h-96 rounded-lg border border-gray-300 bg-gray-100"
      ></div>

      <!-- Map Loading Overlay -->
      <div
        v-if="isLoadingMap"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-sm text-gray-600">Завантаження карти...</p>
        </div>
      </div>

      <!-- Map Controls -->
      <div class="absolute top-4 right-4 z-[1000] space-y-2">
        <button
          @click="centerOnUserLocation"
          :disabled="!userLocation"
          class="bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300 rounded-lg p-2 shadow-sm transition-colors"
          title="Центрувати на моїй локації"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          @click="toggleDeliveryZones"
          class="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-sm transition-colors"
          :class="showDeliveryZones ? 'bg-blue-50 border-blue-300' : ''"
          title="Показати зони доставки"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
      </div>

      <!-- Map Click Instruction -->
      <div class="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-300 rounded-lg p-3 shadow-sm max-w-xs">
        <div class="flex items-center gap-2 text-sm text-gray-700">
          <span class="text-blue-600">👆</span>
          <span>Натисніть на карту, щоб обрати точну адресу</span>
        </div>
      </div>
    </div>

    <!-- Delivery Information Panel -->
    <div v-if="selectedBranch && userLocation" class="mt-6 bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">📦 Інформація про доставку</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Delivery Details -->
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Адреса доставки:</span>
            <span class="text-sm font-medium text-right">{{ deliveryAddress }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Найближча філія:</span>
            <span class="text-sm font-medium">{{ selectedBranch.name }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Відстань:</span>
            <span class="text-sm font-medium">{{ distance.toFixed(1) }} км</span>
          </div>

          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Час доставки:</span>
            <span class="text-sm font-medium">{{ estimatedDeliveryTime }}</span>
          </div>
        </div>

        <!-- Pricing Breakdown -->
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Базова вартість:</span>
            <span class="text-sm">99 UAH</span>
          </div>

          <div v-if="distance > 2" class="flex justify-between">
            <span class="text-sm text-gray-600">Додатково ({{ (distance - 2).toFixed(1) }} км):</span>
            <span class="text-sm">{{ ((distance - 2) * 30).toFixed(0) }} UAH</span>
          </div>

          <div class="border-t border-gray-200 pt-2">
            <div class="flex justify-between">
              <span class="text-base font-medium text-gray-900">Загальна вартість:</span>
              <span class="text-lg font-bold text-green-600">{{ deliveryFee }} UAH</span>
            </div>
          </div>

          <div v-if="deliveryFee === 0" class="text-sm text-green-600 font-medium">
            🎉 Безкоштовна доставка!
          </div>
        </div>
      </div>

      <!-- Confirm Button -->
      <button
        @click="confirmDelivery"
        class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Підтвердити доставку за {{ deliveryFee }} UAH
      </button>
    </div>

    <!-- Branch List (when no address selected) -->
    <div v-else-if="!deliveryAddress" class="mt-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">🏪 Наші філії</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="branch in availableBranches"
          :key="branch.id"
          @click="centerOnBranch(branch)"
          class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <h4 class="font-medium text-gray-900">{{ branch.name }}</h4>
          <p class="text-sm text-gray-600 mt-1">{{ branch.address }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-500">
              {{ branch.delivery_available ? '🚚 Доставка' : '' }}
              {{ branch.pickup_available ? '🏪 Самовивіз' : '' }}
            </span>
            <span class="text-xs text-blue-600">Показати на карті</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-3">
        <div class="text-red-500 text-xl">⚠️</div>
        <div>
          <p class="text-sm text-red-800 font-medium">{{ error }}</p>
          <div class="mt-2 text-xs text-red-600">
            <p>💡 Поради:</p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>Натисніть на карту, щоб обрати точне місце</li>
              <li>Спробуйте ввести адресу у форматі: "вул. Назва, номер"</li>
              <li>Переконайтеся, що адреса знаходиться в Києві</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useBranchStore } from '@/stores/branch'
import { useLocationStore } from '@/stores/location'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import type { Branch, LocationData } from '@/types'
import type { AddressSuggestion } from '@/services/addressAutocomplete'

// Leaflet imports (will be loaded dynamically)
let L: any = null

// Props
interface Props {
  initialAddress?: string
  showBranchList?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBranchList: true
})

// Emits
const emit = defineEmits<{
  deliverySelected: [data: {
    address: string
    branch: Branch
    distance: number
    fee: number
    location: LocationData
  }]
  error: [error: string]
}>()

// Stores
const branchStore = useBranchStore()
const locationStore = useLocationStore()

// State
const mapContainer = ref<HTMLDivElement>()
const map = ref<any>(null)
const deliveryAddress = ref('')
const userLocation = ref<LocationData | null>(null)
const selectedBranch = ref<Branch | null>(null)
const distance = ref(0)
const isLoadingMap = ref(true)
const showDeliveryZones = ref(false)
const error = ref('')

// Map markers and layers
const userMarker = ref<any>(null)
const branchMarkers = ref<any[]>([])
const deliveryZoneCircles = ref<any[]>([])

// Computed
const availableBranches = computed(() =>
  branchStore.branches.filter(branch => branch.delivery_available)
)

const deliveryFee = computed(() => {
  if (!distance.value) return 99
  return branchStore.calculateDeliveryFeeByDistance(distance.value)
})

const estimatedDeliveryTime = computed(() => {
  if (distance.value <= 3) return '30-45 хв'
  if (distance.value <= 7) return '45-60 хв'
  return '60-90 хв'
})

// Methods
const loadLeaflet = async () => {
  if (L) return L

  try {
    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

    return new Promise((resolve, reject) => {
      script.onload = () => {
        L = (window as any).L
        resolve(L)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  } catch (error) {
    console.error('Failed to load Leaflet:', error)
    throw error
  }
}

const initializeMap = async () => {
  if (!mapContainer.value || map.value) return

  try {
    
    await loadLeaflet()

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100))

    // Initialize map centered on Kyiv
    map.value = L.map(mapContainer.value, {
      center: [50.4501, 30.5234], // Kyiv center
      zoom: 11,
      zoomControl: true,
      attributionControl: true
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map.value)

    // Add click handler for map
    map.value.on('click', handleMapClick)

    // Add branch markers
    addBranchMarkers()

    // Force map to invalidate size after initialization
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize()
      }
    }, 200)

    isLoadingMap.value = false
    
  } catch (error) {
    console.error('❌ Failed to initialize map:', error)
    error.value = 'Не вдалося завантажити карту. Спробуйте оновити сторінку.'
    isLoadingMap.value = false
  }
}

const addBranchMarkers = () => {
  if (!map.value || !L) return

  // Clear existing markers
  branchMarkers.value.forEach(marker => map.value.removeLayer(marker))
  branchMarkers.value = []

  // Add markers for each branch
  availableBranches.value.forEach(branch => {
    if (branch.latitude && branch.longitude) {
      const marker = L.marker([branch.latitude, branch.longitude], {
        icon: L.divIcon({
          className: 'custom-branch-marker',
          html: `
            <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
              🏪
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map.value)

      // Add popup with branch info
      marker.bindPopup(`
        <div class="text-center">
          <h3 class="font-medium text-gray-900">${branch.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${branch.address}</p>
          <div class="mt-2 text-xs">
            ${branch.delivery_available ? '🚚 Доставка' : ''}
            ${branch.pickup_available ? '🏪 Самовивіз' : ''}
          </div>
        </div>
      `)

      branchMarkers.value.push(marker)
    }
  })
}

const addDeliveryZones = () => {
  if (!map.value || !L) return

  // Clear existing zones
  deliveryZoneCircles.value.forEach(circle => map.value.removeLayer(circle))
  deliveryZoneCircles.value = []

  availableBranches.value.forEach(branch => {
    if (branch.latitude && branch.longitude) {
      // 2km zone (base price)
      const zone1 = L.circle([branch.latitude, branch.longitude], {
        radius: 2000,
        fillColor: '#10b981',
        color: '#059669',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.2
      }).addTo(map.value)

      // 5km zone (additional cost)
      const zone2 = L.circle([branch.latitude, branch.longitude], {
        radius: 5000,
        fillColor: '#f59e0b',
        color: '#d97706',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.1
      }).addTo(map.value)

      // 10km zone (max delivery)
      const zone3 = L.circle([branch.latitude, branch.longitude], {
        radius: 10000,
        fillColor: '#ef4444',
        color: '#dc2626',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.05
      }).addTo(map.value)

      deliveryZoneCircles.value.push(zone1, zone2, zone3)
    }
  })
}

const handleAddressSelected = async (suggestion: AddressSuggestion) => {
  deliveryAddress.value = suggestion.full_address

  if (suggestion.coordinates) {
    await setUserLocation({
      latitude: suggestion.coordinates.lat,
      longitude: suggestion.coordinates.lng,
      address: suggestion.full_address
    })
  } else {
    // Geocode the address using Nominatim
    await geocodeAddress(suggestion.full_address)
  }
}

const handleManualAddress = async (address: string) => {
  deliveryAddress.value = address
  await geocodeAddress(address)
}

const geocodeAddress = async (address: string) => {
  try {
    

    // Try multiple search strategies
    const searchQueries = [
      address, // Original address
      `${address}, Київ, Україна`, // With city and country
      `${address}, Kyiv, Ukraine`, // English version
      address.replace('вулиця', 'вул.').replace('вул.', 'вул.'), // Normalize street prefix
    ]

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
            q: query,
            format: 'json',
            limit: '5',
            countrycodes: 'ua',
            bounded: '1',
            viewbox: `${30.239258},${50.213273},${30.825272},${50.590798}`, // Kyiv bounds
            'accept-language': 'uk,ru,en',
            addressdetails: '1'
          }),
          {
            headers: {
              'User-Agent': 'PWA-POS-Shop/1.0',
              'Accept-Language': 'uk,ru,en'
            }
          }
        )

        const data = await response.json()
        

        if (data.length > 0) {
          // Find the best match (prefer exact house number matches)
          let bestResult = data[0]

          // If we have a house number in the query, try to find exact match
          const houseMatch = address.match(/\d+[а-яё]?/i)
          if (houseMatch) {
            const queryHouse = houseMatch[0].toLowerCase()
            const exactMatch = data.find(result =>
              result.address?.house_number?.toLowerCase() === queryHouse
            )
            if (exactMatch) {
              bestResult = exactMatch
              
            }
          }

          const result = bestResult
          const coordinates = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          }

          // Validate coordinates are in Kyiv bounds
          if (coordinates.latitude >= 50.213273 && coordinates.latitude <= 50.590798 &&
              coordinates.longitude >= 30.239258 && coordinates.longitude <= 30.825272) {

            // Create Ukrainian formatted address
            let formattedAddress = address
            if (result.address) {
              const street = result.address.road || result.address.pedestrian
              const house = result.address.house_number
              const district = translateDistrict(result.address.suburb || result.address.city_district)

              if (street) {
                formattedAddress = street
                if (house) formattedAddress += `, ${house}`
                formattedAddress += ', Київ'
                if (district) formattedAddress += `, ${district}`
                formattedAddress += ', Україна'
              }
            }

            await setUserLocation({
              ...coordinates,
              address: formattedAddress
            })

            
            return // Success, exit function
          }
        }
      } catch (searchError) {
        console.warn(`⚠️ Search failed for "${query}":`, searchError)
        continue // Try next query
      }
    }

    // If all searches failed, show error
    error.value = 'Не вдалося знайти адресу на карті. Спробуйте натиснути на карту для вибору точного місця.'
    console.error('❌ All geocoding attempts failed for:', address)

  } catch (err) {
    console.error('Geocoding error:', err)
    error.value = 'Помилка при пошуку адреси. Спробуйте натиснути на карту.'
  }
}

const setUserLocation = async (location: LocationData) => {
  userLocation.value = location
  error.value = ''

  if (!map.value || !L) return

  // Remove existing user marker
  if (userMarker.value) {
    map.value.removeLayer(userMarker.value)
  }

  // Add user location marker
  userMarker.value = L.marker([location.latitude, location.longitude], {
    icon: L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg border-2 border-white animate-pulse">
          📍
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  }).addTo(map.value)

  // Add popup
  userMarker.value.bindPopup(`
    <div class="text-center">
      <h3 class="font-medium text-gray-900">Ваша адреса</h3>
      <p class="text-sm text-gray-600 mt-1">${location.address}</p>
    </div>
  `).openPopup()

  // Find nearest branch and calculate distance
  const nearest = branchStore.findNearestBranchByCoords(location.latitude, location.longitude)
  if (nearest) {
    selectedBranch.value = nearest
    distance.value = branchStore.calculateDistance(
      location.latitude,
      location.longitude,
      nearest.latitude || 0,
      nearest.longitude || 0
    )

    // Center map to show both user and branch
    const group = L.featureGroup([userMarker.value, branchMarkers.value.find(m =>
      m.getLatLng().lat === nearest.latitude && m.getLatLng().lng === nearest.longitude
    )].filter(Boolean))

    if (group.getLayers().length > 1) {
      map.value.fitBounds(group.getBounds(), { padding: [20, 20] })
    } else {
      map.value.setView([location.latitude, location.longitude], 14)
    }
  }
}

const centerOnUserLocation = () => {
  if (userLocation.value && map.value) {
    map.value.setView([userLocation.value.latitude, userLocation.value.longitude], 15)
    if (userMarker.value) {
      userMarker.value.openPopup()
    }
  }
}

const centerOnBranch = (branch: Branch) => {
  if (branch.latitude && branch.longitude && map.value) {
    map.value.setView([branch.latitude, branch.longitude], 15)

    // Find and open the branch marker popup
    const marker = branchMarkers.value.find(m =>
      m.getLatLng().lat === branch.latitude && m.getLatLng().lng === branch.longitude
    )
    if (marker) {
      marker.openPopup()
    }
  }
}

const toggleDeliveryZones = () => {
  showDeliveryZones.value = !showDeliveryZones.value

  if (showDeliveryZones.value) {
    addDeliveryZones()
  } else {
    deliveryZoneCircles.value.forEach(circle => map.value.removeLayer(circle))
    deliveryZoneCircles.value = []
  }
}

const handleMapClick = async (event: any) => {
  const { lat, lng } = event.latlng

  try {
    // Reverse geocode the clicked location
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uk,ru,en&addressdetails=1`
    )
    const data = await response.json()

    if (data && data.address) {
      // Format Ukrainian address
      const street = data.address.road || data.address.pedestrian || data.address.residential
      const houseNumber = data.address.house_number
      const district = translateDistrict(data.address.suburb || data.address.city_district)

      let clickedAddress = street || 'Невідома вулиця'
      if (houseNumber) {
        clickedAddress += `, ${houseNumber}`
      }
      clickedAddress += ', Київ'
      if (district) {
        clickedAddress += `, ${district}`
      }
      clickedAddress += ', Україна'

      // Update the address input
      deliveryAddress.value = clickedAddress

      // Set the location
      await setUserLocation({
        latitude: lat,
        longitude: lng,
        address: clickedAddress
      })

      
    }
  } catch (error) {
    console.error('Failed to reverse geocode clicked location:', error)

    // Fallback: use coordinates
    const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}, Київ, Україна`
    deliveryAddress.value = fallbackAddress

    await setUserLocation({
      latitude: lat,
      longitude: lng,
      address: fallbackAddress
    })
  }
}

const translateDistrict = (district?: string): string | undefined => {
  if (!district) return undefined

  const districtMap: Record<string, string> = {
    'Obolon': 'Оболонський район',
    'Obolonsky': 'Оболонський район',
    'Obolonskyy': 'Оболонський район',
    'Pechersk': 'Печерський район',
    'Pecherskyy': 'Печерський район',
    'Shevchenko': 'Шевченківський район',
    'Shevchenkivsky': 'Шевченківський район',
    'Podil': 'Подільський район',
    'Podilsky': 'Подільський район',
    'Solomianskyi': 'Солом\'янський район',
    'Solomyanskyy': 'Солом\'янський район',
    'Holosiivsky': 'Голосіївський район',
    'Holosiivskyi': 'Голосіївський район',
    'Sviatoshynsky': 'Святошинський район',
    'Sviatoshynskyi': 'Святошинський район',
    'Desniansky': 'Деснянський район',
    'Desnianskyy': 'Деснянський район',
    'Dniprovskyi': 'Дніпровський район',
    'Dniprovsky': 'Дніпровський район',
    'Darnytsky': 'Дарницький район',
    'Darnytskyy': 'Дарницький район'
  }

  // Check if already in Ukrainian
  if (district.includes('район')) {
    return district
  }

  // Try to find translation
  const translated = districtMap[district]
  if (translated) {
    return translated
  }

  // Return as is if no translation found
  return district
}

const confirmDelivery = () => {
  if (!userLocation.value || !selectedBranch.value) return

  const deliveryData = {
    address: deliveryAddress.value,
    branch: selectedBranch.value,
    distance: distance.value,
    fee: deliveryFee.value,
    location: userLocation.value
  }

  emit('deliverySelected', deliveryData)
}

// Watchers
watch(() => props.initialAddress, (newAddress) => {
  if (newAddress) {
    deliveryAddress.value = newAddress
    geocodeAddress(newAddress)
  }
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  await branchStore.fetchBranches()

  // Delay map initialization to ensure DOM is ready
  setTimeout(async () => {
    await initializeMap()

    if (props.initialAddress) {
      deliveryAddress.value = props.initialAddress
      await geocodeAddress(props.initialAddress)
    }
  }, 300)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.delivery-map-selector {
  @apply w-full;
}

/* Custom marker styles */
:deep(.custom-branch-marker) {
  background: transparent;
  border: none;
}

:deep(.custom-user-marker) {
  background: transparent;
  border: none;
}

/* Leaflet popup customization */
:deep(.leaflet-popup-content-wrapper) {
  @apply rounded-lg shadow-lg;
}

:deep(.leaflet-popup-content) {
  @apply m-0;
}
</style>
