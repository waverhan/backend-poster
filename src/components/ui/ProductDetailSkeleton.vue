<template>
  <!-- Product Detail Skeleton -->
  <div class="product-detail-skeleton max-w-7xl mx-auto px-4 py-8">
    <!-- Mobile Layout -->
    <div class="block md:hidden space-y-6">
      <!-- Product Image -->
      <SkeletonLoader variant="rectangle" width="100%" height="400px" rounded />

      <!-- Product Info -->
      <div class="space-y-4">
        <!-- Category Badge -->
        <SkeletonLoader variant="text" width="100px" height="24px" />

        <!-- Product Name -->
        <div class="space-y-2">
          <SkeletonLoader variant="text" width="100%" height="32px" />
          <SkeletonLoader variant="text" width="70%" height="32px" />
        </div>

        <!-- Price -->
        <SkeletonLoader variant="text" width="120px" height="40px" />

        <!-- Description -->
        <div class="space-y-2">
          <SkeletonLoader variant="text" width="100%" height="16px" />
          <SkeletonLoader variant="text" width="100%" height="16px" />
          <SkeletonLoader variant="text" width="80%" height="16px" />
        </div>

        <!-- Add to Cart Button -->
        <SkeletonLoader variant="rectangle" width="100%" height="56px" rounded />
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:grid md:grid-cols-2 md:gap-12">
      <!-- Left Column: Image -->
      <div>
        <SkeletonLoader variant="rectangle" width="100%" height="600px" rounded />
      </div>

      <!-- Right Column: Info -->
      <div class="space-y-6">
        <!-- Category Badge -->
        <SkeletonLoader variant="text" width="120px" height="28px" />

        <!-- Product Name -->
        <div class="space-y-2">
          <SkeletonLoader variant="text" width="100%" height="40px" />
          <SkeletonLoader variant="text" width="60%" height="40px" />
        </div>

        <!-- Price -->
        <SkeletonLoader variant="text" width="150px" height="48px" />

        <!-- Description -->
        <div class="space-y-3">
          <SkeletonLoader variant="text" width="100%" height="20px" />
          <SkeletonLoader variant="text" width="100%" height="20px" />
          <SkeletonLoader variant="text" width="100%" height="20px" />
          <SkeletonLoader variant="text" width="90%" height="20px" />
        </div>

        <!-- Attributes -->
        <div class="flex gap-3">
          <SkeletonLoader variant="rectangle" width="80px" height="40px" rounded />
          <SkeletonLoader variant="rectangle" width="80px" height="40px" rounded />
          <SkeletonLoader variant="rectangle" width="80px" height="40px" rounded />
        </div>

        <!-- Add to Cart Button -->
        <SkeletonLoader variant="rectangle" width="100%" height="64px" rounded />
      </div>
    </div>

    <!-- Related Products Section -->
    <div class="mt-12 space-y-4">
      <SkeletonLoader variant="text" width="200px" height="32px" />
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ProductCardSkeleton v-for="i in 4" :key="i" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue'
import ProductCardSkeleton from './ProductCardSkeleton.vue'
</script>

<style scoped>
.product-detail-skeleton {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

