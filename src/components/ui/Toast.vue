<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast-${type}`]" @click="close">
        <div class="toast-icon">
          {{ iconMap[type] }}
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ message }}</p>
        </div>
        <button v-if="showClose" @click.stop="close" class="toast-close">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Props {
  message: string
  type?: ToastType
  duration?: number
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  showClose: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timeout: NodeJS.Timeout | null = null

const iconMap: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

const close = () => {
  visible.value = false
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  emit('close')
}

onMounted(() => {
  visible.value = true
  
  if (props.duration > 0) {
    timeout = setTimeout(() => {
      close()
    }, props.duration)
  }
})

watch(() => props.message, () => {
  visible.value = true
  if (timeout) {
    clearTimeout(timeout)
  }
  if (props.duration > 0) {
    timeout = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 90vw;
  min-width: 300px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: iconPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  line-height: 1.5;
}

.toast-close {
  flex-shrink: 0;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* Toast Types */
.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

@keyframes iconPop {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .toast {
    top: auto;
    bottom: calc(var(--safe-area-inset-bottom) + 80px);
    left: 1rem;
    right: 1rem;
    transform: none;
    min-width: auto;
  }
  
  .toast:hover {
    transform: translateY(-2px);
  }
  
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(100%);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .toast {
    background: #1f2937;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  .toast-message {
    color: #f9fafb;
  }
  
  .toast-close {
    color: #9ca3af;
  }
  
  .toast-close:hover {
    background: #374151;
    color: #f9fafb;
  }
}
</style>

