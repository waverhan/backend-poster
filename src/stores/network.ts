import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { capacitorService } from '@/services/capacitor'
import type { NetworkStatus } from '@/types'

export const useNetworkStore = defineStore('network', () => {
  // State
  const isOnline = ref(true)
  const connectionType = ref('unknown')
  const lastOnline = ref<Date | null>(null)
  const lastOffline = ref<Date | null>(null)

  // Getters
  const networkStatus = computed((): NetworkStatus => ({
    connected: isOnline.value,
    connectionType: connectionType.value
  }))

  const isSlowConnection = computed(() => {
    return connectionType.value === '2g' || connectionType.value === 'slow-2g'
  })

  const isFastConnection = computed(() => {
    return connectionType.value === '4g' || connectionType.value === '5g' || connectionType.value === 'wifi'
  })

  const offlineDuration = computed(() => {
    if (isOnline.value || !lastOffline.value) return 0
    return Date.now() - lastOffline.value.getTime()
  })

  // Actions
  const setOnline = (online: boolean) => {
    const wasOnline = isOnline.value
    isOnline.value = online

    if (online && !wasOnline) {
      lastOnline.value = new Date()
      
    } else if (!online && wasOnline) {
      lastOffline.value = new Date()
      
    }
  }

  const setConnectionType = (type: string) => {
    connectionType.value = type
  }

  const updateNetworkStatus = (status: NetworkStatus) => {
    setOnline(status.connected)
    setConnectionType(status.connectionType)
  }

  // Initialize network monitoring
  const initialize = async () => {
    try {
      // Get initial network status
      const status = await capacitorService.getNetworkStatus()
      updateNetworkStatus(status)

      // Listen for network changes
      capacitorService.addNetworkListener((status) => {
        updateNetworkStatus(status)
      })

      
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error)
      
      // Fallback to basic online/offline detection
      setOnline(navigator.onLine)
      
      window.addEventListener('online', () => setOnline(true))
      window.addEventListener('offline', () => setOnline(false))
    }
  }

  // Cleanup
  const cleanup = () => {
    // Remove event listeners if needed
    window.removeEventListener('online', () => setOnline(true))
    window.removeEventListener('offline', () => setOnline(false))
  }

  // Network quality assessment
  const assessNetworkQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!isOnline.value) return 'offline'
    
    switch (connectionType.value) {
      case '5g':
      case 'wifi':
        return 'excellent'
      case '4g':
        return 'good'
      case '3g':
        return 'fair'
      case '2g':
      case 'slow-2g':
        return 'poor'
      default:
        return 'fair'
    }
  }

  // Check if we should use cached data
  const shouldUseCachedData = (): boolean => {
    return !isOnline.value || isSlowConnection.value
  }

  // Get recommended timeout for requests
  const getRequestTimeout = (): number => {
    if (!isOnline.value) return 0
    
    switch (connectionType.value) {
      case '5g':
      case 'wifi':
        return 10000 // 10 seconds
      case '4g':
        return 15000 // 15 seconds
      case '3g':
        return 20000 // 20 seconds
      case '2g':
      case 'slow-2g':
        return 30000 // 30 seconds
      default:
        return 15000 // 15 seconds default
    }
  }

  return {
    // State
    isOnline,
    connectionType,
    lastOnline,
    lastOffline,
    
    // Getters
    networkStatus,
    isSlowConnection,
    isFastConnection,
    offlineDuration,
    
    // Actions
    setOnline,
    setConnectionType,
    updateNetworkStatus,
    initialize,
    cleanup,
    
    // Utilities
    assessNetworkQuality,
    shouldUseCachedData,
    getRequestTimeout
  }
})
