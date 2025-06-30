<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">🤖 AI Recommendation Analytics</h2>
        <p class="text-gray-600 mt-1">Track performance and optimize your recommendation system</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="refreshData"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
        <button
          @click="exportData"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Export Data
        </button>
        <button
          @click="clearData"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Clear Data
        </button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Views</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.total_views.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👁️</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Click-Through Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.click_through_rate.toFixed(1) }}%</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👆</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.conversion_rate.toFixed(1) }}%</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Revenue Generated</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.revenue_generated.toFixed(0) }} UAH</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💎</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance by Context -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📍 Performance by Context</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(data, context) in metrics.performance_by_context"
          :key="context"
          class="border border-gray-200 rounded-lg p-4"
        >
          <h4 class="font-medium text-gray-900 mb-2 capitalize">
            {{ getContextIcon(context) }} {{ context }}
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Views:</span>
              <span class="font-medium">{{ data.views }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Clicks:</span>
              <span class="font-medium">{{ data.clicks }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Conversions:</span>
              <span class="font-medium">{{ data.conversions }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Revenue:</span>
              <span class="font-medium text-green-600">{{ data.revenue.toFixed(0) }} UAH</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">CTR:</span>
              <span class="font-medium">{{ data.views > 0 ? ((data.clicks / data.views) * 100).toFixed(1) : 0 }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Performing Products -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Products</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Rate
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in metrics.top_performing_products.slice(0, 10)" :key="product.product_id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
                <div class="text-sm text-gray-500">ID: {{ product.product_id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.clicks }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.conversions }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {{ product.revenue.toFixed(0) }} UAH
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.clicks > 0 ? ((product.conversions / product.clicks) * 100).toFixed(1) : 0 }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Performance Trends -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Performance Trends (Last 30 Days)</h3>
      <div class="h-64 flex items-end justify-between space-x-1">
        <div
          v-for="(day, index) in metrics.performance_by_time.slice(-14)"
          :key="index"
          class="flex-1 flex flex-col items-center"
        >
          <div class="w-full bg-gray-200 rounded-t relative" style="height: 200px;">
            <!-- Revenue bar -->
            <div
              class="absolute bottom-0 w-full bg-green-500 rounded-t"
              :style="{ height: `${getBarHeight(day.revenue, maxRevenue)}px` }"
              :title="`Revenue: ${day.revenue} UAH`"
            ></div>
            <!-- Clicks bar -->
            <div
              class="absolute bottom-0 w-full bg-blue-500 rounded-t opacity-70"
              :style="{ height: `${getBarHeight(day.clicks, maxClicks)}px` }"
              :title="`Clicks: ${day.clicks}`"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
            {{ formatDate(day.date) }}
          </div>
        </div>
      </div>
      <div class="flex justify-center space-x-6 mt-4 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Clicks</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Revenue</span>
        </div>
      </div>
    </div>

    <!-- Additional Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 Additional Metrics</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Total Add to Cart:</span>
            <span class="font-medium">{{ metrics.total_add_to_cart }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Add to Cart Rate:</span>
            <span class="font-medium">{{ metrics.add_to_cart_rate.toFixed(1) }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Average Order Value:</span>
            <span class="font-medium">{{ metrics.average_order_value.toFixed(0) }} UAH</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Total Purchases:</span>
            <span class="font-medium">{{ metrics.total_purchases }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Optimization Tips</h3>
        <div class="space-y-3 text-sm">
          <div v-if="metrics.click_through_rate < 5" class="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-yellow-800">
              <strong>Low CTR:</strong> Consider improving recommendation relevance or placement.
            </p>
          </div>
          <div v-if="metrics.conversion_rate < 2" class="p-3 bg-red-50 border border-red-200 rounded">
            <p class="text-red-800">
              <strong>Low Conversion:</strong> Review product pricing and recommendation quality.
            </p>
          </div>
          <div v-if="metrics.click_through_rate > 10" class="p-3 bg-green-50 border border-green-200 rounded">
            <p class="text-green-800">
              <strong>Great CTR!</strong> Your recommendations are highly engaging.
            </p>
          </div>
          <div v-if="metrics.conversion_rate > 5" class="p-3 bg-green-50 border border-green-200 rounded">
            <p class="text-green-800">
              <strong>Excellent Conversion!</strong> Your recommendations are driving sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recommendationAnalytics, type RecommendationMetrics } from '@/services/recommendationAnalytics'

// State
const metrics = ref<RecommendationMetrics>({
  total_views: 0,
  total_clicks: 0,
  total_add_to_cart: 0,
  total_purchases: 0,
  click_through_rate: 0,
  conversion_rate: 0,
  add_to_cart_rate: 0,
  revenue_generated: 0,
  average_order_value: 0,
  top_performing_products: [],
  performance_by_context: {},
  performance_by_time: []
})

// Computed
const maxRevenue = computed(() => {
  return Math.max(...metrics.value.performance_by_time.map(d => d.revenue), 1)
})

const maxClicks = computed(() => {
  return Math.max(...metrics.value.performance_by_time.map(d => d.clicks), 1)
})

// Methods
const refreshData = () => {
  metrics.value = recommendationAnalytics.getMetrics()
}

const exportData = () => {
  const data = recommendationAnalytics.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recommendation-analytics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
    recommendationAnalytics.clearData()
    refreshData()
  }
}

const getContextIcon = (context: string): string => {
  const icons: Record<string, string> = {
    shop: '🛍️',
    cart: '🛒',
    checkout: '💳',
    product: '📦'
  }
  return icons[context] || '📊'
}

const getBarHeight = (value: number, max: number): number => {
  return Math.max((value / max) * 180, 2)
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>
