import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { posterApi } from '@/services/posterApi'
import { backendApi } from '@/services/backendApi'
import { useLocationStore } from './location'
import type { Branch } from '@/types'

export const useBranchStore = defineStore('branch', () => {
  // State
  const branches = ref<Branch[]>([])
  const selectedBranch = ref<Branch | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Get location store
  const locationStore = useLocationStore()

  // Getters
  const availableBranches = computed(() => {
    return branches.value.filter(branch =>
      branch.delivery_available || branch.pickup_available
    )
  })

  const deliveryBranches = computed(() => {
    return branches.value.filter(branch => branch.delivery_available)
  })

  const pickupBranches = computed(() => {
    return branches.value.filter(branch => branch.pickup_available)
  })

  const nearestBranches = computed(() => {
    if (!locationStore.userLocation) return branches.value

    return [...branches.value]
      .map(branch => ({
        ...branch,
        distance_km: locationStore.getDistanceTo(branch.latitude, branch.longitude)
      }))
      .filter(branch => branch.distance_km !== null)
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
  })

  const branchById = computed(() => {
    return (id: string) => branches.value.find(branch => branch.id === id)
  })

  const isDataStale = computed(() => {
    if (!lastFetched.value) return true
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return lastFetched.value < oneHourAgo
  })

  // Actions
  const fetchBranches = async (force = false, useDatabase = true) => {
    if (isLoading.value) return
    if (!force && branches.value.length > 0 && !isDataStale.value) return

    isLoading.value = true
    error.value = null

    try {
      if (useDatabase) {
        
        const fetchedBranches = await backendApi.getBranches()
        branches.value = fetchedBranches
        
      } else {
        
        const fetchedBranches = await posterApi.getBranches()
        branches.value = fetchedBranches
        
      }

      lastFetched.value = new Date()
      saveToStorage()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch branches'
      console.error('❌ Failed to fetch branches:', err)

      // Clear any cached data on error
      branches.value = []
      localStorage.removeItem('pwa-pos-branches')
    } finally {
      isLoading.value = false
    }
  }

  const selectBranch = (branch: Branch) => {
    selectedBranch.value = branch
    saveToStorage()
  }

  const clearSelectedBranch = () => {
    selectedBranch.value = null
    saveToStorage()
  }

  const findNearestBranch = (deliveryOnly = false): Branch | null => {
    const availableBranches = deliveryOnly ? deliveryBranches.value : branches.value
    const nearest = nearestBranches.value.find(branch =>
      availableBranches.some(ab => ab.id === branch.id)
    )
    return nearest || null
  }

  const getBranchesWithinRadius = (radiusKm: number): Branch[] => {
    if (!locationStore.userLocation) return []

    return nearestBranches.value.filter(branch =>
      (branch.distance_km || 0) <= radiusKm
    )
  }

  const calculateDeliveryFee = (branch: Branch): number => {
    if (!locationStore.userLocation) return 0

    const distance = locationStore.getDistanceTo(branch.latitude, branch.longitude)
    if (!distance) return 0

    // Delivery pricing logic: 99 ₴ base + 30 ₴ per km after 2km
    const baseFee = 99
    const baseDistance = 2
    const extraFeePerKm = 30

    if (distance <= baseDistance) {
      return baseFee
    } else {
      const extraDistance = distance - baseDistance
      return baseFee + (extraDistance * extraFeePerKm)
    }
  }

  const addDeliveryFees = () => {
    branches.value = branches.value.map(branch => ({
      ...branch,
      distance_km: locationStore.getDistanceTo(branch.latitude, branch.longitude),
      delivery_fee: calculateDeliveryFee(branch)
    }))
  }

  const refreshBranches = async () => {
    await fetchBranches(true)
  }

  const clearCache = () => {
    branches.value = []
    selectedBranch.value = null
    lastFetched.value = null
    localStorage.removeItem('pwa-pos-branches')
    
  }

  // Location-based branch methods with coordinates
  const findNearestBranchByCoords = (userLatitude: number, userLongitude: number): Branch | null => {
    if (!branches.value.length) return null

    let nearestBranch: Branch | null = null
    let minDistance = Infinity

    for (const branch of branches.value) {
      if (branch.latitude && branch.longitude) {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          branch.latitude,
          branch.longitude
        )

        if (distance < minDistance) {
          minDistance = distance
          nearestBranch = branch
        }
      }
    }

    return nearestBranch
  }

  const getBranchesWithinRadiusFromCoords = (
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 10
  ): Array<Branch & { distance: number }> => {
    if (!branches.value.length) return []

    return branches.value
      .filter(branch => branch.latitude && branch.longitude)
      .map(branch => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          branch.latitude!,
          branch.longitude!
        )
        return { ...branch, distance }
      })
      .filter(branch => branch.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
  }

  const calculateDeliveryFeeByDistance = (distance: number): number => {
    // Base delivery fee: 99 UAH for first 2km, then 30 UAH per additional km
    if (distance <= 2) return 99
    return 99 + Math.ceil(distance - 2) * 30
  }

  const isDeliveryAvailable = (distance: number, maxDeliveryDistance: number = 15): boolean => {
    return distance <= maxDeliveryDistance
  }

  // Distance calculation using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Persistence
  const saveToStorage = () => {
    try {
      const branchData = {
        branches: branches.value,
        selectedBranch: selectedBranch.value,
        lastFetched: lastFetched.value?.toISOString()
      }
      localStorage.setItem('pwa-pos-branches', JSON.stringify(branchData))
    } catch (error) {
      console.error('Failed to save branches to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-branches')

      if (stored) {
        const branchData = JSON.parse(stored)
        branches.value = branchData.branches || []
        selectedBranch.value = branchData.selectedBranch || null
        lastFetched.value = branchData.lastFetched ? new Date(branchData.lastFetched) : null
      }
    } catch (error) {
      console.error('Failed to load branches from storage:', error)
      branches.value = []
      selectedBranch.value = null
      lastFetched.value = null
    }
  }

  // Validation
  const validateBranch = (branch: Branch): boolean => {
    return (
      branch &&
      branch.id &&
      branch.name &&
      branch.address &&
      typeof branch.latitude === 'number' &&
      typeof branch.longitude === 'number' &&
      branch.latitude >= -90 &&
      branch.latitude <= 90 &&
      branch.longitude >= -180 &&
      branch.longitude <= 180
    )
  }

  // Initialize from storage
  loadFromStorage()

  return {
    // State
    branches,
    selectedBranch,
    isLoading,
    error,
    lastFetched,

    // Getters
    availableBranches,
    deliveryBranches,
    pickupBranches,
    nearestBranches,
    branchById,
    isDataStale,

    // Actions
    fetchBranches,
    selectBranch,
    clearSelectedBranch,
    findNearestBranchByCoords,
    getBranchesWithinRadiusFromCoords,
    calculateDeliveryFeeByDistance,
    isDeliveryAvailable,
    calculateDistance,
    addDeliveryFees,
    refreshBranches,
    validateBranch,
    clearCache,

    // Persistence
    saveToStorage,
    loadFromStorage
  }
})
