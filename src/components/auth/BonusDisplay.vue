<template>
  <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- Bonus icon -->
        <div class="bg-white bg-opacity-20 rounded-full p-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        
        <div>
          <h3 class="font-semibold text-lg">Бонусні бали</h3>
          <p class="text-orange-100 text-sm">Ваш поточний баланс</p>
        </div>
      </div>
      
      <div class="text-right">
        <div class="text-2xl font-bold">{{ formatNumber(bonusPoints) }}</div>
        <div class="text-orange-100 text-sm">балів</div>
      </div>
    </div>
    
    <!-- Additional info -->
    <div v-if="showDetails" class="mt-4 pt-4 border-t border-orange-400 border-opacity-30">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-orange-100">Всього витрачено:</p>
          <p class="font-semibold">{{ formatCurrency(totalSpent) }}</p>
        </div>
        <div>
          <p class="text-orange-100">Економія:</p>
          <p class="font-semibold">{{ formatCurrency(bonusPoints) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Refresh button -->
    <button
      v-if="showRefresh"
      @click="refreshBonus"
      :disabled="isRefreshing"
      class="mt-3 w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
    >
      <span v-if="isRefreshing" class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Оновлення...
      </span>
      <span v-else class="flex items-center justify-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Оновити баланс
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Props
interface Props {
  bonusPoints?: number
  totalSpent?: number
  showDetails?: boolean
  showRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bonusPoints: 0,
  totalSpent: 0,
  showDetails: true,
  showRefresh: true
})

// Store
const authStore = useAuthStore()

// State
const isRefreshing = ref(false)

// Computed
const bonusPoints = computed(() => {
  return props.bonusPoints || authStore.userBonusPoints
})

const totalSpent = computed(() => {
  return props.totalSpent || authStore.userTotalSpent
})

// Methods
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('uk-UA').format(num)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const refreshBonus = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  try {
    await authStore.getBonusInfo()
  } catch (error) {
    console.error('Failed to refresh bonus info:', error)
  } finally {
    isRefreshing.value = false
  }
}
</script>
