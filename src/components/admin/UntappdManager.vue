<template>
  <div class="untappd-manager">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Управління Untappd</h3>

      <!-- API Status -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <h4 class="font-medium text-gray-900">Статус сервісу</h4>
          <div
            :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              serviceStatus.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]"
          >
            {{ serviceStatus.available ? 'Доступний' : 'Недоступний' }}
          </div>
        </div>
        <p class="text-sm text-gray-600">
          {{ serviceStatus.available
            ? 'Сервіс веб-скрапінгу Untappd працює і готовий до використання'
            : 'Сервіс веб-скрапінгу недоступний. Перевірте підключення до бекенду.'
          }}
        </p>
        <p v-if="serviceStatus.note" class="text-xs text-blue-600 mt-1">
          {{ serviceStatus.note }}
        </p>
      </div>

      <!-- Product Search -->
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Пошук та прив\'язка продуктів</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Оберіть продукт
            </label>
            <select
              v-model="selectedProductId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Оберіть продукт...</option>
              <option
                v-for="product in beerProducts"
                :key="product.id"
                :value="product.id"
              >
                {{ product.display_name || product.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Untappd URL або Beer ID
            </label>
            <input
              v-model="untappdInput"
              type="text"
              placeholder="https://untappd.com/b/beer-name/123456 або 123456"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="searchUntappd"
            :disabled="!selectedProductId || searching"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {{ searching ? 'Пошук...' : 'Знайти в Untappd' }}
          </button>
          
          <button
            @click="linkProduct"
            :disabled="!selectedProductId || !untappdInput || linking"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {{ linking ? 'Прив\'язка...' : 'Прив\'язати' }}
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">Результати пошуку</h4>
        <div class="space-y-3">
          <div
            v-for="beer in searchResults"
            :key="beer.beer_id"
            class="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <img
              v-if="beer.beer_label"
              :src="beer.beer_label"
              :alt="beer.beer_name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1">
              <h5 class="font-medium text-gray-900">{{ beer.beer_name }}</h5>
              <p class="text-sm text-gray-600">{{ beer.brewery_name }}</p>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span v-if="beer.beer_abv">{{ beer.beer_abv }}% ABV</span>
                <span v-if="beer.beer_ibu">{{ beer.beer_ibu }} IBU</span>
                <span v-if="beer.rating_score">⭐ {{ beer.rating_score.toFixed(2) }}</span>
              </div>
            </div>
            <button
              @click="selectBeer(beer)"
              class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Обрати
            </button>
          </div>
        </div>
      </div>

      <!-- Current Mappings -->
      <div>
        <h4 class="font-medium text-gray-900 mb-3">Поточні прив\'язки</h4>
        
        <div v-if="mappings.length === 0" class="text-center py-8 text-gray-500">
          <p>Немає прив\'язаних продуктів</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="mapping in mappings"
            :key="mapping.product_id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex-1">
              <h5 class="font-medium text-gray-900">{{ getProductName(mapping.product_id) }}</h5>
              <p class="text-sm text-gray-600">
                Untappd Beer ID: {{ mapping.untappd_beer_id }}
                <span v-if="mapping.untappd_url" class="ml-2">
                  <a :href="mapping.untappd_url" target="_blank" class="text-blue-600 hover:text-blue-700">
                    Переглянути на Untappd ↗
                  </a>
                </span>
              </p>
              <p class="text-xs text-gray-500">
                Останнє оновлення: {{ formatDate(mapping.last_synced) }}
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  :checked="mapping.auto_sync_enabled"
                  @change="toggleAutoSync(mapping.product_id, $event.target.checked)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Авто-синхронізація</span>
              </label>
              
              <button
                @click="syncMapping(mapping)"
                class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Синхронізувати
              </button>
              
              <button
                @click="removeMapping(mapping.product_id)"
                class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h4 class="font-medium text-gray-900 mb-3">Масові дії</h4>
        <div class="flex gap-3">
          <button
            @click="syncAllMappings"
            :disabled="syncing"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
          >
            {{ syncing ? 'Синхронізація...' : 'Синхронізувати всі' }}
          </button>
          
          <button
            @click="exportMappings"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Експортувати прив\'язки
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import untappdService from '@/services/untappdService'
import type { UntappdBeer, ProductUntappdMapping } from '@/types/untappd'
import type { Product } from '@/types'

// Store
const productStore = useProductStore()

// State
const selectedProductId = ref('')
const untappdInput = ref('')
const searchResults = ref<UntappdBeer[]>([])
const mappings = ref<ProductUntappdMapping[]>([])
const searching = ref(false)
const linking = ref(false)
const syncing = ref(false)
const serviceStatus = ref({ available: false, note: '' })

// Computed
const beerProducts = computed(() => 
  productStore.products.filter(p => 
    p.category_name?.toLowerCase().includes('пиво') || 
    p.name.toLowerCase().includes('пиво') ||
    p.category_name?.toLowerCase().includes('beer')
  )
)

// Methods
const loadMappings = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/untappd/mappings`)
    if (response.ok) {
      const data = await response.json()
      mappings.value = data.mappings || []
    }
  } catch (error) {
    console.error('Error loading mappings:', error)
  }
}

const searchUntappd = async () => {
  if (!selectedProductId.value) return

  const product = productStore.products.find(p => p.id === selectedProductId.value)
  if (!product) return

  searching.value = true
  try {
    const results = await untappdService.searchBeer(product.name, 'Опілля')
    searchResults.value = results
  } catch (error) {
    console.error('Error searching Untappd:', error)
  } finally {
    searching.value = false
  }
}

const selectBeer = (beer: UntappdBeer) => {
  untappdInput.value = beer.beer_id.toString()
}

const linkProduct = async () => {
  if (!selectedProductId.value || !untappdInput.value) return

  linking.value = true
  try {
    // Extract beer ID from URL or use direct ID
    let beerId: number
    if (untappdInput.value.includes('untappd.com')) {
      const match = untappdInput.value.match(/\/b\/[^\/]+\/(\d+)/)
      if (!match) {
        alert('Невірний формат Untappd URL')
        return
      }
      beerId = parseInt(match[1])
    } else {
      beerId = parseInt(untappdInput.value)
    }

    // Save mapping to backend
    const mappingData = {
      product_id: selectedProductId.value,
      untappd_beer_id: beerId,
      untappd_url: untappdInput.value.includes('untappd.com') ? untappdInput.value : undefined,
      auto_sync_enabled: true
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/untappd/mappings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mappingData)
    })

    if (!response.ok) {
      throw new Error('Failed to save mapping')
    }

    // Reload mappings from backend
    await loadMappings()

    // Clear form
    selectedProductId.value = ''
    untappdInput.value = ''
    searchResults.value = []

    alert('Продукт успішно прив\'язано до Untappd!')
  } catch (error) {
    console.error('Error linking product:', error)
    alert('Помилка прив\'язки продукту')
  } finally {
    linking.value = false
  }
}

const toggleAutoSync = async (productId: string, enabled: boolean) => {
  try {
    const mapping = mappings.value.find(m => m.product_id === productId)
    if (mapping) {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/untappd/mappings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          untappd_beer_id: mapping.untappd_beer_id,
          untappd_url: mapping.untappd_url,
          auto_sync_enabled: enabled
        })
      })

      if (response.ok) {
        await loadMappings()
      }
    }
  } catch (error) {
    console.error('Error updating auto sync:', error)
  }
}

const syncMapping = async (mapping: ProductUntappdMapping) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/untappd/mappings/${mapping.product_id}/sync`, {
      method: 'POST'
    })

    if (response.ok) {
      const data = await response.json()
      await loadMappings() // Reload to get updated sync time
      await productStore.fetchProducts() // Reload products to get updated info
      alert('Синхронізація завершена!')
    } else {
      throw new Error('Failed to sync mapping')
    }
  } catch (error) {
    console.error('Error syncing mapping:', error)
    alert('Помилка синхронізації')
  }
}

const removeMapping = async (productId: string) => {
  if (confirm('Видалити прив\'язку до Untappd?')) {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/untappd/mappings/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadMappings()
        alert('Прив\'язку видалено!')
      } else {
        throw new Error('Failed to delete mapping')
      }
    } catch (error) {
      console.error('Error removing mapping:', error)
      alert('Помилка видалення прив\'язки')
    }
  }
}

const syncAllMappings = async () => {
  syncing.value = true
  try {
    for (const mapping of mappings.value.filter(m => m.auto_sync_enabled)) {
      await syncMapping(mapping)
    }
    alert('Всі прив\'язки синхронізовано!')
  } catch (error) {
    console.error('Error syncing all mappings:', error)
    alert('Помилка масової синхронізації')
  } finally {
    syncing.value = false
  }
}

const exportMappings = () => {
  const data = JSON.stringify(mappings.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'untappd-mappings.json'
  a.click()
  URL.revokeObjectURL(url)
}

const getProductName = (productId: string): string => {
  const product = productStore.products.find(p => p.id === productId)
  return product?.display_name || product?.name || 'Невідомий продукт'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('uk-UA')
}

// Lifecycle
onMounted(async () => {
  await productStore.fetchProducts()

  // Check service status
  try {
    serviceStatus.value = await untappdService.getServiceStatus()
  } catch (error) {
    console.error('Failed to check service status:', error)
    serviceStatus.value = { available: false, note: 'Помилка підключення до сервісу' }
  }

  // Load existing mappings from backend
  await loadMappings()
})
</script>
