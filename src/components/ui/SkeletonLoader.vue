<template>
  <div class="skeleton-loader" :class="[variant, { 'rounded': rounded }]" :style="customStyle">
    <div class="shimmer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'text' | 'circle' | 'rectangle' | 'card'
  width?: string
  height?: string
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rectangle',
  width: '100%',
  height: '20px',
  rounded: false
})

const customStyle = computed(() => ({
  width: props.width,
  height: props.height
}))
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f0f0f0 40%,
    #e0e0e0 50%,
    #f0f0f0 60%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.dark .skeleton-loader {
  background: linear-gradient(
    90deg,
    #2d2d2d 0%,
    #2d2d2d 40%,
    #3d3d3d 50%,
    #2d2d2d 60%,
    #2d2d2d 100%
  );
  background-size: 200% 100%;
}

.skeleton-loader.text {
  border-radius: 4px;
}

.skeleton-loader.circle {
  border-radius: 50%;
}

.skeleton-loader.rectangle {
  border-radius: 8px;
}

.skeleton-loader.card {
  border-radius: 16px;
}

.skeleton-loader.rounded {
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer-move 1.5s ease-in-out infinite;
}

.dark .shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

@keyframes shimmer-move {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>

