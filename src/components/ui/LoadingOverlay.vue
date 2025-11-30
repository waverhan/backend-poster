<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center safe-area" style="background-color: rgba(255, 255, 255, 0.9)">
      <!-- Loading spinner container -->
      <div class="flex flex-col items-center justify-center">
        <!-- FoodAppi-style animated bars spinner -->
        <div class="flex items-end justify-center gap-1 mb-6">
          <div class="loading-bar" style="animation-delay: 0s"></div>
          <div class="loading-bar" style="animation-delay: 0.15s"></div>
          <div class="loading-bar" style="animation-delay: 0.3s"></div>
        </div>

        <!-- Loading text -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ loadingText }}
        </h3>
        <p class="text-gray-600 text-sm">
          {{ loadingSubtext }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

const isVisible = computed(() => loadingStore.globalLoading)

const loadingText = computed(() => {
  const keys = loadingStore.loadingKeys
  if (keys.includes('categories')) return 'Завантаження категорій...'
  if (keys.includes('products')) return 'Завантаження товарів...'
  if (keys.includes('branches')) return 'Завантаження відділень...'
  if (keys.includes('checkout')) return 'Обробка замовлення...'
  if (keys.includes('orders')) return 'Завантаження замовлень...'
  return 'Завантаження...'
})

const loadingSubtext = computed(() => {
  const keys = loadingStore.loadingKeys
  if (keys.includes('categories')) return 'Підготовуємо категорії для вас'
  if (keys.includes('products')) return 'Підготовуємо товари для вас'
  if (keys.includes('branches')) return 'Знаходимо найближчі відділення'
  if (keys.includes('checkout')) return 'Будь ласка, зачекайте'
  if (keys.includes('orders')) return 'Завантажуємо вашу історію замовлень'
  return 'Будь ласка, зачекайте'
})
</script>

<style scoped>
.loading-bar {
  width: 4px;
  height: 10px;
  background-color: #696cff;
  border-radius: 2px;
  animation: barAnimation 0.6s ease-in-out infinite;
}

@keyframes barAnimation {
  0%, 100% {
    height: 10px;
    opacity: 0.2;
  }
  50% {
    height: 20px;
    opacity: 1;
  }
}

.safe-area {
  padding-top: max(env(safe-area-inset-top), 0);
  padding-bottom: max(env(safe-area-inset-bottom), 0);
  padding-left: max(env(safe-area-inset-left), 0);
  padding-right: max(env(safe-area-inset-right), 0);
}
</style>
