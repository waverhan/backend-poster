<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Banner Slider -->
    <BannerSlider />

    <!-- Fallback Hero Banner Section (shown when no banners) -->
    <section v-if="!hasBanners" class="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            🍺 Опілля
          </h1>
          <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Найкращі напої та делікатеси з доставкою по Києву
          </p>

          <!-- Welcome Banner -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto">
            <div class="text-center">
              <div class="text-6xl mb-4">🍺</div>
              <h2 class="text-2xl font-bold mb-2">Ласкаво просимо до Опілля!</h2>
              <p class="text-primary-100 mb-6">Свіжі продукти з доставкою додому або самовивозом</p>

              <!-- Features -->
              <div class="flex justify-center space-x-6 text-sm text-primary-200">
                <div class="flex items-center">
                  <span class="mr-1">✅</span>
                  <span>Актуальні залишки</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-1">⚡</span>
                  <span>Швидка доставка</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-1">💰</span>
                  <span>Найкращі ціни</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Address Input for Delivery -->
      <section v-if="deliveryMethod === 'delivery' && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🚚 Delivery Address</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Enter your delivery address:
              </label>
              <div class="flex space-x-3">
                <input
                  v-model="deliveryAddress"
                  type="text"
                  placeholder="Type your address or get current location..."
                  class="flex-1 input"
                />
                <button
                  @click="getCurrentLocation"
                  :disabled="loading.location"
                  class="btn-outline flex items-center space-x-2"
                >
                  <span>📍</span>
                  <span>{{ loading.location ? 'Getting...' : 'Get Current Location' }}</span>
                </button>
              </div>
              <p v-if="currentLocationAddress" class="text-sm text-success-600 mt-2">
                📍 Current location: {{ currentLocationAddress }}
              </p>
            </div>
            <button
              @click="findNearestBranch"
              :disabled="!deliveryAddress || loading.branches"
              class="btn-primary w-full"
            >
              {{ loading.branches ? 'Finding nearest branch...' : 'Find nearest branch' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Pickup Branch Selection -->
      <section v-if="deliveryMethod === 'pickup' && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🏪 Choose Pickup Branch</h2>

          <div v-if="!branchesLoaded" class="text-center py-8">
            <button
              @click="loadBranches"
              :disabled="loading.branches"
              class="btn-primary"
            >
              {{ loading.branches ? 'Loading branches...' : 'Show pickup locations' }}
            </button>
          </div>

          <div v-else-if="loading.branches" class="text-center py-12">
            <div class="spinner w-8 h-8 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading branches...</p>
          </div>

          <div v-else-if="availableBranches.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">🏪</div>
            <p class="text-gray-500">No pickup locations available</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranch(branch)"
              class="card-hover p-4 cursor-pointer"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg">{{ branch.name }}</h3>
                <span v-if="selectedBranch?.id === branch.id" class="text-primary-500 text-xl">✅</span>
              </div>

              <p class="text-gray-600 text-sm mb-3">{{ branch.address || 'Address not available' }}</p>

              <div class="space-y-1 text-sm">
                <div class="text-success-600 font-medium">
                  ✅ Free pickup available
                </div>
                <div class="text-gray-500">
                  📍 Click to select this location
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Delivery Branch Results -->
      <section v-if="deliveryMethod === 'delivery' && availableBranches.length > 0 && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🚚 Nearest Branch for Delivery</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranch(branch)"
              class="card-hover p-4 cursor-pointer"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg">{{ branch.name }}</h3>
                <span v-if="selectedBranch?.id === branch.id" class="text-primary-500 text-xl">✅</span>
              </div>

              <p class="text-gray-600 text-sm mb-3">{{ branch.address || 'Address not available' }}</p>

              <div class="space-y-1 text-sm">
                <div v-if="branch.distance_km" class="flex justify-between">
                  <span class="text-gray-500">Distance:</span>
                  <span class="font-medium">{{ branch.distance_km.toFixed(1) }} km</span>
                </div>
                <div v-if="branch.delivery_fee" class="flex justify-between">
                  <span class="text-gray-500">Delivery fee:</span>
                  <span class="font-bold text-primary-600">{{ branch.delivery_fee }} UAH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Initial Loading Screen -->
      <section v-if="loading.initial" class="text-center py-20">
        <div class="spinner w-12 h-12 mx-auto mb-6"></div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Завантаження магазину...</h2>
        <p class="text-gray-500">Підготовуємо товари для вас</p>
      </section>

      <!-- Selected Branch & Products -->
      <section v-else-if="selectedBranch">

        <!-- Categories -->
        <div class="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-8">
          <div class="px-4 py-3">
            <!-- Debug Info (temporary) -->
            <div v-if="false" class="mb-2 p-2 bg-yellow-100 text-xs text-yellow-800 rounded">
              Debug: Categories={{ categoriesWithProducts.length }}, Products={{ products.length }}, Branch={{ selectedBranch?.name }}
            </div>

            <div v-if="loading.categories" class="text-center py-4">
              <div class="spinner w-5 h-5 mx-auto mb-2"></div>
              <span class="text-gray-600 text-sm">Loading categories...</span>
            </div>

            <div v-else-if="categoriesWithProducts.length === 0" class="text-center py-4">
              <span class="text-gray-600 text-sm">No categories available</span>
              <button @click="loadCategories" class="ml-2 text-blue-600 hover:text-blue-800 underline">Retry</button>
            </div>

            <div v-else>
              <!-- Mobile: Horizontal scrolling single line -->
              <div class="block md:hidden">
                <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  <!-- Daily Deals Tab -->
                  <button
                    v-if="productsOnSale.length > 0"
                    @click="selectDealsCategory()"
                    :class="[
                      'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                      selectedCategory?.id === 'deals'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    ]"
                  >
                    🔥 {{ $t('deals.title') }}
                  </button>

                  <button
                    v-for="category in categoriesWithProducts"
                    :key="category.id"
                    @click="selectCategory(category)"
                    :class="[
                      'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                      selectedCategory?.id === category.id
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    ]"
                  >
                    {{ category.display_name }}
                  </button>
                </div>
              </div>

              <!-- Desktop: Flex wrap with counts -->
              <div class="hidden md:flex flex-wrap gap-3">
                <!-- Daily Deals Tab -->
                <button
                  v-if="productsOnSale.length > 0"
                  @click="selectDealsCategory()"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors flex items-center space-x-2',
                    selectedCategory?.id === 'deals'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  ]"
                >
                  <span>🔥 {{ $t('deals.title') }}</span>
                  <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{ productsOnSale.length }}</span>
                </button>

                <button
                  v-for="category in categoriesWithProducts"
                  :key="category.id"
                  @click="selectCategory(category)"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors flex items-center space-x-2',
                    selectedCategory?.id === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]"
                >
                  <span>{{ category.display_name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div class="card p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold">🛍️ Товари</h2>
          </div>

          <div v-if="loading.products" class="text-center py-12">
            <div class="spinner w-8 h-8 mx-auto mb-4"></div>
            <p class="text-gray-600">Завантаження товарів...</p>
          </div>

          <div v-else-if="displayedProducts.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📦</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ selectedCategory?.id === 'deals' ? 'Акції відсутні' : 'Товари відсутні' }}
            </h3>
            <p class="text-gray-600 mb-4">
              {{ selectedCategory?.id === 'deals'
                ? 'Наразі немає товарів зі знижками.'
                : selectedCategory
                  ? `Товари з категорії "${selectedCategory.display_name}" наразі відсутні на складі цього магазину.`
                  : 'Товари наразі відсутні в цьому магазині.'
              }}
            </p>
            <div v-if="selectedCategory?.id !== 'deals'" class="space-y-2 text-sm text-gray-500">
              <p>• Товари відображаються на основі актуальних залишків</p>
              <p>• Спробуйте обрати іншу категорію або магазин</p>
              <p>• Залишки оновлюються з системи Poster POS</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCard
              v-for="product in displayedProducts"
              :key="product.id"
              :product="product"
              @add-to-cart="addToCart"
              @add-bottle-to-cart="addBottleToCart"
            />
          </div>
        </div>

        <!-- AI Recommendations Section -->
        <div v-if="!loading.products && displayedProducts.length > 0 && showRecommendations && selectedCategory?.id !== 'deals'" class="card p-6 mt-6">
          <ProductRecommendations
            context="shop"
            :max-recommendations="4"
            :show-reasons="true"
            :show-actions="true"
            :use-ai="true"
            @product-selected="navigateToProduct"
            @hide-recommendations="hideRecommendations"
          />
        </div>
      </section>

      <!-- No Branch Selected Fallback -->
      <section v-else class="text-center py-20">
        <div class="text-6xl mb-4">🏪</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Оберіть філію</h2>
        <p class="text-gray-500 mb-6">Будь ласка, оберіть спосіб отримання та філію для перегляду товарів</p>
        <button
          @click="deliveryMethod = 'pickup'"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Обрати філію
        </button>
      </section>
    </div>

    <!-- Delivery Method Modal -->
    <div v-if="showDeliveryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Choose Delivery Method</h3>
            <button
              @click="closeDeliveryModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <DeliveryMethodSelector
            :show-back-button="false"
            context="modal"
            @method-selected="handleDeliveryMethodSelected"
          />
        </div>
      </div>
    </div>

    <!-- Pickup Modal -->
    <div v-if="showPickupModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">🏪 Choose Pickup Location</h2>
            <button
              @click="closePickupModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="!branchesLoaded" class="text-center py-8">
            <button
              @click="loadBranches"
              :disabled="loading.branches"
              class="btn-primary"
            >
              {{ loading.branches ? 'Loading branches...' : 'Show pickup locations' }}
            </button>
          </div>

          <div v-else-if="loading.branches" class="text-center py-8">
            <div class="spinner w-6 h-6 mx-auto mb-2"></div>
            <p class="text-gray-600">Loading branches...</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranchFromModal(branch)"
              class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 class="font-medium text-gray-900 text-sm">{{ branch.display_name || branch.name }}</h3>
              <p class="text-xs text-gray-600 mt-1">{{ branch.address || 'Address not available' }}</p>
              <div class="text-xs text-success-600 mt-1">
                ✅ Free pickup
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-green-50 border-t border-gray-200">
          <div class="text-center">
            <h3 class="font-medium text-green-900 mb-2 text-sm">Pickup Benefits:</h3>
            <div class="text-xs text-green-700 space-y-1">
              <div>• FREE - No delivery charges</div>
              <div>• Choose your preferred time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

// Stores
import { useCartStore } from '@/stores/cart'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useProductStore } from '@/stores/product'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useBannerStore } from '@/stores/banners'

// Services
import { capacitorService } from '@/services/capacitor'
import googleAnalytics from '@/services/googleAnalytics'

// Utils
import { testPosterApi } from '@/utils/testApi'
import { isDraftBeverage } from '@/utils/bottleUtils'

// Components
import ProductCard from '@/components/product/ProductCard.vue'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'
import ProductRecommendations from '@/components/recommendations/ProductRecommendations.vue'
import BannerSlider from '@/components/BannerSlider.vue'

// Types
import type { Branch, Category, Product, FulfillmentType, LocationData } from '@/types'
import type { AddressSuggestion } from '@/services/addressAutocomplete'

const router = useRouter()

// Translation
const { t } = useI18n()

// Stores
const cartStore = useCartStore()
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const productStore = useProductStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()
const bannerStore = useBannerStore()

// Reactive refs from stores
const { userLocation, locationError } = storeToRefs(locationStore)
const { branches, selectedBranch } = storeToRefs(branchStore)
const { categories, products, selectedCategory, categoriesWithProducts, productsByCategory, productsOnSale } = storeToRefs(productStore)

// Local state
const loading = ref({
  branches: false,
  categories: false,
  products: false,
  location: false,
  initial: true // Add initial loading state
})

const deliveryMethod = ref<FulfillmentType>('pickup') // Default to pickup
const deliveryAddress = ref('')
const currentLocationAddress = ref('')
const availableBranches = ref<Branch[]>([])
const branchesLoaded = ref(false)

// Modal state
const showDeliveryModal = ref(false)
const showPickupModal = ref(false)

// Recommendations state
const showRecommendations = ref(true)

// Computed
const cartCount = computed(() => cartStore.totalItems)

const totalProductsCount = computed(() => products.value.length)

const hasBanners = computed(() => bannerStore.banners.length > 0)

const getCategoryProductCount = (categoryId: string) => {
  return products.value.filter(product => product.category_id === categoryId).length
}

// Computed property for displayed products (either by category or deals)
const displayedProducts = computed(() => {
  if (selectedCategory.value?.id === 'deals') {
    return productsOnSale.value
  }
  return productsByCategory.value
})

// Methods
const openDeliveryModal = () => {
  showDeliveryModal.value = true
  deliveryMethod.value = 'delivery'
}

const closeDeliveryModal = () => {
  showDeliveryModal.value = false
}

const handleDeliveryMethodSelected = (data: any) => {
  

  // Store the delivery method and fee in cart store
  cartStore.setDeliveryMethod(data.method)
  cartStore.setDeliveryFee(data.fee)

  // Store branch selection
  if (data.branch) {
    cartStore.setBranch(data.branch.id)
    branchStore.selectBranch(data.branch)
  }

  // Store location if delivery
  if (data.method === 'delivery' && data.location) {
    locationStore.setLocation(data.location)
  }

  // Close modal
  closeDeliveryModal()

  // Navigate to cart
  router.push('/cart')
}

const openPickupModal = () => {
  showPickupModal.value = true
  deliveryMethod.value = 'pickup'
}

const closePickupModal = () => {
  showPickupModal.value = false
}

const confirmDelivery = async () => {
  if (!deliveryAddress.value) return

  await findNearestBranch()
  closeDeliveryModal()
}

const handleAddressSelected = async (suggestion: AddressSuggestion) => {
  deliveryAddress.value = suggestion.full_address

  if (suggestion.coordinates) {
    // Store the location for later use
    locationStore.setLocation({
      latitude: suggestion.coordinates.lat,
      longitude: suggestion.coordinates.lng,
      address: suggestion.full_address
    })
  }
}

const handleManualAddress = async (address: string) => {
  deliveryAddress.value = address
}

const handleAddressError = (error: string) => {
  notificationStore.add({
    type: 'error',
    title: 'Address Error',
    message: error,
    duration: 3000
  })
}

const selectBranchFromModal = async (branch: Branch) => {
  await selectBranch(branch)
  closePickupModal()
}

const selectDeliveryMethod = async (method: FulfillmentType) => {
  deliveryMethod.value = method
  await capacitorService.hapticImpact('medium')
  await capacitorService.hapticSelection()

  // Clear previous selections
  availableBranches.value = []
  branchStore.clearSelectedBranch()

  // Reset address for delivery
  if (method === 'delivery') {
    deliveryAddress.value = ''
    currentLocationAddress.value = ''
  }
}

const getCurrentLocation = async () => {
  loading.value.location = true

  try {
    const location = await capacitorService.getCurrentPosition()

    if (location) {
      // Convert coordinates to address using reverse geocoding
      const address = await reverseGeocode(location.latitude, location.longitude)
      currentLocationAddress.value = address
      deliveryAddress.value = address

      notificationStore.add({
        type: 'success',
        title: 'Location detected',
        message: 'Your current location has been set as delivery address',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Failed to get location:', error)
    notificationStore.add({
      type: 'error',
      title: 'Location error',
      message: 'Failed to get your current location. Please enter address manually.',
      duration: 5000
    })
  } finally {
    loading.value.location = false
  }
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using a simple reverse geocoding service (you can replace with your preferred service)
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
    const data = await response.json()

    if (data && data.locality && data.principalSubdivision) {
      return `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
    } else {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

const findNearestBranch = async () => {
  if (!deliveryAddress.value) {
    notificationStore.add({
      type: 'warning',
      title: 'Address required',
      message: 'Please enter your delivery address',
      duration: 3000
    })
    return
  }

  loading.value.branches = true

  try {
    await loadBranches()

    if (branches.value.length > 0) {
      // For demo, select first branch and calculate mock delivery fee
      const nearestBranch = branches.value[0]
      const mockDistance = Math.random() * 8 + 1 // 1-9 km
      const deliveryFee = calculateDeliveryFee(mockDistance)

      availableBranches.value = [{
        ...nearestBranch,
        distance_km: mockDistance,
        delivery_fee: deliveryFee
      }]

      // Automatically select the nearest branch and load its products
      
      await selectBranch(nearestBranch)

      notificationStore.add({
        type: 'success',
        title: 'Branch found!',
        message: `Nearest branch: ${nearestBranch.name}`,
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Failed to find nearest branch:', error)
    notificationStore.add({
      type: 'error',
      title: 'Error finding branch',
      message: 'Please try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const loadBranches = async () => {
  loading.value.branches = true

  try {
    
    await branchStore.fetchBranches(true) // force = true to get fresh data
    availableBranches.value = branches.value
    branchesLoaded.value = true
    
  } catch (error) {
    console.error('❌ Failed to load branches:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to load branches from Poster API',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const loadDefaultBranch = async () => {
  loading.value.branches = true

  try {
    await branchStore.fetchBranches(true)

    // Find Branch 4 or the first available branch
    const defaultBranch = branches.value.find(b => b.name.includes('4')) || branches.value[0]

    if (defaultBranch) {
      branchStore.selectBranch(defaultBranch)
      await loadCategories()
    }
  } catch (error) {
    console.error('❌ Failed to load default branch:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to load branch',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const selectBranch = async (branch: Branch) => {
  branchStore.selectBranch(branch)
  await capacitorService.hapticImpact('medium')

  // Load categories and products for this branch
  
  await loadCategories()
}

const loadCategories = async () => {
  loading.value.categories = true
  loading.value.products = true

  try {
    // Check if categories are already loaded (from App.vue preloading)
    const hasCategories = categoriesWithProducts.value.length > 0
    const hasProducts = products.value.length > 0

    

    // Only fetch categories if not already loaded
    if (!hasCategories) {
      
      await productStore.fetchCategories(true) // force = true to get fresh data
    } else {
      
    }

    // Only fetch products if not already loaded for this branch
    const branchId = selectedBranch.value?.id
    if (!hasProducts || branchId) {
      
      await productStore.fetchProducts(undefined, true, branchId, true) // categoryId=undefined, force=true, branchId, useDatabase=true
    } else {
      
    }

    // Auto-select first category if no category is selected
    if (!selectedCategory.value && categoriesWithProducts.value.length > 0) {
      const firstCategory = categoriesWithProducts.value[0]
      
      productStore.selectCategory(firstCategory)
    }

    

  } catch (error) {
    console.error('❌ Failed to load categories and products:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to load data',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.categories = false
    loading.value.products = false
  }
}

const selectCategory = async (category: Category | null) => {
  productStore.selectCategory(category)
  // Don't reload products - just filter the existing ones
  // await loadProducts() // REMOVED: This was causing the wrong products to show
}

const selectDealsCategory = () => {
  // Create a special "deals" category
  const dealsCategory = {
    id: 'deals',
    name: 'deals',
    display_name: t('deals.title'),
    description: 'Products on sale',
    image_url: null,
    sort_order: -1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  productStore.selectCategory(dealsCategory)
}

const loadProducts = async () => {
  loading.value.products = true

  try {
    

    // Clear cache to force fresh data
    productStore.clearCache()

    await productStore.fetchProducts(undefined, true, undefined, true) // categoryId=undefined, force=true, branchId=undefined, useDatabase=true

    
  } catch (error) {
    console.error('❌ Failed to refresh products:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to refresh products',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.products = false
  }
}

const addToCart = async (product: Product, quantity?: number, bottles?: any, bottleCost?: number) => {
  // Haptic feedback for better UX
  await capacitorService.hapticImpact('light')

  const cartItem: any = {
    product_id: product.id,
    poster_product_id: product.poster_product_id || product.id,
    name: product.display_name,
    price: product.price,
    quantity: quantity || 1,
    image_url: product.display_image_url,
    unit: product.unit,
    max_quantity: product.max_quantity
  }

  // Add custom quantity information for weight-based products
  if (product.custom_quantity) {
    cartItem.custom_quantity = product.custom_quantity
    cartItem.custom_unit = product.custom_unit
    cartItem.quantity_step = product.quantity_step || product.custom_quantity
  }

  // Check if this is a draft beverage (requires bottles)
  if (isDraftBeverage(product)) {
    cartItem.is_draft_beverage = true

    // Add bottle information if provided (fallback mode)
    if (bottles) {
      cartItem.bottles = bottles
    }
    if (bottleCost !== undefined) {
      cartItem.bottle_cost = bottleCost
    }
  }

  cartStore.addItem(cartItem)

  // Show success notification
  const message = bottles
    ? `${product.display_name} (${quantity}L) з пляшками додано до кошика`
    : `${product.display_name} ${t('cart.addedToCart')}`

  notificationStore.add({
    type: 'success',
    title: t('cart.addedToCart'),
    message,
    duration: 2000
  })

  // Show native toast on mobile
  await capacitorService.showToast(message, 'short')

  // Success haptic feedback
  await capacitorService.hapticNotification('success')
}

const addBottleToCart = async (bottleItem: any) => {
  // Haptic feedback for better UX
  await capacitorService.hapticImpact('light')

  const cartItem: any = {
    product_id: `bottle_${bottleItem.poster_product_id}`,
    poster_product_id: bottleItem.poster_product_id,
    name: bottleItem.name,
    price: bottleItem.price,
    quantity: bottleItem.quantity,
    image_url: '',
    unit: 'pcs',
    is_bottle_product: true
  }

  cartStore.addItem(cartItem)

  // Show success notification
  const message = `${bottleItem.name} (${bottleItem.quantity}шт) додано до кошика`

  notificationStore.add({
    type: 'success',
    title: 'Тара додана',
    message,
    duration: 1500
  })

  // Show native toast on mobile
  await capacitorService.showToast(message, 'short')
}

const calculateDeliveryFee = (distanceKm: number): number => {
  const config = siteConfigStore.currentConfig
  const baseFee = config.delivery_base_fee || 99
  const baseDistance = config.delivery_base_distance_km || 2
  const extraFeePerKm = config.delivery_extra_fee_per_km || 30

  if (distanceKm <= baseDistance) {
    return baseFee
  } else {
    const extraDistance = distanceKm - baseDistance
    return baseFee + (extraDistance * extraFeePerKm)
  }
}

const navigateToProduct = (product: Product) => {
  router.push(`/product/${product.id}`)
}

const hideRecommendations = () => {
  
  showRecommendations.value = false

  notificationStore.add({
    type: 'info',
    title: 'Recommendations hidden',
    message: 'Refresh the page to show recommendations again',
    duration: 3000
  })
}



// Lifecycle
onMounted(async () => {
  try {
    // Track page view
    googleAnalytics.trackPageView('Магазин - Опілля | Найкращі напої та делікатеси з доставкою по Києву')

    // Load banners for the slider
    await bannerStore.fetchBanners()

    // Load default branch (Branch 4) and show products immediately for better UX
    await loadDefaultBranch()

    // Track product list view when products are loaded
    if (products.value.length > 0) {
      googleAnalytics.trackViewItemList(products.value, 'Shop Page - All Products')
    }
  } catch (error) {
    console.error('❌ Failed to initialize shop:', error)
  } finally {
    // Always set initial loading to false when done
    loading.value.initial = false
  }
})
</script>

<style scoped>
/* Hide scrollbar for mobile categories */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}
</style>
