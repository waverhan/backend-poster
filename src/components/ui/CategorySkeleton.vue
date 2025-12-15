<template>
  <!-- Category Section Skeleton -->
  <div class="category-skeleton mb-8">
    <!-- Category Header -->
    <div class="flex items-center justify-between mb-4 px-4">
      <!-- Category Name -->
      <SkeletonLoader variant="text" width="150px" height="28px" />
      
      <!-- Product Count -->
      <SkeletonLoader variant="text" width="60px" height="20px" />
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-2 gap-3 px-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <ProductCardSkeleton v-for="i in count" :key="i" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonLoader from './SkeletonLoader.vue'
import ProductCardSkeleton from './ProductCardSkeleton.vue'

interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 4
})
</script>

<style scoped>
.category-skeleton {
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

