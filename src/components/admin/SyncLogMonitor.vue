<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-4 h-4 rounded-full" :class="overallStatusColor"></div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          📊 Sync Log Monitor
        </h3>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Refresh Button -->
        <button
          @click="refreshLogs"
          :disabled="isLoading"
          class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
        </button>

        <!-- Auto-refresh Toggle -->
        <button
          @click="toggleAutoRefresh"
          :class="[
            'px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-1',
            autoRefresh 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          <div v-if="autoRefresh" class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>{{ autoRefresh ? 'Live' : 'Manual' }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ syncStats.total }}
        </div>
        <div class="text-sm text-blue-600 dark:text-blue-400">Total Syncs</div>
      </div>

      <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ syncStats.successful }}
        </div>
        <div class="text-sm text-green-600 dark:text-green-400">Successful</div>
      </div>

      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ syncStats.failed }}
        </div>
        <div class="text-sm text-red-600 dark:text-red-400">Failed</div>
      </div>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ syncStats.successRate }}%
        </div>
        <div class="text-sm text-yellow-600 dark:text-yellow-400">Success Rate</div>
      </div>
    </div>

    <!-- Latest Sync Status -->
    <div v-if="latestSync" class="mb-6 p-4 rounded-lg" :class="getStatusBg(latestSync.status)">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 rounded-full" :class="getStatusColor(latestSync.status)"></div>
          <div>
            <div class="font-medium">Latest Sync: {{ latestSync.sync_type.toUpperCase() }}</div>
            <div class="text-sm opacity-75">{{ formatTime(latestSync.started_at) }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-medium">{{ latestSync.status.toUpperCase() }}</div>
          <div v-if="latestSync.total_records" class="text-sm opacity-75">
            {{ latestSync.total_records }} records
          </div>
        </div>
      </div>
      <div v-if="latestSync.error_message" class="mt-2 text-sm text-red-600 dark:text-red-400">
        ⚠️ {{ latestSync.error_message }}
      </div>
    </div>

    <!-- Sync History Table -->
    <div class="overflow-hidden">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Sync History</h4>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Started
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Records
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="sync in syncHistory" :key="sync.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadge(sync.status)">
                  <div class="w-2 h-2 rounded-full mr-1" :class="getStatusColor(sync.status)"></div>
                  {{ sync.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ sync.sync_type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatTime(sync.started_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ getDuration(sync.started_at, sync.completed_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ sync.total_records || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <div v-if="sync.error_message" class="text-red-600 dark:text-red-400 truncate max-w-xs" :title="sync.error_message">
                  {{ sync.error_message }}
                </div>
                <div v-else-if="sync.details" class="text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {{ formatDetails(sync.details) }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="syncHistory.length === 0 && !isLoading" class="text-center py-8">
        <div class="text-gray-400 text-lg mb-2">📊</div>
        <div class="text-gray-500 dark:text-gray-400">No sync history available</div>
        <div class="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Sync logs will appear here once synchronization starts
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-red-700 dark:text-red-300">
          <div class="font-medium">Failed to load sync logs</div>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { backendApi } from '@/services/backendApi'

// Types
interface SyncLog {
  id: string
  sync_type: string
  status: 'started' | 'completed' | 'failed'
  total_records?: number
  error_message?: string
  details?: string
  started_at: string
  completed_at?: string
}

// State
const syncHistory = ref<SyncLog[]>([])
const latestSync = ref<SyncLog | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const autoRefresh = ref(true)

// Auto-refresh interval
let refreshInterval: NodeJS.Timeout | null = null

// Computed
const syncStats = computed(() => {
  const total = syncHistory.value.length
  const successful = syncHistory.value.filter(sync => sync.status === 'completed').length
  const failed = syncHistory.value.filter(sync => sync.status === 'failed').length
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0

  return { total, successful, failed, successRate }
})

const overallStatusColor = computed(() => {
  if (!latestSync.value) return 'bg-gray-400'
  
  switch (latestSync.value.status) {
    case 'completed': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'started': return 'bg-yellow-500 animate-pulse'
    default: return 'bg-gray-400'
  }
})

// Methods
const loadSyncHistory = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await backendApi.get('/inventory/sync/history?limit=20')
    syncHistory.value = response.data

    // Get latest sync status
    const latestResponse = await backendApi.get('/inventory/sync/status/latest')
    latestSync.value = latestResponse.data

  } catch (err: any) {
    error.value = err.message || 'Failed to load sync history'
    console.error('Failed to load sync history:', err)
  } finally {
    isLoading.value = false
  }
}

const refreshLogs = async () => {
  await loadSyncHistory()
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
    await loadSyncHistory()
  }, 30000) // Refresh every 30 seconds
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'started': return 'bg-yellow-500'
    default: return 'bg-gray-400'
  }
}

const getStatusBg = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
    case 'failed': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    case 'started': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    default: return 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    case 'started': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const getDuration = (startTime: string, endTime?: string) => {
  if (!endTime) return 'In progress...'
  
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const duration = Math.round((end - start) / 1000)
  
  if (duration < 60) return `${duration}s`
  if (duration < 3600) return `${Math.round(duration / 60)}m`
  return `${Math.round(duration / 3600)}h`
}

const formatDetails = (details: string) => {
  try {
    const parsed = JSON.parse(details)
    return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(', ')
  } catch {
    return details
  }
}

// Lifecycle
onMounted(async () => {
  await loadSyncHistory()
  
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
