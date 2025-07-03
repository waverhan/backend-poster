<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Banner Management</h2>
        <p class="text-sm text-gray-600">Manage homepage banner slider</p>
      </div>
      <button
        @click="openBannerModal()"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Banner</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="bannerStore.loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading banners...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="bannerStore.error" class="text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-600 font-medium">{{ bannerStore.error }}</p>
      <button
        @click="loadBanners"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>

    <!-- Banners List -->
    <div v-else-if="banners.length > 0" class="space-y-4">
      <div
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        :class="{ 'opacity-50': !banner.is_active }"
      >
        <div class="flex items-start space-x-4">
          <!-- Banner Image Preview -->
          <div class="flex-shrink-0">
            <div class="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <img
                v-if="banner.image_url"
                :src="getImageUrl(banner.image_url)"
                :alt="banner.title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Banner Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ banner.title }}</h3>
                <p v-if="banner.subtitle" class="text-sm text-gray-600 mt-1">{{ banner.subtitle }}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Order: {{ banner.sort_order }}</span>
                  <span v-if="banner.link_url" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {{ banner.link_text || 'Link' }}
                  </span>
                  <span class="flex items-center">
                    <div
                      class="w-2 h-2 rounded-full mr-1"
                      :class="banner.is_active ? 'bg-green-500' : 'bg-red-500'"
                    ></div>
                    {{ banner.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2 ml-4">
                <!-- Move Up -->
                <button
                  v-if="index > 0"
                  @click="moveBanner(banner, 'up')"
                  class="p-1 text-gray-400 hover:text-gray-600"
                  title="Move up"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <!-- Move Down -->
                <button
                  v-if="index < banners.length - 1"
                  @click="moveBanner(banner, 'down')"
                  class="p-1 text-gray-400 hover:text-gray-600"
                  title="Move down"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Edit -->
                <button
                  @click="openBannerModal(banner)"
                  class="p-1 text-blue-600 hover:text-blue-800"
                  title="Edit banner"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Toggle Status -->
                <button
                  @click="toggleBannerStatus(banner)"
                  class="p-1"
                  :class="banner.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'"
                  :title="banner.is_active ? 'Deactivate' : 'Activate'"
                >
                  <svg v-if="banner.is_active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <!-- Delete -->
                <button
                  @click="deleteBanner(banner)"
                  class="p-1 text-red-600 hover:text-red-800"
                  title="Delete banner"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
      <p class="text-gray-600 mb-6">Create your first banner to get started with the homepage slider.</p>
      <button
        @click="openBannerModal()"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Create First Banner</span>
      </button>
    </div>

    <!-- Banner Edit Modal -->
    <BannerEditModal
      :is-open="showBannerModal"
      :banner="selectedBanner"
      @close="closeBannerModal"
      @save="handleBannerSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBannerStore } from '@/stores/banners'
import BannerEditModal from './BannerEditModal.vue'
import type { Banner } from '@/stores/banners'

const bannerStore = useBannerStore()
const banners = computed(() => bannerStore.banners)

const showBannerModal = ref(false)
const selectedBanner = ref<Banner | null>(null)

const loadBanners = async () => {
  await bannerStore.fetchAdminBanners()
}

const openBannerModal = (banner?: Banner) => {
  selectedBanner.value = banner || null
  showBannerModal.value = true
}

const closeBannerModal = () => {
  showBannerModal.value = false
  selectedBanner.value = null
}

const handleBannerSave = async () => {
  await loadBanners()
  closeBannerModal()
}

const toggleBannerStatus = async (banner: Banner) => {
  try {
    const formData = new FormData()
    formData.append('title', banner.title)
    formData.append('subtitle', banner.subtitle || '')
    formData.append('link_url', banner.link_url || '')
    formData.append('link_text', banner.link_text || '')
    formData.append('is_active', (!banner.is_active).toString())
    formData.append('sort_order', banner.sort_order.toString())

    await bannerStore.updateBanner(banner.id, formData)
  } catch (error) {
    console.error('Failed to toggle banner status:', error)
  }
}

const moveBanner = async (banner: Banner, direction: 'up' | 'down') => {
  const currentIndex = banners.value.findIndex(b => b.id === banner.id)
  if (currentIndex === -1) return

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= banners.value.length) return

  const targetBanner = banners.value[targetIndex]
  
  // Swap sort orders
  const reorderedBanners = [
    { id: banner.id, sort_order: targetBanner.sort_order },
    { id: targetBanner.id, sort_order: banner.sort_order }
  ]

  try {
    await bannerStore.reorderBanners(reorderedBanners)
  } catch (error) {
    console.error('Failed to reorder banners:', error)
  }
}

const deleteBanner = async (banner: Banner) => {
  if (!confirm(`Are you sure you want to delete the banner "${banner.title}"?`)) {
    return
  }

  try {
    await bannerStore.deleteBanner(banner.id)
  } catch (error) {
    console.error('Failed to delete banner:', error)
  }
}

const getImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${imageUrl}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadBanners()
})
</script>
