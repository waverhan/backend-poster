<template>
  <div 
    v-if="isNew" 
    class="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse"
  >
    ✨ Новинка
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  product: {
    is_new?: boolean
    new_until?: string
    created_at?: string
  }
}

const props = defineProps<Props>()

const isNew = computed(() => {
  if (!props.product.is_new) return false
  
  // Check if new_until date has passed
  if (props.product.new_until) {
    const newUntilDate = new Date(props.product.new_until)
    const now = new Date()
    return now <= newUntilDate
  }
  
  // Fallback: show as new for 14 days from creation
  if (props.product.created_at) {
    const createdDate = new Date(props.product.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 14
  }
  
  return false
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
