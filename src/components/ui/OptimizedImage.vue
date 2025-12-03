<template>
  <div :class="['optimized-image-wrapper relative overflow-hidden', wrapperClass]" :style="wrapperStyle">
    <picture class="block h-full w-full">
      <source
        v-if="avifSrcset"
        :srcset="avifSrcset"
        :sizes="sizes"
        type="image/avif"
      />
      <source
        v-if="webpSrcset"
        :srcset="webpSrcset"
        :sizes="sizes"
        type="image/webp"
      />
      <img
        :src="fallbackSrc"
        :srcset="fallbackSrcset || undefined"
        :sizes="supportsTransform ? sizes : undefined"
        :alt="alt"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        decoding="async"
        :class="['h-full w-full transition-transform duration-300', objectFitClass, imgClass]"
        @load="$emit('load', $event)"
        @error="$emit('error', $event)"
      />
    </picture>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import backendApi from '@/services/backendApi'

interface Props {
  src: string
  alt: string
  widths?: number[]
  sizes?: string
  aspectRatio?: string
  priority?: boolean
  wrapperClass?: string
  imgClass?: string
  objectFit?: 'cover' | 'contain'
  quality?: number
}

const props = withDefaults(defineProps<Props>(), {
  widths: () => [360, 640, 960, 1280],
  sizes: '100vw',
  priority: false,
  objectFit: 'cover',
  wrapperClass: '',
  imgClass: '',
  quality: 82
})

defineEmits<{ load: [event: Event]; error: [event: Event] }>()

const supportsTransform = computed(() => {
  if (!props.src) return false
  return props.src.includes('/api/upload/minio-image')
})

const baseSrc = computed(() => backendApi.getImageUrl(props.src))

const buildSrcset = (format?: 'webp' | 'avif' | 'jpeg' | 'png') => {
  if (!supportsTransform.value || !props.widths?.length) return ''

  return props.widths
    .map((width) => {
      const optimizedUrl = backendApi.getOptimizedImageUrl(props.src, {
        width,
        format,
        quality: props.quality
      })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

const avifSrcset = computed(() => buildSrcset('avif'))
const webpSrcset = computed(() => buildSrcset('webp'))
const fallbackSrcset = computed(() => buildSrcset())

const fallbackSrc = computed(() => {
  if (supportsTransform.value && props.widths?.length) {
    const largestWidth = props.widths[props.widths.length - 1]
    return backendApi.getOptimizedImageUrl(props.src, { width: largestWidth, quality: props.quality })
  }
  return baseSrc.value
})

const wrapperStyle = computed(() => {
  if (!props.aspectRatio) return undefined
  return {
    aspectRatio: props.aspectRatio
  }
})

const objectFitClass = computed(() => (props.objectFit === 'contain' ? 'object-contain' : 'object-cover'))
</script>

<style scoped>
.optimized-image-wrapper img {
  transform: scale(1.01);
}

.optimized-image-wrapper img:where(:hover, :focus-visible) {
  transform: scale(1.015);
}
</style>
