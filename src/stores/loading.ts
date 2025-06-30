import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // State
  const loadingStates = ref<Record<string, boolean>>({})
  const globalLoading = ref(false)

  // Getters
  const isLoading = computed(() => {
    return (key: string) => loadingStates.value[key] || false
  })

  const isGlobalLoading = computed(() => {
    return globalLoading.value
  })

  const hasAnyLoading = computed(() => {
    return globalLoading.value || Object.values(loadingStates.value).some(Boolean)
  })

  const loadingKeys = computed(() => {
    return Object.keys(loadingStates.value).filter(key => loadingStates.value[key])
  })

  // Actions
  const setLoading = (key: string, loading: boolean) => {
    if (loading) {
      loadingStates.value[key] = true
    } else {
      delete loadingStates.value[key]
    }
  }

  const setGlobalLoading = (loading: boolean) => {
    globalLoading.value = loading
  }

  const startLoading = (key: string) => {
    setLoading(key, true)
  }

  const stopLoading = (key: string) => {
    setLoading(key, false)
  }

  const clearAllLoading = () => {
    loadingStates.value = {}
    globalLoading.value = false
  }

  // Async wrapper that automatically manages loading state
  const withLoading = async <T>(
    key: string, 
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key)
      const result = await asyncFn()
      return result
    } finally {
      stopLoading(key)
    }
  }

  // Global loading wrapper
  const withGlobalLoading = async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      setGlobalLoading(true)
      const result = await asyncFn()
      return result
    } finally {
      setGlobalLoading(false)
    }
  }

  return {
    // State
    loadingStates,
    globalLoading,
    
    // Getters
    isLoading,
    isGlobalLoading,
    hasAnyLoading,
    loadingKeys,
    
    // Actions
    setLoading,
    setGlobalLoading,
    startLoading,
    stopLoading,
    clearAllLoading,
    withLoading,
    withGlobalLoading
  }
})
