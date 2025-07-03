<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ isEditing ? 'Edit Banner' : 'Create New Banner' }}
                </h3>

                <div class="space-y-4">
                  <!-- Title -->
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      id="title"
                      v-model="form.title"
                      type="text"
                      required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter banner title"
                    />
                  </div>

                  <!-- Subtitle -->
                  <div>
                    <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <textarea
                      id="subtitle"
                      v-model="form.subtitle"
                      rows="2"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter banner subtitle (optional)"
                    ></textarea>
                  </div>

                  <!-- Image Upload -->
                  <div>
                    <label for="image" class="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image
                    </label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div class="space-y-1 text-center">
                        <!-- Current Image Preview -->
                        <div v-if="currentImageUrl" class="mb-4">
                          <img
                            :src="currentImageUrl"
                            alt="Current banner"
                            class="mx-auto h-32 w-auto object-cover rounded-md"
                          />
                          <p class="text-sm text-gray-500 mt-2">Current image</p>
                        </div>

                        <!-- New Image Preview -->
                        <div v-if="imagePreview" class="mb-4">
                          <img
                            :src="imagePreview"
                            alt="New banner preview"
                            class="mx-auto h-32 w-auto object-cover rounded-md"
                          />
                          <p class="text-sm text-gray-500 mt-2">New image preview</p>
                        </div>

                        <!-- Upload Area -->
                        <svg v-if="!currentImageUrl && !imagePreview" class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="flex text-sm text-gray-600">
                          <label for="image" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>{{ currentImageUrl || imagePreview ? 'Change image' : 'Upload a file' }}</span>
                            <input
                              id="image"
                              ref="fileInput"
                              type="file"
                              accept="image/*"
                              class="sr-only"
                              @change="handleImageChange"
                            />
                          </label>
                          <p class="pl-1">or drag and drop</p>
                        </div>
                        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <!-- Link URL -->
                  <div>
                    <label for="link_url" class="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <input
                      id="link_url"
                      v-model="form.link_url"
                      type="url"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com or /shop"
                    />
                  </div>

                  <!-- Link Text -->
                  <div>
                    <label for="link_text" class="block text-sm font-medium text-gray-700 mb-1">
                      Link Text
                    </label>
                    <input
                      id="link_text"
                      v-model="form.link_text"
                      type="text"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Shop Now"
                    />
                  </div>

                  <!-- Settings Row -->
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Sort Order -->
                    <div>
                      <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        id="sort_order"
                        v-model.number="form.sort_order"
                        type="number"
                        min="0"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <!-- Active Status -->
                    <div>
                      <label for="is_active" class="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div class="flex items-center h-10">
                        <input
                          id="is_active"
                          v-model="form.is_active"
                          type="checkbox"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label for="is_active" class="ml-2 text-sm text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading || !form.title.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Saving...' : (isEditing ? 'Update Banner' : 'Create Banner') }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useBannerStore } from '@/stores/banners'
import type { Banner } from '@/stores/banners'

interface Props {
  isOpen: boolean
  banner?: Banner | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const bannerStore = useBannerStore()

const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
const imagePreview = ref<string>('')

const form = ref({
  title: '',
  subtitle: '',
  link_url: '',
  link_text: '',
  sort_order: 0,
  is_active: true
})

const isEditing = computed(() => !!props.banner)
const currentImageUrl = computed(() => {
  if (!props.banner?.image_url) return ''
  if (props.banner.image_url.startsWith('http')) {
    return props.banner.image_url
  }
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}${props.banner.image_url}`
})

const resetForm = () => {
  if (props.banner) {
    form.value = {
      title: props.banner.title,
      subtitle: props.banner.subtitle || '',
      link_url: props.banner.link_url || '',
      link_text: props.banner.link_text || '',
      sort_order: props.banner.sort_order,
      is_active: props.banner.is_active
    }
  } else {
    form.value = {
      title: '',
      subtitle: '',
      link_url: '',
      link_text: '',
      sort_order: bannerStore.banners.length,
      is_active: true
    }
  }
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  loading.value = true
  
  try {
    const formData = new FormData()
    formData.append('title', form.value.title.trim())
    formData.append('subtitle', form.value.subtitle.trim())
    formData.append('link_url', form.value.link_url.trim())
    formData.append('link_text', form.value.link_text.trim())
    formData.append('sort_order', form.value.sort_order.toString())
    formData.append('is_active', form.value.is_active.toString())

    // Add image if selected
    if (fileInput.value?.files?.[0]) {
      formData.append('image', fileInput.value.files[0])
    }

    if (isEditing.value && props.banner) {
      await bannerStore.updateBanner(props.banner.id, formData)
    } else {
      await bannerStore.createBanner(formData)
    }

    emit('save')
  } catch (error) {
    console.error('Failed to save banner:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      resetForm()
    })
  }
})
</script>
