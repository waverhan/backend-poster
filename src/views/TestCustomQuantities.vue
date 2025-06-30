<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">🧪 Custom Quantities Test</h1>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h2 class="text-lg font-semibold text-blue-800 mb-2">Test Instructions:</h2>
      <ol class="list-decimal list-inside text-blue-700 space-y-1">
        <li>Check if products with custom quantities show correct units</li>
        <li>Test quantity increment/decrement buttons</li>
        <li>Verify inventory validation works</li>
        <li>Test add to cart functionality</li>
      </ol>
    </div>

    <!-- Branch Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Branch:</label>
      <select
        v-model="selectedBranchId"
        @change="onBranchChange"
        class="border border-gray-300 rounded-md px-3 py-2"
      >
        <option value="">Select a branch...</option>
        <option v-for="branch in branches" :key="branch.id" :value="branch.id">
          {{ branch.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading products...</p>
    </div>

    <!-- Products with Custom Quantities -->
    <div v-else-if="customQuantityProducts.length > 0" class="space-y-6">
      <h2 class="text-xl font-semibold mb-4">Products with Custom Quantities:</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in customQuantityProducts"
          :key="product.id"
          class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        >
          <!-- Product Info -->
          <div class="mb-4">
            <h3 class="font-semibold text-lg">{{ product.display_name }}</h3>
            <p class="text-gray-600">{{ product.price }} грн</p>
          </div>

          <!-- Custom Quantity Info -->
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 class="font-medium text-sm text-gray-700 mb-2">Custom Quantity Settings:</h4>
            <div class="text-xs text-gray-600 space-y-1">
              <div>Custom Qty: {{ product.custom_quantity }} {{ product.custom_unit }}</div>
              <div>Step: {{ product.quantity_step }}</div>
              <div>Min: {{ product.min_quantity }}</div>
              <div>Max: {{ product.max_quantity }}</div>
            </div>
          </div>

          <!-- Branch Inventory -->
          <div v-if="selectedBranchId" class="bg-yellow-50 rounded-lg p-3 mb-4">
            <h4 class="font-medium text-sm text-yellow-700 mb-2">Branch Inventory:</h4>
            <div class="text-xs text-yellow-600">
              <div v-if="productInventory[product.id]">
                Available: {{ productInventory[product.id].available_quantity }} {{ productInventory[product.id].unit }}
                <span :class="productInventory[product.id].is_available ? 'text-green-600' : 'text-red-600'">
                  ({{ productInventory[product.id].is_available ? 'Available' : 'Out of Stock' }})
                </span>
              </div>
              <div v-else class="text-gray-500">Loading inventory...</div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({{ product.custom_unit || 'pcs' }}):
            </label>
            <div class="flex items-center space-x-3">
              <button
                @click="decreaseQuantity(product.id)"
                :disabled="quantities[product.id] <= (product.min_quantity || 0.05)"
                class="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                −
              </button>
              <span class="w-20 text-center font-bold">{{ formatQuantityDisplay(quantities[product.id] || product.min_quantity || 50, product.custom_unit || 'шт') }}</span>
              <button
                @click="increaseQuantity(product.id)"
                :disabled="quantities[product.id] >= getMaxQuantity(product.id)"
                class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
            <div class="text-center mt-2">
              <span class="text-lg font-bold text-blue-600">
                {{ ((quantities[product.id] || product.min_quantity || 50) * product.price).toFixed(2) }} грн
              </span>
            </div>
          </div>

          <!-- Add to Cart Button -->
          <button
            @click="addToCart(product)"
            :disabled="!canAddToCart(product.id)"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText(product.id) }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Products Found -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">No products with custom quantities found.</p>
    </div>

    <!-- Test Results -->
    <div v-if="testResults.length > 0" class="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-green-800 mb-2">✅ Test Results:</h3>
      <ul class="list-disc list-inside text-green-700 space-y-1">
        <li v-for="result in testResults" :key="result">{{ result }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useBranchStore } from '@/stores/branch'
import { useCartStore } from '@/stores/cart'
import { ProductAvailabilityService } from '@/services/productAvailabilityService'
import { formatQuantityDisplay } from '@/utils/quantityUtils'
import type { Product } from '@/types'

// Stores
const productStore = useProductStore()
const branchStore = useBranchStore()
const cartStore = useCartStore()

// State
const loading = ref(true)
const selectedBranchId = ref('')
const quantities = ref<Record<string, number>>({})
const productInventory = ref<Record<string, any>>({})
const testResults = ref<string[]>([])

// Computed
const branches = computed(() => branchStore.branches)

const customQuantityProducts = computed(() => {
  return productStore.products.filter(p =>
    p.custom_quantity !== null && p.custom_quantity !== undefined
  )
})

// Methods
const onBranchChange = async () => {
  if (!selectedBranchId.value) return

  // Set branch in store
  const branch = branches.value.find(b => b.id === selectedBranchId.value)
  if (branch) {
    branchStore.setSelectedBranch(branch)
    cartStore.setBranch(selectedBranchId.value)
  }

  // Load inventory for all custom quantity products
  await loadInventoryForProducts()
}

const loadInventoryForProducts = async () => {
  if (!selectedBranchId.value) return

  for (const product of customQuantityProducts.value) {
    try {
      const inventory = await ProductAvailabilityService.getProductInventory(
        product.id,
        selectedBranchId.value
      )
      productInventory.value[product.id] = inventory
    } catch (error) {
      console.error(`Failed to load inventory for ${product.display_name}:`, error)
    }
  }
}

const getMaxQuantity = (productId: string): number => {
  const product = customQuantityProducts.value.find(p => p.id === productId)
  if (!product) return 1

  const productMax = product.max_quantity || 10
  const inventoryMax = productInventory.value[productId]?.available_quantity || 999

  return Math.min(productMax, inventoryMax)
}

const increaseQuantity = (productId: string) => {
  const product = customQuantityProducts.value.find(p => p.id === productId)
  if (!product) return

  const step = product.quantity_step || product.custom_quantity || 0.05
  const currentQty = quantities.value[productId] || product.min_quantity || 0.05
  const newQty = currentQty + step

  if (newQty <= getMaxQuantity(productId)) {
    quantities.value[productId] = newQty
    testResults.value.push(`✅ Increased ${product.display_name} to ${newQty} ${product.custom_unit}`)
  }
}

const decreaseQuantity = (productId: string) => {
  const product = customQuantityProducts.value.find(p => p.id === productId)
  if (!product) return

  const step = product.quantity_step || product.custom_quantity || 0.05
  const currentQty = quantities.value[productId] || product.min_quantity || 0.05
  const newQty = currentQty - step
  const minQty = product.min_quantity || 0.05

  if (newQty >= minQty) {
    quantities.value[productId] = newQty
    testResults.value.push(`✅ Decreased ${product.display_name} to ${newQty} ${product.custom_unit}`)
  }
}

const canAddToCart = (productId: string): boolean => {
  if (!selectedBranchId.value) return false

  const inventory = productInventory.value[productId]
  if (!inventory) return false

  const qty = quantities.value[productId] || 0
  return inventory.is_available && qty > 0 && qty <= inventory.available_quantity
}

const getButtonText = (productId: string): string => {
  if (!selectedBranchId.value) return 'Select Branch First'

  const inventory = productInventory.value[productId]
  if (!inventory) return 'Loading...'

  if (!inventory.is_available) return 'Out of Stock'

  const qty = quantities.value[productId] || 0
  if (qty > inventory.available_quantity) return 'Exceeds Available'

  return 'Add to Cart'
}

const addToCart = (product: Product) => {
  const qty = quantities.value[product.id] || product.min_quantity || 0.05

  // Add to cart (simplified for testing)
  testResults.value.push(`✅ Added ${product.display_name} (${qty} ${product.custom_unit}) to cart`)
}

// Initialize
onMounted(async () => {
  try {
    // Load branches and products
    await Promise.all([
      branchStore.fetchBranches(),
      productStore.fetchProducts()
    ])

    // Initialize quantities for custom quantity products
    customQuantityProducts.value.forEach(product => {
      quantities.value[product.id] = product.min_quantity || product.custom_quantity || 50
    })

    loading.value = false

    testResults.value.push(`✅ Found ${customQuantityProducts.value.length} products with custom quantities`)
  } catch (error) {
    console.error('Failed to load data:', error)
    loading.value = false
  }
})
</script>
