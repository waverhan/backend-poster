<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Promotion Popup Slider -->
    <PromotionPopupSlider />

    <!-- Banner Slider -->
    <BannerSlider />

    <!-- Fallback Hero Section (shown when no banners) -->
    <div v-if="!hasBanners" class="relative bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            class="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div class="relative pt-6 px-4 sm:px-6 lg:px-8">
            <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div class="sm:text-center lg:text-left">
                <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span class="block xl:inline">{{ siteConfig.hero_title }}</span>
                </h1>
                <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {{ siteConfig.hero_subtitle }}
                </p>
                <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div class="rounded-md shadow">
                    <router-link
                      to="/shop"
                      class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      {{ siteConfig.hero_cta_text }}
                    </router-link>
                  </div>
                  <div class="mt-3 sm:mt-0 sm:ml-3">
                    <router-link
                      to="/communication-demo"
                      class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      🤖 AI Demo
                    </router-link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          v-if="siteConfig.hero_banner_url && siteConfig.hero_banner_url !== '/hero-banner.jpg'"
          class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          :src="siteConfig.hero_banner_url"
          :alt="siteConfig.hero_title"
          @error="showFallbackBanner = true"
        />
        <div
          v-else
          class="h-56 w-full bg-gradient-to-br from-primary-400 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center"
        >
          <div class="text-center text-white">
            <div class="text-6xl mb-4">🛒</div>
            <p class="text-xl font-medium">{{ siteConfig.site_name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-primary-600 font-semibold tracking-wide uppercase">Можливості</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Сучасний досвід покупок
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Наш магазин використовує найновіші технології для зручних покупок
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div v-if="siteConfig.enable_ai_chat" class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  🤖
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">AI Помічник</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Розумний чат-бот допоможе знайти потрібні товари та відповість на питання
              </dd>
            </div>

            <div v-if="siteConfig.enable_recommendations" class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  🎯
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Персональні рекомендації</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Система рекомендацій пропонує товари на основі ваших уподобань
              </dd>
            </div>

            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  🚚
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Швидка доставка</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Доставка по Києву від {{ siteConfig.delivery_fee }} UAH, безкоштовно від {{ siteConfig.free_delivery_threshold }} UAH
              </dd>
            </div>

            <div v-if="siteConfig.enable_reviews" class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  ⭐
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Відгуки клієнтів</p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                Читайте відгуки інших покупців та діліться своїм досвідом
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-primary-50">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span class="block">Готові почати покупки?</span>
          <span class="block text-primary-600">Переходьте до каталогу товарів.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link
              to="/shop"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Почати покупки
            </router-link>
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <router-link
              to="/communication-demo"
              class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              Спробувати AI
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Admin Login Modal -->
  <AdminLogin
    v-if="showAdminLogin"
    @success="handleAdminLoginSuccess"
    @close="closeAdminLogin"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useBannerStore } from '@/stores/banners'
import { useAuthStore } from '@/stores/auth'
import BannerSlider from '@/components/BannerSlider.vue'
import PromotionPopupSlider from '@/components/PromotionPopupSlider.vue'
import AdminLogin from '@/components/auth/AdminLogin.vue'

const route = useRoute()
const router = useRouter()
const siteConfigStore = useSiteConfigStore()
const bannerStore = useBannerStore()
const authStore = useAuthStore()

const siteConfig = computed(() => siteConfigStore.currentConfig)
const showFallbackBanner = ref(false)
const hasBanners = computed(() => bannerStore.banners.length > 0)
const showAdminLogin = ref(false)

// Check if admin login is requested via query parameter
onMounted(() => {
  if (route.query.admin === 'true') {
    showAdminLogin.value = true
  }
})

const handleAdminLoginSuccess = () => {
  showAdminLogin.value = false

  // Redirect to admin panel or the originally requested page
  const redirectPath = route.query.redirect as string || '/admin'
  router.push(redirectPath)
}

const closeAdminLogin = () => {
  showAdminLogin.value = false

  // Remove admin query parameter
  router.replace({ query: { ...route.query, admin: undefined } })
}
</script>


