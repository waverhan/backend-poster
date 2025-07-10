<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full" :class="statusColor"></div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          📦 Inventory Status
        </h3>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Manual Sync Button -->
        <button
          @click="triggerSync"
          :disabled="isSyncing"
          class="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="isSyncing" class="flex items-center space-x-1">
            <div class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing...</span>
          </span>
          <span v-else>🔄 Sync Now</span>
        </button>

        <!-- Auto-refresh Toggle -->
        <button
          @click="toggleAutoRefresh"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors',
            autoRefresh 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ autoRefresh ? '🟢 Live' : '⏸️ Paused' }}
        </button>
      </div>
    </div>

    <!-- Sync Status -->
    <div v-if="syncStatus" class="mb-4 p-3 rounded-lg" :class="syncStatusBg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium">Last Sync:</span>
          <span class="text-sm">{{ formatTime(syncStatus.completed_at || syncStatus.started_at) }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs px-2 py-1 rounded-full" :class="syncStatusBadge">
            {{ syncStatus.status.toUpperCase() }}
          </span>
          <span v-if="syncStatus.total_records" class="text-xs text-gray-600">
            {{ syncStatus.total_records }} products updated
          </span>
        </div>
      </div>
      
      <div v-if="syncStatus.error_message" class="mt-2 text-sm text-red-600">
        ⚠️ {{ syncStatus.error_message }}
      </div>
    </div>

    <!-- Branch Inventory Summary -->
    <div v-if="selectedBranch && inventorySummary" class="space-y-3">
      <h4 class="text-md font-medium text-gray-900 dark:text-white">
        📍 {{ selectedBranch.name }}
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total Products -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ inventorySummary.total_products }}
          </div>
          <div class="text-sm text-blue-600 dark:text-blue-400">Total Products</div>
        </div>

        <!-- Available Products -->
        <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ inventorySummary.available_products }}
          </div>
          <div class="text-sm text-green-600 dark:text-green-400">Available</div>
        </div>

        <!-- Low Stock -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ inventorySummary.low_stock_products }}
          </div>
          <div class="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</div>
        </div>

        <!-- Out of Stock -->
        <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ inventorySummary.out_of_stock_products }}
          </div>
          <div class="text-sm text-red-600 dark:text-red-400">Out of Stock</div>
        </div>
      </div>
    </div>

    <!-- Low Stock Alerts -->
    <div v-if="lowStockAlerts.length > 0" class="mt-4">
      <h4 class="text-md font-medium text-gray-900 dark:text-white mb-2">
        ⚠️ Low Stock Alerts
      </h4>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="alert in lowStockAlerts"
          :key="`${alert.product_id}-${alert.branch_id}`"
          class="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md"
        >
          <span class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Product ID: {{ alert.product_id }}
          </span>
          <span class="text-sm text-yellow-600 dark:text-yellow-400">
            {{ alert.stock_level }} remaining
          </span>
        </div>
      </div>
    </div>

    <!-- Cache Status (Debug) -->
    <div v-if="showDebugInfo" class="mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
      <div><strong>Cache Age:</strong> {{ cacheStatus.cache_age_minutes }} minutes</div>
      <div><strong>Cached Branches:</strong> {{ cacheStatus.cached_branches.length }}</div>
      <div><strong>Last Update:</strong> {{ cacheStatus.last_update }}</div>
    </div>

    <!-- Sync Log Monitor -->
    <div v-if="showDebugInfo" class="mt-6">
      <SyncLogMonitor />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useBranchStore } from '@/stores/branch'
import { inventoryService, type InventoryStatus, type SyncStatus } from '@/services/inventoryService'
import SyncLogMonitor from '@/components/admin/SyncLogMonitor.vue'

// Props
interface Props {
  showDebugInfo?: boolean
  autoRefreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  showDebugInfo: false,
  autoRefreshInterval: 30000 // 30 seconds
})

// Stores
const branchStore = useBranchStore()
const { selectedBranch } = storeToRefs(branchStore)

// State
const syncStatus = ref<SyncStatus | null>(null)
const inventoryData = ref<InventoryStatus[]>([])
const lowStockAlerts = ref<InventoryStatus[]>([])
const isSyncing = ref(false)
const autoRefresh = ref(true)
const cacheStatus = ref(inventoryService.getCacheStatus())

// Auto-refresh interval
let refreshInterval: NodeJS.Timeout | null = null
let unsubscribeInventory: (() => void) | null = null

// Computed
const statusColor = computed(() => {
  if (!syncStatus.value) return 'bg-gray-400'
  
  switch (syncStatus.value.status) {
    case 'completed': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'started': return 'bg-yellow-500 animate-pulse'
    default: return 'bg-gray-400'
  }
})

const syncStatusBg = computed(() => {
  if (!syncStatus.value) return 'bg-gray-50 dark:bg-gray-700'
  
  switch (syncStatus.value.status) {
    case 'completed': return 'bg-green-50 dark:bg-green-900/20'
    case 'failed': return 'bg-red-50 dark:bg-red-900/20'
    case 'started': return 'bg-yellow-50 dark:bg-yellow-900/20'
    default: return 'bg-gray-50 dark:bg-gray-700'
  }
})

const syncStatusBadge = computed(() => {
  if (!syncStatus.value) return 'bg-gray-200 text-gray-700'
  
  switch (syncStatus.value.status) {
    case 'completed': return 'bg-green-200 text-green-800'
    case 'failed': return 'bg-red-200 text-red-800'
    case 'started': return 'bg-yellow-200 text-yellow-800'
    default: return 'bg-gray-200 text-gray-700'
  }
})

const inventorySummary = computed(() => {
  if (inventoryData.value.length === 0) return null
  
  const total = inventoryData.value.length
  const available = inventoryData.value.filter(item => item.is_available).length
  const lowStock = inventoryData.value.filter(item => 
    item.stock_level > 0 && item.stock_level <= (item.low_stock_threshold || 5)
  ).length
  const outOfStock = inventoryData.value.filter(item => item.stock_level <= 0).length
  
  return {
    total_products: total,
    available_products: available,
    low_stock_products: lowStock,
    out_of_stock_products: outOfStock
  }
})

// Methods
const loadSyncStatus = async () => {
  try {
    syncStatus.value = await inventoryService.getSyncStatus()
  } catch (error) {
    console.error('Failed to load sync status:', error)
  }
}

const loadInventoryData = async () => {
  if (!selectedBranch.value) return
  
  try {
    inventoryData.value = await inventoryService.getBranchInventory(selectedBranch.value.id)
    lowStockAlerts.value = await inventoryService.getLowStockAlerts(selectedBranch.value.id)
    cacheStatus.value = inventoryService.getCacheStatus()
  } catch (error) {
    console.error('Failed to load inventory data:', error)
  }
}

const triggerSync = async () => {
  isSyncing.value = true
  
  try {
    const result = await inventoryService.triggerInventorySync()
    
    
    // Refresh data after sync
    setTimeout(async () => {
      await loadSyncStatus()
      await loadInventoryData()
      isSyncing.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to trigger sync:', error)
    isSyncing.value = false
  }
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshInterval) return
  
  refreshInterval = setInterval(async () => {
    await loadSyncStatus()
    await loadInventoryData()
  }, props.autoRefreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

// Watch for branch changes
watch(selectedBranch, async (newBranch) => {
  if (newBranch) {
    await loadInventoryData()
    
    // Subscribe to real-time updates for this branch
    if (unsubscribeInventory) {
      unsubscribeInventory()
    }
    
    unsubscribeInventory = inventoryService.subscribeToInventoryUpdates(
      newBranch.id,
      (inventory) => {
        inventoryData.value = inventory
        cacheStatus.value = inventoryService.getCacheStatus()
      }
    )
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await loadSyncStatus()
  await loadInventoryData()
  
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
  if (unsubscribeInventory) {
    unsubscribeInventory()
  }
})
</script>
