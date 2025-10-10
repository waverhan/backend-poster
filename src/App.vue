<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Network Status Banner -->
    <div
      v-if="!isOnline"
      class="bg-warning-500 text-white text-center py-2 px-4 text-sm font-medium safe-top"
    >
      📡 {{ $t('ui.offline') }}
    </div>

    <!-- Main App Content -->
    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="flex-1">
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <div :key="route.path" class="w-full">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />

    <!-- Global Notifications -->
    <NotificationContainer />

    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isGlobalLoading" />

    <!-- AI Chat Widget -->
    <ChatWidget @product-selected="handleProductSelected" />

    <!-- License Components -->
    <LicenseModal />
    <LicenseWarning />

    <!-- Cookie Consent Banner -->
    <CookieConsent />

    <!-- Install App Prompt -->
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNetworkStore } from '@/stores/network'
import { useNotificationStore } from '@/stores/notification'
import { useLoadingStore } from '@/stores/loading'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useThemeStore } from '@/stores/theme'
import { useDarkModeStore } from '@/stores/darkMode'
import { useBranchStore } from '@/stores/branch'
import { useProductStore } from '@/stores/product'
import { licenseService } from '@/services/licenseService'
import { storeToRefs } from 'pinia'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'
import LicenseModal from '@/components/license/LicenseModal.vue'
import LicenseWarning from '@/components/license/LicenseWarning.vue'
import CookieConsent from '@/components/CookieConsent.vue'
import InstallPrompt from '@/components/ui/InstallPrompt.vue'
import type { Product } from '@/types'

// Router and Stores
const router = useRouter()
const { t } = useI18n()
const networkStore = useNetworkStore()
const notificationStore = useNotificationStore()
const loadingStore = useLoadingStore()
const siteConfigStore = useSiteConfigStore()
const themeStore = useThemeStore()
const darkModeStore = useDarkModeStore()
const branchStore = useBranchStore()
const productStore = useProductStore()

// Reactive refs
const { isOnline } = storeToRefs(networkStore)
const { isGlobalLoading } = storeToRefs(loadingStore)

// Methods
const handleProductSelected = (product: Product) => {
  router.push(`/product/${product.id}`)
}

// Lifecycle
onMounted(async () => {
  // Initialize dark mode first
  darkModeStore.initialize()

  // Initialize theme system
  themeStore.initialize()

  // Initialize site configuration
  await siteConfigStore.initialize()

  // Apply theme and meta tags
  siteConfigStore.applyTheme()
  siteConfigStore.updateDocumentMeta()

  // Initialize network monitoring
  await networkStore.initialize()

  // Preload branches and categories for better UX
  try {
    console.log('🚀 App.vue: Starting data preloading...')

    // Load branches first
    await branchStore.fetchBranches()
    console.log('📥 App.vue: Branches loaded:', branchStore.branches.length)

    // Find and select default branch (Branch 4 or first available)
    const branches = branchStore.branches
    const defaultBranch = branches.find(b => b.name.includes('4')) || branches[0]

    if (defaultBranch) {
      branchStore.selectBranch(defaultBranch)
      console.log('🎯 App.vue: Selected default branch:', defaultBranch.name)

      // Preload categories and products for the default branch
      await productStore.fetchCategories(true) // force = true for fresh data
      console.log('📥 App.vue: Categories loaded:', productStore.categories.length)

      await productStore.fetchProducts(undefined, true, defaultBranch.id, true) // categoryId=undefined, force=true, branchId, useDatabase=true
      console.log('📥 App.vue: Products loaded:', productStore.products.length)

      console.log('✅ App.vue: Preloaded categories and products for default branch')
    } else {
      console.warn('⚠️ App.vue: No default branch found')
    }
  } catch (error) {
    console.warn('⚠️ App.vue: Failed to preload data:', error)
    // Don't show error notification on app startup - let individual pages handle their own loading
  }

  // Show welcome notification with site name
  const siteName = siteConfigStore.currentConfig.site_name
  notificationStore.add({
    type: 'success',
    title: `${t('ui.welcome')} ${siteName}!`,
    message: 'Modern AI-powered shopping experience',
    duration: 3000
  })

  // Initialize app
  console.log('App mounted and initialized')
})

onUnmounted(() => {
  // Cleanup
  networkStore.cleanup()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
