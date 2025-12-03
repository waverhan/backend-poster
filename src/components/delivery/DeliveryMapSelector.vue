<template>
  <div class="delivery-map-selector">
    <!-- Address Input with Separate Street and House Number -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        📍 Адреса доставки в Києві
      </label>

      <!-- Street Input -->
      <div class="mb-3">
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Вулиця
        </label>
        <AddressAutocomplete
          v-model="streetName"
          placeholder="Введіть назву вулиці..."
          :show-manual-entry="true"
          :show-help="false"
          :street-only="true"
          @select="handleStreetSelected"
          @manual="handleManualStreet"
          class="mb-2"
        />
      </div>

      <!-- House Number and Entrance Inputs -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <!-- House Number Input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Номер будинку
          </label>
          <input
            v-model="houseNumber"
            type="text"
            placeholder="Введіть номер будинку..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleHouseNumberChange"
          />
        </div>

        <!-- Entrance Input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Під'їзд
          </label>
          <input
            v-model="entrance"
            type="text"
            placeholder="Номер під'їзду..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleEntranceChange"
          />
        </div>
      </div>



      <!-- Delivery Info -->
      <div class="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
        <div class="flex items-center gap-2">
          <span class="text-green-600">🚚</span>
          <span class="text-sm font-medium text-green-900">Доставка кур'єром до парадного</span>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useBranchStore } from '@/stores/branch'
import { useLocationStore } from '@/stores/location'
import { useNotificationStore } from '@/stores/notification'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import type { Branch, LocationData } from '@/types'
import type { AddressSuggestion } from '@/services/addressAutocomplete'

// Props
interface Props {
  initialAddress?: string
}

const props = withDefaults(defineProps<Props>(), {
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
const notificationStore = useNotificationStore()

// State
const deliveryAddress = ref('')
const streetName = ref('')
const houseNumber = ref('')
const entrance = ref('')
const userLocation = ref<LocationData | null>(null)
const selectedBranch = ref<Branch | null>(null)
const distance = ref(0)
const error = ref('')

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

const fullDeliveryAddress = computed(() => {
  let address = deliveryAddress.value
  if (entrance.value) {
    address += `, під'їзд ${entrance.value}`
  }
  return address
})

// Methods
const handleStreetSelected = async (suggestion: AddressSuggestion) => {
  streetName.value = suggestion.street
  updateCombinedAddress()
}

const handleManualStreet = async (street: string) => {
  streetName.value = street
  updateCombinedAddress()
}

const handleHouseNumberChange = () => {
  updateCombinedAddress()
}

const handleEntranceChange = () => {
  // Entrance doesn't affect geocoding, just the display
  // The fullDeliveryAddress computed property will handle the display
}



const updateCombinedAddress = async () => {
  if (streetName.value && houseNumber.value) {
    const fullAddress = `${streetName.value}, ${houseNumber.value}, Київ, Україна`
    deliveryAddress.value = fullAddress
    await geocodeAddress(fullAddress)
  } else if (streetName.value) {
    deliveryAddress.value = `${streetName.value}, Київ, Україна`
  } else {
    deliveryAddress.value = ''
  }
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
    address: fullDeliveryAddress.value,
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

// Auto-emit delivery selection when both location and branch are ready
watch([() => userLocation.value, () => selectedBranch.value], ([location, branch]) => {
  if (location && branch && deliveryAddress.value) {
    // Automatically emit the delivery selection
    const deliveryData = {
      address: fullDeliveryAddress.value,
      branch: branch,
      distance: distance.value,
      fee: deliveryFee.value,
      location: location
    }
    emit('deliverySelected', deliveryData)
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await nextTick()
  await branchStore.fetchBranches()

  if (props.initialAddress) {
    deliveryAddress.value = props.initialAddress
    await geocodeAddress(props.initialAddress)
  }
})
</script>

<style scoped>
.delivery-map-selector {
  @apply w-full;
}
</style>
