<template>
  <button
    v-if="isEnabled"
    @click="handleToggleLike"
    :disabled="loading"
    :class="[
      'flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'small' ? 'text-xs' : 'text-sm',
      variant === 'minimal' ? 'hover:bg-gray-100' : 'bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
    ]"
    :title="userHasLiked ? 'Видалити з улюблених' : 'Додати до улюблених'"
  >
    <!-- Heart Icon -->
    <span 
      :class="[
        'transition-all duration-200',
        size === 'small' ? 'text-sm' : 'text-base',
        userHasLiked ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'
      ]"
    >
      {{ userHasLiked ? '❤️' : '🤍' }}
    </span>

    <!-- Like Count -->
    <span 
      v-if="showCount && totalLikes > 0"
      :class="[
        'font-medium transition-colors',
        userHasLiked ? 'text-red-600' : 'text-gray-600'
      ]"
    >
      {{ totalLikes }}
    </span>

    <!-- Loading indicator -->
    <span v-if="loading" class="animate-spin text-xs">⏳</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import likeService from '@/services/likeService'
import type { Product } from '@/types'

interface Props {
  product: Product
  size?: 'small' | 'normal'
  variant?: 'default' | 'minimal'
  showCount?: boolean
  userId?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal',
  variant: 'default',
  showCount: true
})

// Store
const siteConfigStore = useSiteConfigStore()

// State
const totalLikes = ref(0)
const userHasLiked = ref(false)
const loading = ref(false)

// Computed
const isEnabled = computed(() => siteConfigStore.currentConfig.enable_likes)

// Methods
const loadLikeStatus = async () => {
  if (!isEnabled.value) return

  try {
    const status = await likeService.getProductLikeStatus(props.product.id, props.userId)
    totalLikes.value = status.total_likes
    userHasLiked.value = status.user_has_liked
  } catch (error) {
    console.error('Error loading like status:', error)
  }
}

const handleToggleLike = async () => {
  if (!isEnabled.value || loading.value) return

  loading.value = true
  try {
    const result = await likeService.toggleProductLike(props.product.id, props.userId)
    
    // Update local state
    totalLikes.value = result.total_likes
    userHasLiked.value = result.user_has_liked

    // Optional: Show feedback
    if (result.action === 'liked') {
      // Could emit event or show toast notification
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    // Could show error notification
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadLikeStatus()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
