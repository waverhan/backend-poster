<template>
  <div v-if="isOnSale && timeRemaining" class="sale-countdown">
    <div class="flex items-center gap-2 text-sm">
      <div class="flex items-center gap-1 font-mono text-red-700">
        <span v-if="timeRemaining.days > 0" class="bg-red-100 px-2 py-1 rounded">
          {{ timeRemaining.days }}д
        </span>
        <span v-if="timeRemaining.hours > 0 || timeRemaining.days > 0" class="bg-red-100 px-2 py-1 rounded">
          {{ String(timeRemaining.hours).padStart(2, '0') }}г
        </span>
        <span class="bg-red-100 px-2 py-1 rounded">
          {{ String(timeRemaining.minutes).padStart(2, '0') }}хв
        </span>
        <span class="bg-red-100 px-2 py-1 rounded">
          {{ String(timeRemaining.seconds).padStart(2, '0') }}с
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Product } from '@/types'

interface Props {
  product: Product
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  saleExpired: [product: Product]
}>()

const currentTime = ref(Date.now())
let intervalId: number | null = null

const isOnSale = computed(() => {
  return props.product.original_price &&
         props.product.original_price > props.product.price
})

const timeRemaining = computed((): TimeRemaining | null => {
  if (!isOnSale.value) {
    return null
  }

  let expirationTime: number

  if (props.product.sale_expires_at) {
    // Use the provided expiration time
    expirationTime = new Date(props.product.sale_expires_at).getTime()
  } else {
    // Default to 24 hours from now if no expiration is set
    expirationTime = currentTime.value + (24 * 60 * 60 * 1000)
  }

  const total = expirationTime - currentTime.value

  if (total <= 0 && props.product.sale_expires_at) {
    // Sale has expired (only emit if there was an actual expiration date)
    emit('saleExpired', props.product)
    return null
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    total
  }
})

const startCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }

  intervalId = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
}

const stopCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  if (isOnSale.value) {
    startCountdown()
  }
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.sale-countdown {
  @apply bg-red-50 border border-red-200 rounded-lg p-3 mb-3;
}
</style>
