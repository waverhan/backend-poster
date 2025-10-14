<template>
  <div class="lazy-image-container" :class="containerClass">
    <!-- Loading placeholder -->
    <div 
      v-if="!loaded && !error" 
      class="lazy-image-placeholder"
      :class="placeholderClass"
    >
      <div class="animate-pulse bg-gray-200 w-full h-full flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Actual image -->
    <img
      v-show="loaded && !error"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :class="imageClass"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />

    <!-- Error fallback -->
    <div 
      v-if="error" 
      class="lazy-image-error"
      :class="errorClass"
    >
      <div class="bg-gray-100 w-full h-full flex items-center justify-center">
        <span class="text-4xl">🍽️</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt: string
  fallbackSrc?: string
  containerClass?: string
  imageClass?: string
  placeholderClass?: string
  errorClass?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  imageClass: 'w-full h-full object-cover transition-opacity duration-300',
  placeholderClass: '',
  errorClass: '',
  threshold: 0.1
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

// State
const imageRef = ref<HTMLImageElement>()
const loaded = ref(false)
const error = ref(false)
const observer = ref<IntersectionObserver>()

// Methods
const onLoad = (event: Event) => {
  loaded.value = true
  error.value = false
  emit('load', event)
}

const onError = (event: Event) => {
  const img = event.target as HTMLImageElement
  
  // Try fallback source if provided
  if (props.fallbackSrc && img.src !== props.fallbackSrc) {
    img.src = props.fallbackSrc
    return
  }
  
  error.value = true
  loaded.value = false
  emit('error', event)
}

const startLoading = () => {
  if (imageRef.value && props.src) {
    imageRef.value.src = props.src
  }
}

// Intersection Observer for lazy loading
onMounted(() => {
  if (!imageRef.value) return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startLoading()
          observer.value?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: '50px'
    }
  )

  observer.value.observe(imageRef.value)
})

onUnmounted(() => {
  if (observer.value && imageRef.value) {
    observer.value.unobserve(imageRef.value)
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image-placeholder,
.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

img {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

img[src] {
  opacity: 1;
}
</style>
