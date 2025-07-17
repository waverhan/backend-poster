<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold mb-4">🍾 Bottle Products Status</h3>
    
    <!-- Status Overview -->
    <div class="mb-4">
      <div v-if="status.allActive" class="flex items-center text-green-600">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        All bottle products are active and available
      </div>
      
      <div v-else class="flex items-center text-red-600">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ status.inactiveCount }} bottle product(s) are inactive
      </div>
    </div>

    <!-- Bottle Products List -->
    <div class="space-y-2">
      <div 
        v-for="bottle in status.bottles" 
        :key="bottle.size"
        class="flex items-center justify-between p-3 border rounded-lg"
        :class="bottle.active ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
      >
        <div class="flex items-center">
          <span class="text-2xl mr-3">🍾</span>
          <div>
            <div class="font-medium">{{ bottle.name }}</div>
            <div class="text-sm text-gray-600">
              Size: {{ bottle.size }} | Price: {{ bottle.price }}₴ | ID: {{ bottle.poster_product_id }}
            </div>
          </div>
        </div>
        
        <div class="flex items-center">
          <span 
            :class="bottle.active ? 'text-green-600' : 'text-red-600'"
            class="text-sm font-medium mr-2"
          >
            {{ bottle.active ? 'Active' : 'Inactive' }}
          </span>
          <div 
            :class="bottle.active ? 'bg-green-500' : 'bg-red-500'"
            class="w-3 h-3 rounded-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Warning Message -->
    <div v-if="!status.allActive" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="text-yellow-800 font-medium">Warning: Inactive Bottle Products</h4>
          <p class="text-yellow-700 text-sm mt-1">
            When bottle products are inactive, the system will fall back to including bottle costs in the beverage price. 
            This means bottles won't be tracked as separate inventory items in Poster POS.
          </p>
          <p class="text-yellow-700 text-sm mt-2">
            <strong>Recommendation:</strong> Keep bottle products active for accurate inventory tracking and separate billing.
          </p>
        </div>
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="mt-4 flex justify-end">
      <button
        @click="checkStatus"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <span v-if="loading">Checking...</span>
        <span v-else>Refresh Status</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { backendApi } from '@/services/backendApi'

interface BottleStatus {
  size: string
  name: string
  price: number
  poster_product_id: string
  active: boolean
}

interface Status {
  allActive: boolean
  inactiveCount: number
  bottles: BottleStatus[]
}

const loading = ref(false)
const status = ref<Status>({
  allActive: true,
  inactiveCount: 0,
  bottles: []
})

const checkStatus = async () => {
  loading.value = true
  try {
    // Get all products from Тара category
    const response = await backendApi.get('/products')
    const products = response.data
    
    // Filter bottle products
    const bottleProducts = products.filter((p: any) => 
      p.category?.display_name === 'Тара' && 
      p.display_name.includes('ПЕТ') && 
      p.display_name.includes('кришка')
    )

    // Map to bottle status
    const bottles: BottleStatus[] = bottleProducts.map((p: any) => ({
      size: extractSizeFromName(p.display_name),
      name: p.display_name,
      price: p.price,
      poster_product_id: p.poster_product_id,
      active: p.is_active
    }))

    const inactiveCount = bottles.filter(b => !b.active).length
    
    status.value = {
      allActive: inactiveCount === 0,
      inactiveCount,
      bottles
    }
  } catch (error) {
    console.error('Error checking bottle products status:', error)
  } finally {
    loading.value = false
  }
}

const extractSizeFromName = (name: string): string => {
  const match = name.match(/(\d+(?:,\d+)?)\s*л/)
  return match ? `${match[1].replace(',', '.')}L` : 'Unknown'
}

onMounted(() => {
  checkStatus()
})
</script>
