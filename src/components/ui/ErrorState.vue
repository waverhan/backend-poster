<template>
  <div class="error-state">
    <div class="error-icon">
      <div class="error-icon-circle">
        {{ icon }}
      </div>
    </div>
    
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    
    <div v-if="showRetry" class="error-actions">
      <button 
        @click="handleRetry" 
        class="retry-button"
        :disabled="retrying"
      >
        <svg v-if="retrying" class="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ retrying ? retryingText : retryText }}
      </button>
      
      <button v-if="showSecondaryAction" @click="handleSecondaryAction" class="secondary-button">
        {{ secondaryActionText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  icon?: string
  title?: string
  message?: string
  showRetry?: boolean
  retryText?: string
  retryingText?: string
  showSecondaryAction?: boolean
  secondaryActionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '⚠️',
  title: 'Щось пішло не так',
  message: 'Спробуйте ще раз або зверніться до служби підтримки',
  showRetry: true,
  retryText: 'Спробувати ще раз',
  retryingText: 'Завантаження...',
  showSecondaryAction: false,
  secondaryActionText: 'Повернутися назад'
})

const emit = defineEmits<{
  retry: []
  secondaryAction: []
}>()

const retrying = ref(false)

const handleRetry = async () => {
  retrying.value = true
  emit('retry')
  // Reset after 2 seconds to prevent stuck state
  setTimeout(() => {
    retrying.value = false
  }, 2000)
}

const handleSecondaryAction = () => {
  emit('secondaryAction')
}
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  min-height: 400px;
}

.error-icon {
  margin-bottom: 1.5rem;
  animation: errorBounce 0.6s ease-out;
}

.error-icon-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.error-message {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
}

.retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  min-height: var(--touch-target-comfortable);
}

.retry-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.retry-button:active:not(:disabled) {
  transform: translateY(0);
}

.retry-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: var(--touch-target-comfortable);
}

.secondary-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

@keyframes errorBounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-title {
    color: #f9fafb;
  }
  
  .error-message {
    color: #9ca3af;
  }
  
  .secondary-button {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  
  .secondary-button:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
}
</style>

