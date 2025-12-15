<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Offline Banner -->
    <OfflineBanner />

    <!-- Header (Outside flex container for sticky positioning) -->
    <AppHeader />

    <!-- Main App Content -->
    <div class="flex flex-col min-h-screen">
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
    <LoadingOverlay />

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
import OfflineBanner from '@/components/ui/OfflineBanner.vue'
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
    // Don't show global loading overlay - removed for better UX
    // loadingStore.setGlobalLoading(true)
    // loadingStore.startLoading('categories')
    // loadingStore.startLoading('products')

    // Load branches first (force=true to ensure fresh data on app startup)
    await branchStore.fetchBranches(true)
    console.log('📥 App.vue: Branches loaded:', branchStore.branches.length)

    // Get default branch ID from site config
    const configBranchId = siteConfigStore.currentConfig.default_shop_branch_id
    const branches = branchStore.branches
    const defaultBranch = branches.find(b => b.id === configBranchId) || branches[0]

    if (defaultBranch) {
      branchStore.selectBranch(defaultBranch)
      console.log('🎯 App.vue: Selected default branch:', defaultBranch.name, '(config ID:', configBranchId, ')')

      // STEP 1: Load categories only (no products preloading)
      console.log('📥 App.vue: STEP 1 - Loading categories...')
      const categories = await productStore.fetchCategories(true, true, false) // force=true, useDatabase=true, includeInactive=false
      console.log('📥 App.vue: STEP 1 - Categories loaded:', categories?.length || 0)

      if (!categories || categories.length === 0) {
        console.error('❌ App.vue: No categories returned from fetchCategories!')
        throw new Error('Failed to load categories')
      }

      console.log('✅ App.vue: Categories preloaded. Products will load on-demand when user visits shop.')
    } else {
      console.warn('⚠️ App.vue: No default branch found')
    }
  } catch (error) {
    console.warn('⚠️ App.vue: Failed to preload data:', error)
    // Don't show error notification on app startup - let individual pages handle their own loading
  } finally {
    // Don't show global loading overlay - removed for better UX
    // loadingStore.stopLoading('categories')
    // loadingStore.stopLoading('products')
    // loadingStore.setGlobalLoading(false)
  }

  // Welcome notification removed - was showing unwanted popup

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
