<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            ← Повернутися до магазину
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Наші магазини</h1>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="spinner w-8 h-8 mx-auto mb-4"></div>
          <p class="text-gray-600">Завантаження магазинів...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-4xl mb-4">❌</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Помилка завантаження</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button @click="loadBranches" class="btn-primary">
            Спробувати знову
          </button>
        </div>

        <!-- Branches Content -->
        <div v-else-if="branches.length > 0">

          <!-- Hero Section -->
          <div class="text-center mb-12">
            <div class="text-6xl mb-4">🏪</div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
              Opillia - Мережа магазинів якісних напоїв
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Відвідайте наші магазини в Києві для особистого вибору продукції або оформіть замовлення з доставкою.
            </p>
          </div>

          <!-- Services Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="text-center p-6 bg-blue-50 rounded-lg">
              <div class="text-3xl mb-3">🚚</div>
              <h3 class="font-semibold text-gray-900 mb-2">Доставка</h3>
              <p class="text-gray-600 text-sm">Доставляємо по Києву щодня 10:00-22:00</p>
            </div>
            <div class="text-center p-6 bg-green-50 rounded-lg">
              <div class="text-3xl mb-3">🏪</div>
              <h3 class="font-semibold text-gray-900 mb-2">Самовивіз</h3>
              <p class="text-gray-600 text-sm">Безкоштовний самовивіз з наших магазинів</p>
            </div>
            <div class="text-center p-6 bg-yellow-50 rounded-lg">
              <div class="text-3xl mb-3">🕒</div>
              <h3 class="font-semibold text-gray-900 mb-2">Зручний графік</h3>
              <p class="text-gray-600 text-sm">Працюємо щодня 10:00-22:00</p>
            </div>
          </div>

          <!-- Dynamic Branches Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(branch, index) in branches"
              :key="branch.id"
              class="border rounded-lg p-6"
              :class="index === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'"
            >
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 mb-2">
                        🏪 {{ branch.name }}
                      </h3>
                      <div class="flex items-center mb-2">
                        <span
                          v-if="index === 0"
                          class="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mr-2"
                        >
                          Головний магазин
                        </span>
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          Працює
                        </span>
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          Доставка
                        </span>
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                          Самовивіз
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-start">
                      <span class="text-primary-600 mr-3 mt-1">📍</span>
                      <div>
                        <p class="font-medium text-gray-900">{{ branch.address || 'Адреса не вказана' }}</p>
                      </div>
                    </div>

                    <div class="flex items-center">
                      <span class="text-primary-600 mr-3">📞</span>
                      <p class="text-gray-700">{{ branch.phone || '+38 (097) 324 46 68' }}</p>
                    </div>

                    <div class="flex items-center">
                      <span class="text-primary-600 mr-3">🕒</span>
                      <p class="text-gray-700">{{ branch.working_hours || 'Щодня 10:00-22:00' }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    @click="showOnMap(branch.address || branch.name)"
                    class="w-full btn-primary text-sm"
                    :disabled="!branch.address && !branch.name"
                  >
                    📍 Показати на карті
                  </button>
                  <button
                    @click="getDirections(branch.address || branch.name)"
                    class="w-full btn-outline text-sm"
                    :disabled="!branch.address && !branch.name"
                  >
                    🧭 Прокласти маршрут
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Branches State -->
        <div v-else class="text-center py-12">
          <div class="text-4xl mb-4">🏪</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Магазини не знайдено</h3>
          <p class="text-gray-600">Наразі немає доступних магазинів.</p>
        </div>


          <!-- Additional Information -->
          <div class="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Чому обирають Opillia?</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl mb-3">🍺</div>
                <h4 class="font-semibold text-gray-900 mb-2">Якісні напої</h4>
                <p class="text-gray-600 text-sm">Ретельно відібрані крафтові пива, вина та делікатеси</p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-3">🚚</div>
                <h4 class="font-semibold text-gray-900 mb-2">Швидка доставка</h4>
                <p class="text-gray-600 text-sm">Доставляємо по Києву протягом 1-2 годин</p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-3">👨‍💼</div>
                <h4 class="font-semibold text-gray-900 mb-2">Експертні поради</h4>
                <p class="text-gray-600 text-sm">Наші консультанти допоможуть з вибором</p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="mt-16 pt-12 border-t border-gray-200">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Потрібна допомога?</h3>
              <p class="text-gray-600 mb-8">
                Наші консультанти допоможуть вам обрати найближчий магазин та оформити замовлення
              </p>
              <div class="flex justify-center space-x-4">
                <a href="tel:+380973244668" class="btn-primary">
                  📞 +38 (097) 324 46 68
                </a>
                <router-link to="/contact" class="btn-outline">
                  ✉️ Написати нам
                </router-link>
              </div>
            </div>
          </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBranchStore } from '@/stores/branch'
import type { Branch } from '@/types'

// Page meta
document.title = 'Наші магазини - Opillia Shop'

// Store
const branchStore = useBranchStore()
const { branches } = storeToRefs(branchStore)

// Local state
const loading = ref(false)
const error = ref<string | null>(null)

// Load branches from database
const loadBranches = async () => {
  loading.value = true
  error.value = null

  try {
    
    await branchStore.fetchBranches(true, true) // force=true, useDatabase=true
    
  } catch (err: any) {
    console.error('❌ Failed to load branches:', err)
    error.value = err.message || 'Failed to load branches'
  } finally {
    loading.value = false
  }
}

// Map functionality
const showOnMap = (address: string) => {
  if (!address) return

  // Add "Київ" to the search if it's not already included
  const searchQuery = address.includes('Київ') ? address : `${address}, Київ`

  // Open Google Maps with the address
  const encodedAddress = encodeURIComponent(searchQuery)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  window.open(googleMapsUrl, '_blank')
}

const getDirections = (address: string) => {
  if (!address) return

  // Add "Київ" to the search if it's not already included
  const searchQuery = address.includes('Київ') ? address : `${address}, Київ`

  // Open Google Maps directions
  const encodedAddress = encodeURIComponent(searchQuery)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
  window.open(directionsUrl, '_blank')
}

// Lifecycle
onMounted(async () => {
  
  await loadBranches()
})
</script>
