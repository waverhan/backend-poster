<template>
  <Teleport to="body">
    <div class="fixed inset-0 pointer-events-none z-[100]">
      <div
        v-for="animation in animations"
        :key="animation.id"
        class="fixed"
        :style="{
          left: animation.startX + 'px',
          top: animation.startY + 'px',
          '--end-x': (animation.endX - animation.startX) + 'px',
          '--end-y': (animation.endY - animation.startY) + 'px'
        }"
      >
        <div class="cart-animation-item">
          🛒
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CartAnimation {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
}

const animations = ref<CartAnimation[]>([])

const addAnimation = (startX: number, startY: number, endX: number, endY: number) => {
  

  const id = `anim_${Date.now()}_${Math.random()}`
  const animation: CartAnimation = {
    id,
    startX,
    startY,
    endX,
    endY
  }

  animations.value.push(animation)
  

  // Remove animation after it completes
  setTimeout(() => {
    animations.value = animations.value.filter(a => a.id !== id)
    
  }, 800)
}

onMounted(() => {
  
})

defineExpose({
  addAnimation
})
</script>

<style scoped>
@keyframes flyToCart {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x), var(--end-y)) scale(0.2);
    opacity: 0;
  }
}

.cart-animation-item {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  animation: flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  will-change: transform, opacity;
}
</style>

