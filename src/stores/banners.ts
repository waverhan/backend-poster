import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url?: string
  link_url?: string
  link_text?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export const useBannerStore = defineStore('banners', () => {
  const banners = ref<Banner[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  const fetchBanners = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        banners.value = data.data
      } else {
        throw new Error(data.message || 'Failed to fetch banners')
      }
    } catch (err: any) {
      console.error('Error fetching banners:', err)
      error.value = err.message || 'Failed to fetch banners'
      banners.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchAdminBanners = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/admin`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        banners.value = data.data
      } else {
        throw new Error(data.message || 'Failed to fetch banners')
      }
    } catch (err: any) {
      console.error('Error fetching admin banners:', err)
      error.value = err.message || 'Failed to fetch banners'
      banners.value = []
    } finally {
      loading.value = false
    }
  }

  const createBanner = async (bannerData: FormData) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners`, {
        method: 'POST',
        body: bannerData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        await fetchAdminBanners() // Refresh the list
        return data.data
      } else {
        throw new Error(data.message || 'Failed to create banner')
      }
    } catch (err: any) {
      console.error('Error creating banner:', err)
      error.value = err.message || 'Failed to create banner'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBanner = async (id: string, bannerData: FormData) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
        method: 'PUT',
        body: bannerData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        await fetchAdminBanners() // Refresh the list
        return data.data
      } else {
        throw new Error(data.message || 'Failed to update banner')
      }
    } catch (err: any) {
      console.error('Error updating banner:', err)
      error.value = err.message || 'Failed to update banner'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBanner = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        await fetchAdminBanners() // Refresh the list
        return true
      } else {
        throw new Error(data.message || 'Failed to delete banner')
      }
    } catch (err: any) {
      console.error('Error deleting banner:', err)
      error.value = err.message || 'Failed to delete banner'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reorderBanners = async (reorderedBanners: { id: string; sort_order: number }[]) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          banners: reorderedBanners
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        await fetchAdminBanners() // Refresh the list
        return true
      } else {
        throw new Error(data.message || 'Failed to reorder banners')
      }
    } catch (err: any) {
      console.error('Error reordering banners:', err)
      error.value = err.message || 'Failed to reorder banners'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    banners,
    loading,
    error,
    fetchBanners,
    fetchAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners
  }
})
