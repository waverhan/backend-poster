<template>
  <div v-if="banners.length > 0" class="relative overflow-hidden bg-white">
    <!-- Slider Container -->
    <div 
      class="flex transition-transform duration-500 ease-in-out"
      :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
    >
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="w-full flex-shrink-0 relative"
      >
        <!-- Banner Content -->
        <div class="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
          <!-- Background Image -->
          <div
            v-if="banner.image_url"
            class="absolute inset-0 bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${getImageUrl(banner.image_url)})` }"
          >
            <!-- Overlay for better text readability -->
            <div class="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
          
          <!-- Fallback gradient background -->
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-primary-400 to-purple-600"
          ></div>

          <!-- Content Overlay -->
          <div class="relative h-full flex items-center justify-center">
            <div class="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
              <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                {{ banner.title }}
              </h1>
              <p 
                v-if="banner.subtitle"
                class="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100"
              >
                {{ banner.subtitle }}
              </p>
              <div 
                v-if="banner.link_url && banner.link_text"
                class="flex justify-center"
              >
                <component
                  :is="isExternalLink(banner.link_url) ? 'a' : 'router-link'"
                  :to="isExternalLink(banner.link_url) ? undefined : banner.link_url"
                  :href="isExternalLink(banner.link_url) ? banner.link_url : undefined"
                  :target="isExternalLink(banner.link_url) ? '_blank' : undefined"
                  :rel="isExternalLink(banner.link_url) ? 'noopener noreferrer' : undefined"
                  class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg"
                >
                  {{ banner.link_text }}
                </component>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Dots -->
    <div 
      v-if="banners.length > 1"
      class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
    >
      <button
        v-for="(banner, index) in banners"
        :key="`dot-${banner.id}`"
        @click="goToSlide(index)"
        class="w-3 h-3 rounded-full transition-colors"
        :class="currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>

    <!-- Navigation Arrows -->
    <div v-if="banners.length > 1" class="absolute inset-y-0 left-0 flex items-center">
      <button
        @click="previousSlide"
        class="ml-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    
    <div v-if="banners.length > 1" class="absolute inset-y-0 right-0 flex items-center">
      <button
        @click="nextSlide"
        class="mr-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
        aria-label="Next slide"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBannerStore } from '@/stores/banners'

const bannerStore = useBannerStore()
const banners = computed(() => bannerStore.banners)

const currentSlide = ref(0)
let autoSlideInterval: NodeJS.Timeout | null = null

const goToSlide = (index: number) => {
  currentSlide.value = index
  resetAutoSlide()
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % banners.value.length
  resetAutoSlide()
}

const previousSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? banners.value.length - 1 : currentSlide.value - 1
  resetAutoSlide()
}

const startAutoSlide = () => {
  if (banners.value.length > 1) {
    autoSlideInterval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds
  }
}

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
    autoSlideInterval = null
  }
}

const resetAutoSlide = () => {
  stopAutoSlide()
  startAutoSlide()
}

const getImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${imageUrl}`
}

const isExternalLink = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://')
}

onMounted(async () => {
  await bannerStore.fetchBanners()
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>
