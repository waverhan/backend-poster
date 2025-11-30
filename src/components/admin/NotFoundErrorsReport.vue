<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">📊 404 Error Reports</h2>
        <p class="text-gray-600 mt-1">Track and analyze pages that users are trying to access but don't exist</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="refreshData"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
        <button
          @click="clearAllErrors"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Clear All
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Unique URLs</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.total_unique_urls }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🔗</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total 404 Requests</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.total_requests }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avg Requests/URL</p>
            <p class="text-3xl font-bold text-gray-900">{{ avgRequests }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📈</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-800">
        <strong>ℹ️ Note:</strong> This report tracks user navigation errors (pages users tried to access but don't exist).
        System files like robots.txt, sitemap.xml, and favicon.ico are excluded from tracking.
      </p>
    </div>

    <!-- Top 404 Errors -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔴 Top 404 Errors</h3>
      <div v-if="filteredTopErrors.length === 0" class="text-center py-8 text-gray-500">
        <p>No 404 errors found (excluding system files)</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">URL</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Requests</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Last Seen</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Referrer</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="error in filteredTopErrors" :key="error.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-blue-600 break-all">{{ error.requested_url }}</td>
              <td class="px-4 py-3 font-bold text-red-600">{{ error.count }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(error.last_seen) }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs truncate">{{ error.referrer || '—' }}</td>
              <td class="px-4 py-3">
                <button
                  @click="deleteError(error.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent 404 Errors -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">⏰ Recent 404 Errors</h3>
      <div v-if="filteredRecentErrors.length === 0" class="text-center py-8 text-gray-500">
        <p>No recent 404 errors found (excluding system files)</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-700">URL</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">Timestamp</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">User Agent</th>
              <th class="px-4 py-3 text-left font-medium text-gray-700">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="error in filteredRecentErrors" :key="error.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-blue-600 break-all">{{ error.requested_url }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(error.last_seen) }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs truncate">{{ error.user_agent || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ error.ip_address || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { backendApi } from '@/services/backendApi'

interface NotFoundError {
  id: string
  requested_url: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  timestamp: string
  count: number
  last_seen: string
}

interface Stats {
  total_unique_urls: number
  total_requests: number
  top_errors: NotFoundError[]
  recent_errors: NotFoundError[]
}

const stats = ref<Stats>({
  total_unique_urls: 0,
  total_requests: 0,
  top_errors: [],
  recent_errors: []
})

const isSystemFile = (url: string): boolean => {
  // Filter out system files and crawler requests
  return url === '/robots.txt' ||
         url === '/sitemap.xml' ||
         url === '/favicon.ico' ||
         url === '/' ||
         url.startsWith('/.well-known/')
}

const filteredTopErrors = computed(() => {
  return stats.value.top_errors.filter(error => !isSystemFile(error.requested_url))
})

const filteredRecentErrors = computed(() => {
  return stats.value.recent_errors.filter(error => !isSystemFile(error.requested_url))
})

const avgRequests = computed(() => {
  if (stats.value.total_unique_urls === 0) return 0
  return (stats.value.total_requests / stats.value.total_unique_urls).toFixed(1)
})

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '—'
  }
}

const refreshData = async () => {
  try {
    const response = await backendApi.get('/404-errors/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching 404 stats:', error)
  }
}

const deleteError = async (id: string) => {
  if (!confirm('Are you sure you want to delete this error record?')) return
  try {
    await backendApi.delete(`/404-errors/${id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting 404 error:', error)
  }
}

const clearAllErrors = async () => {
  if (!confirm('Are you sure you want to clear ALL 404 error records? This cannot be undone.')) return
  try {
    await backendApi.delete('/404-errors')
    await refreshData()
  } catch (error) {
    console.error('Error clearing 404 errors:', error)
  }
}

onMounted(() => {
  refreshData()
})
</script>

