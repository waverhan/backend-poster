<template>
  <div class="delivery-method-selector">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ $t('checkout.chooseDeliveryMethod') }}</h2>
      <p class="text-sm text-gray-600">{{ $t('checkout.selectHowReceive') }}</p>
    </div>



    <!-- Delivery Method Options -->
    <div v-if="availableBranches.length > 0" class="space-y-4 mb-6">
      <!-- Delivery Option -->
      <div
        class="border-2 rounded-lg p-4 cursor-pointer transition-all duration-200"
        :class="selectedMethod === 'delivery'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'"
        @click="selectMethod('delivery')"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-1">
            <input
              type="radio"
              :checked="selectedMethod === 'delivery'"
              class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              readonly
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-gray-600 text-lg">🚚</span>
              <h3 class="font-medium text-gray-900">{{ $t('checkout.delivery') }}</h3>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              {{ $t('checkout.deliveryDescription') }}
            </p>
            <div v-if="nearestBranch && userLocation" class="text-xs text-gray-500">
              <p>From: {{ nearestBranch.name }}</p>
              <p>Distance: {{ nearestDistance?.toFixed(1) }} km</p>
              <p class="font-medium text-green-600">
                Fee: {{ deliveryFee }} UAH
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pickup Option -->
      <div
        class="border-2 rounded-lg p-4 cursor-pointer transition-all duration-200"
        :class="selectedMethod === 'pickup'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'"
        @click="selectMethod('pickup')"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-1">
            <input
              type="radio"
              :checked="selectedMethod === 'pickup'"
              class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              readonly
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-gray-600 text-lg">🏪</span>
              <h3 class="font-medium text-gray-900">{{ $t('checkout.pickup') }}</h3>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              {{ $t('checkout.pickupDescription') }}
            </p>
            <div class="text-xs text-green-600 font-medium">
              {{ $t('checkout.free') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No branches available -->
    <div v-else class="text-center py-8">
      <div class="text-2xl mb-2">🏪</div>
      <p class="text-gray-600 mb-2">{{ $t('checkout.noDeliveryOptions') }}</p>
      <p class="text-sm text-gray-500">Branches: {{ branchStore.branches.length }}, Available: {{ availableBranches.length }}</p>
    </div>

    <!-- Location Detection for Delivery -->
    <div v-if="selectedMethod === 'delivery'" class="mb-6">
      <!-- Map View Only -->
      <DeliveryMapSelector
        @delivery-selected="handleMapDeliverySelected"
        @error="handleLocationError"
      />
    </div>

    <!-- Branch Selection for Pickup -->
    <div v-if="selectedMethod === 'pickup'" class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Select Pickup Location</h3>

      <!-- Show nearby branches if location is available -->
      <div v-if="userLocation && nearbyPickupBranches && nearbyPickupBranches.length > 0" class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Nearby Locations</h4>
        <div class="space-y-2">
          <div
            v-for="branch in nearbyPickupBranches"
            :key="branch.id"
            class="border rounded-lg p-3 cursor-pointer transition-colors"
            :class="selectedPickupBranch?.id === branch.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'"
            @click="selectPickupBranch(branch)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="font-medium text-gray-900">{{ branch.name }}</h5>
                <p class="text-sm text-gray-600 mt-1">{{ branch.address }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ branch.phone }} • {{ branch.working_hours }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-blue-600">{{ branch.distance?.toFixed(1) }} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All branches list -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">All Locations</h4>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="branch in availableBranches"
            :key="branch.id"
            class="border rounded-lg p-3 cursor-pointer transition-colors"
            :class="selectedPickupBranch?.id === branch.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'"
            @click="selectPickupBranch(branch)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="font-medium text-gray-900">{{ branch.name }}</h5>
                <p class="text-sm text-gray-600 mt-1">{{ branch.address }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ branch.phone }} • {{ branch.working_hours }}
                </p>
              </div>
              <div v-if="userLocation && branch.latitude && branch.longitude" class="text-right">
                <p class="text-sm text-gray-500">
                  {{ calculateDistance(userLocation.latitude, userLocation.longitude, branch.latitude, branch.longitude).toFixed(1) }} km
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        v-if="showBackButton"
        @click="$emit('back')"
        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Back
      </button>
      <button
        @click="confirmSelection"
        :disabled="!canProceed"
        class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {{ confirmButtonText }}
      </button>
    </div>

    <!-- Delivery Info Summary -->
    <div v-if="canProceed" class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-sm">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">{{ $t('checkout.method') }}:</span>
          <span class="font-medium">{{ selectedMethod === 'delivery' ? $t('checkout.delivery') : $t('checkout.pickup') }}</span>
        </div>
        <div v-if="selectedMethod === 'delivery' && nearestBranch" class="flex justify-between items-center mt-1">
          <span class="text-gray-600">{{ $t('checkout.from') }}:</span>
          <span class="font-medium">{{ nearestBranch.name }}</span>
        </div>
        <div v-if="selectedMethod === 'pickup' && selectedPickupBranch" class="flex justify-between items-center mt-1">
          <span class="text-gray-600">{{ $t('checkout.location') }}:</span>
          <span class="font-medium">{{ selectedPickupBranch.name }}</span>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span class="text-gray-600">{{ $t('checkout.fee') }}:</span>
          <span class="font-medium text-green-600">{{ totalFee }} UAH</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Using text icons instead of Heroicons for now
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useCartStore } from '@/stores/cart'
import DeliveryMapSelector from '@/components/delivery/DeliveryMapSelector.vue'
import type { Branch, LocationData } from '@/types'

// Props
interface Props {
  showBackButton?: boolean
  context?: 'cart' | 'checkout' | 'modal'
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
  context: 'modal'
})

// Emits
const emit = defineEmits<{
  methodSelected: [data: {
    method: 'delivery' | 'pickup'
    location?: LocationData
    branch?: Branch
    fee: number
  }]
  back: []
}>()

// Router
const router = useRouter()

// Translation
const { t } = useI18n()

// Stores
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const cartStore = useCartStore()

// State
const selectedMethod = ref<'delivery' | 'pickup' | null>(null)
const selectedPickupBranch = ref<Branch | null>(null)
const selectedDeliveryBranch = ref<Branch | null>(null)

// Computed
const userLocation = computed(() => locationStore.userLocation)
const availableBranches = computed(() => {
  return branchStore.branches.filter(branch =>
    branch.delivery_available || branch.pickup_available
  )
})

const nearestBranch = computed(() => {
  if (!userLocation.value) return null

  return branchStore.findNearestBranchByCoords(userLocation.value.latitude, userLocation.value.longitude)
})

const nearestDistance = computed(() => {
  if (!userLocation.value || !nearestBranch.value) return null
  return branchStore.calculateDistance(
    userLocation.value.latitude,
    userLocation.value.longitude,
    nearestBranch.value.latitude || 0,
    nearestBranch.value.longitude || 0
  )
})

const deliveryFee = computed(() => {
  if (!nearestDistance.value) return 99
  return branchStore.calculateDeliveryFeeByDistance(nearestDistance.value)
})

const nearbyPickupBranches = computed(() => {
  if (!userLocation.value) return []
  try {
    const branches = branchStore.getBranchesWithinRadiusFromCoords(
      userLocation.value.latitude,
      userLocation.value.longitude,
      10
    )
    return Array.isArray(branches) && branches.length > 0 ? branches.slice(0, 3) : []
  } catch (error) {
    console.error('Error getting nearby pickup branches:', error)
    return []
  }
})

const canProceed = computed(() => {
  if (selectedMethod.value === 'delivery') {
    const hasLocation = !!userLocation.value
    const hasBranches = branchStore.branches.length > 0

    // Allow proceeding if we have location and at least some branches
    // Even if nearest branch calculation fails, we can still proceed
    return hasLocation && hasBranches
  }
  if (selectedMethod.value === 'pickup') {
    return !!selectedPickupBranch.value
  }
  return false
})

const confirmButtonText = computed(() => {
  if (!selectedMethod.value) return t('checkout.selectMethod')
  if (selectedMethod.value === 'pickup' && !selectedPickupBranch.value) return 'Select Branch'

  // Different text based on context
  if (props.context === 'cart') return t('checkout.proceedToCheckout')
  if (props.context === 'checkout') return 'Continue'
  return 'Continue'
})

const totalFee = computed(() => {
  if (selectedMethod.value === 'pickup') return 0
  if (selectedMethod.value === 'delivery') return deliveryFee.value
  return 0
})

// Methods
const selectMethod = (method: 'delivery' | 'pickup') => {
  
  selectedMethod.value = method

  // Reset selections when switching methods
  if (method === 'pickup') {
    selectedDeliveryBranch.value = null
  } else {
    selectedPickupBranch.value = null
  }

  
}

const selectPickupBranch = (branch: Branch) => {
  selectedPickupBranch.value = branch
  branchStore.selectBranch(branch)
}

const handleLocationDetected = (location: LocationData) => {
  // Location is automatically stored in the location store
  // The nearest branch will be computed automatically
}

const handleBranchSelected = (branch: Branch) => {
  selectedDeliveryBranch.value = branch
}

const handleLocationError = (error: string) => {
  console.error('Location error:', error)
}

const handleMapDeliverySelected = (data: {
  address: string
  branch: Branch
  distance: number
  fee: number
  location: LocationData
}) => {
  // Set the location in the location store
  locationStore.setLocation(data.location)

  // Set the selected delivery branch
  selectedDeliveryBranch.value = data.branch

  
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  return branchStore.calculateDistance(lat1, lon1, lat2, lon2)
}

const confirmSelection = () => {
  if (!canProceed.value) return

  let selectedBranch: Branch | null = null

  if (selectedMethod.value === 'delivery') {
    // Try to get the selected delivery branch, nearest branch, or first available branch
    selectedBranch = selectedDeliveryBranch.value ||
                    nearestBranch.value ||
                    branchStore.branches.find(b => b.delivery_available) ||
                    branchStore.branches[0] ||
                    null
  } else {
    selectedBranch = selectedPickupBranch.value
  }

  if (!selectedBranch) {
    console.error('No branch available for selection')
    return
  }

  const data = {
    method: selectedMethod.value!,
    location: selectedMethod.value === 'delivery' ? userLocation.value! : undefined,
    branch: selectedBranch,
    fee: totalFee.value
  }

  // If in cart context, handle navigation directly
  if (props.context === 'cart') {
    // Store the selection in cart store for checkout page
    cartStore.setDeliveryMethod(data.method)
    cartStore.setDeliveryFee(data.fee)

    // Store branch selection
    if (data.branch) {
      cartStore.setBranch(data.branch.id)
      branchStore.selectBranch(data.branch)
    }

    // Store the selection in location store for checkout page
    if (data.method === 'delivery' && data.location) {
      locationStore.setLocation(data.location)
    }

    // Emit the event so CartView can update its selectedMethod ref
    emit('methodSelected', data)

    // Navigate to checkout
    router.push({
      path: '/checkout',
      query: {
        method: data.method,
        fee: data.fee.toString()
      }
    })
  } else {
    // For modal/checkout context, just emit the event
    emit('methodSelected', data)
  }
}

// Lifecycle
onMounted(async () => {
  
  

  // Load branches if not already loaded
  if (!branchStore.branches.length) {
    
    await branchStore.fetchBranches()
    
  } else {
    
  }

  // Check if there's a pre-selected method from cart store
  if (cartStore.deliveryMethod && cartStore.deliveryMethod !== '') {
    selectedMethod.value = cartStore.deliveryMethod as 'delivery' | 'pickup'

    // If pickup method is pre-selected, also set the branch
    if (cartStore.deliveryMethod === 'pickup' && branchStore.selectedBranch) {
      selectedPickupBranch.value = branchStore.selectedBranch
    }

    // If delivery method is pre-selected and we have location, set delivery branch
    if (cartStore.deliveryMethod === 'delivery' && locationStore.userLocation) {
      // Find nearest branch for delivery
      const nearest = branchStore.findNearestBranchByCoords(
        locationStore.userLocation.latitude,
        locationStore.userLocation.longitude
      )
      if (nearest) {
        selectedDeliveryBranch.value = nearest
      }
    }

    
  }
})
</script>

<style scoped>
.delivery-method-selector {
  @apply max-w-2xl mx-auto;
}
</style>
