<template>
  <Teleport to="body">
    <Transition name="success-fade">
      <div v-if="visible" class="success-animation-overlay">
        <div class="success-animation-content">
          <!-- Checkmark Circle Animation -->
          <div class="checkmark-circle">
            <svg class="checkmark" viewBox="0 0 52 52">
              <circle class="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>

          <!-- Success Message -->
          <h3 class="success-title">{{ title }}</h3>
          <p v-if="message" class="success-message">{{ message }}</p>

          <!-- Confetti (optional) -->
          <div v-if="showConfetti" class="confetti-container">
            <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  title?: string
  message?: string
  showConfetti?: boolean
  duration?: number // Auto-hide after duration (ms)
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Успіх!',
  message: '',
  showConfetti: false,
  duration: 2000
})

const emit = defineEmits<{
  close: []
}>()

// Auto-hide after duration
watch(() => props.visible, (newValue) => {
  if (newValue && props.duration > 0) {
    setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

// Generate random confetti styles
const getConfettiStyle = (index: number) => {
  const colors = ['#FF6B35', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A78BFA']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomLeft = Math.random() * 100
  const randomDelay = Math.random() * 0.5
  const randomDuration = 1 + Math.random() * 1

  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}
</script>

<style scoped>
.success-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.success-animation-content {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* Checkmark Animation */
.checkmark-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  position: relative;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #4CAF50;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #4CAF50;
  animation: checkmark-fill 0.4s ease-in-out 0.4s forwards, checkmark-scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle-path {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #4CAF50;
  fill: none;
  animation: checkmark-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkmark-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes checkmark-stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes checkmark-scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes checkmark-fill {
  100% {
    box-shadow: inset 0 0 0 30px #4CAF50;
  }
}

/* Success Text */
.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.success-message {
  font-size: 1rem;
  color: #6b7280;
}

/* Confetti Animation */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  opacity: 0;
  animation: confetti-fall 2s linear forwards;
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 1;
  }
}

/* Transition */
.success-fade-enter-active,
.success-fade-leave-active {
  transition: opacity 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
}

/* Dark mode */
.dark .success-animation-content {
  background: #1f2937;
}

.dark .success-title {
  color: #f9fafb;
}

.dark .success-message {
  color: #d1d5db;
}
</style>

