<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <img
                v-if="siteConfig.logo_url && siteConfig.logo_url !== '/logo.png'"
                :src="siteConfig.logo_url"
                :alt="siteConfig.site_name"
                class="w-6 h-6 object-contain"
                @error="showFallbackLogo = true"
              />
              <span v-else class="text-white font-bold text-sm">🛒</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ siteConfig.site_name }}</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ siteConfig.site_description }}</p>
            </div>
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Contact Info -->
          <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <a
              href="tel:+380973244668"
              class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Зателефонувати нам"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 10.928c-.732.732-.732 1.919 0 2.651l4.261 4.261c.732.732 1.919.732 2.651 0l1.541-3.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+38 (097) 324 46 68</span>
            </a>
            <a
              href="mailto:info@opillia.com.ua"
              class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Написати нам"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@opillia.com.ua</span>
            </a>
          </div>

          <!-- Theme Toggle -->
          <ThemeToggle v-if="siteConfigStore.currentConfig.enable_dark_mode" />

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Cart Button -->
          <router-link
            to="/cart"
            class="relative btn-primary"
          >
            🛒 {{ $t('nav.cart') }}
            <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useSiteConfigStore } from '@/stores/siteConfig'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const cartStore = useCartStore()
const siteConfigStore = useSiteConfigStore()

const cartCount = computed(() => cartStore.totalItems || 0)
const siteConfig = computed(() => siteConfigStore.currentConfig)
const showFallbackLogo = ref(false)
</script>
