<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="!isOnline" class="offline-banner">
        <div class="offline-content">
          <div class="offline-icon">📡</div>
          <div class="offline-text">
            <p class="offline-title">Немає з'єднання</p>
            <p class="offline-message">Перевірте підключення до інтернету</p>
          </div>
        </div>
        <div v-if="reconnecting" class="offline-reconnecting">
          <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="text-sm">Підключення...</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const reconnecting = ref(false)
let reconnectTimeout: NodeJS.Timeout | null = null

const handleOnline = () => {
  isOnline.value = true
  reconnecting.value = false
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
}

const handleOffline = () => {
  isOnline.value = false
  // Start reconnecting animation after 2 seconds
  reconnectTimeout = setTimeout(() => {
    reconnecting.value = true
  }, 2000)
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
  }
})
</script>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 1200px;
  margin: 0 auto;
}

.offline-icon {
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.offline-text {
  flex: 1;
}

.offline-title {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
}

.offline-message {
  font-size: 0.8125rem;
  opacity: 0.9;
  margin: 0.125rem 0 0 0;
  line-height: 1.4;
}

.offline-reconnecting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .offline-banner {
    padding: 0.75rem 1rem;
  }
  
  .offline-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .offline-reconnecting {
    margin-top: 0.5rem;
  }
}
</style>

