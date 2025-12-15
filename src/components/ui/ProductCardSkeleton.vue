<template>
  <!-- Mobile Product Card Skeleton -->
  <div class="product-card-skeleton bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
    <!-- Image Skeleton -->
    <div class="relative aspect-square bg-gray-200 dark:bg-gray-700">
      <SkeletonLoader variant="rectangle" width="100%" height="100%" />
    </div>

    <!-- Content Skeleton -->
    <div class="p-3 space-y-2">
      <!-- Category Badge -->
      <SkeletonLoader variant="text" width="60px" height="20px" />

      <!-- Product Name (2 lines) -->
      <div class="space-y-1">
        <SkeletonLoader variant="text" width="100%" height="16px" />
        <SkeletonLoader variant="text" width="70%" height="16px" />
      </div>

      <!-- Price -->
      <SkeletonLoader variant="text" width="80px" height="24px" />

      <!-- Add to Cart Button -->
      <SkeletonLoader variant="rectangle" width="100%" height="48px" rounded />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue'
</script>

<style scoped>
.product-card-skeleton {
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

