<template>
  <!-- Cart Item Skeleton -->
  <div class="cart-item-skeleton bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
    <div class="flex items-start gap-4">
      <!-- Product Image -->
      <SkeletonLoader variant="rectangle" width="100px" height="100px" rounded />

      <!-- Product Info -->
      <div class="flex-1 space-y-3">
        <!-- Product Name -->
        <div class="space-y-1">
          <SkeletonLoader variant="text" width="100%" height="18px" />
          <SkeletonLoader variant="text" width="60%" height="18px" />
        </div>

        <!-- Price and Quantity Row -->
        <div class="flex items-center justify-between">
          <!-- Price -->
          <SkeletonLoader variant="text" width="80px" height="24px" />

          <!-- Quantity Controls -->
          <div class="flex items-center gap-2">
            <SkeletonLoader variant="circle" width="48px" height="48px" />
            <SkeletonLoader variant="text" width="40px" height="24px" />
            <SkeletonLoader variant="circle" width="48px" height="48px" />
          </div>
        </div>
      </div>

      <!-- Delete Button -->
      <SkeletonLoader variant="circle" width="48px" height="48px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue'
</script>

<style scoped>
.cart-item-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>

