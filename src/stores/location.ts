import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LocationData, Address } from '@/types'

export const useLocationStore = defineStore('location', () => {
  // State
  const userLocation = ref<LocationData | null>(null)
  const locationError = ref<string | null>(null)
  const isDetecting = ref(false)
  const watchId = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Getters
  const hasLocation = computed(() => userLocation.value !== null)

  const coordinates = computed(() => {
    if (!userLocation.value) return null
    return {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude
    }
  })

  const isLocationStale = computed(() => {
    if (!lastUpdated.value) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastUpdated.value < fiveMinutesAgo
  })

  // Actions
  const setLocation = (location: LocationData) => {
    userLocation.value = location
    locationError.value = null
    lastUpdated.value = new Date()
    saveToStorage()
  }

  const setError = (error: string) => {
    locationError.value = error
    userLocation.value = null
    lastUpdated.value = null
    saveToStorage()
  }

  const clearLocation = () => {
    userLocation.value = null
    locationError.value = null
    lastUpdated.value = null
    saveToStorage()
  }

  const setDetecting = (detecting: boolean) => {
    isDetecting.value = detecting
  }

  const setWatchId = (id: string | null) => {
    watchId.value = id
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

  const getDistanceTo = (latitude: number, longitude: number): number | null => {
    if (!userLocation.value) return null

    return calculateDistance(
      userLocation.value.latitude,
      userLocation.value.longitude,
      latitude,
      longitude
    )
  }

  // Address geocoding (enhanced implementation)
  const geocodeAddress = async (address: string): Promise<LocationData | null> => {
    try {
      

      // Try to use a real geocoding service if available
      // For now, enhanced mock implementation with Ukrainian cities
      const ukrainianCities = {
        'kyiv': { lat: 50.4501, lng: 30.5234 },
        'kiev': { lat: 50.4501, lng: 30.5234 },
        'kharkiv': { lat: 49.9935, lng: 36.2304 },
        'odesa': { lat: 46.4825, lng: 30.7233 },
        'dnipro': { lat: 48.4647, lng: 35.0462 },
        'lviv': { lat: 49.8397, lng: 24.0297 },
        'zaporizhzhia': { lat: 47.8388, lng: 35.1396 },
        'kryvyi rih': { lat: 47.9077, lng: 33.3916 }
      }

      // Check if address contains a known city
      const addressLower = address.toLowerCase()
      for (const [city, coords] of Object.entries(ukrainianCities)) {
        if (addressLower.includes(city)) {
          return {
            latitude: coords.lat + (Math.random() - 0.5) * 0.02, // Add small random offset
            longitude: coords.lng + (Math.random() - 0.5) * 0.02,
            address: address,
            timestamp: Date.now(),
            accuracy: 100
          }
        }
      }

      // Default to Kyiv area with random offset
      return {
        latitude: 50.4501 + (Math.random() - 0.5) * 0.1,
        longitude: 30.5234 + (Math.random() - 0.5) * 0.1,
        address: address,
        timestamp: Date.now(),
        accuracy: 500
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return null
    }
  }

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      // In a real app, you would use Google Maps Reverse Geocoding API
      

      // Mock reverse geocoding result
      return `Kyiv, Ukraine (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return null
    }
  }

  // Persistence
  const saveToStorage = () => {
    try {
      const locationData = {
        userLocation: userLocation.value,
        locationError: locationError.value,
        lastUpdated: lastUpdated.value?.toISOString()
      }
      localStorage.setItem('pwa-pos-location', JSON.stringify(locationData))
    } catch (error) {
      console.error('Failed to save location to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-location')

      if (stored) {
        const locationData = JSON.parse(stored)
        userLocation.value = locationData.userLocation
        locationError.value = locationData.locationError
        lastUpdated.value = locationData.lastUpdated ? new Date(locationData.lastUpdated) : null
      }
    } catch (error) {
      console.error('Failed to load location from storage:', error)
      clearLocation()
    }
  }

  // Validation
  const isValidLocation = (location: LocationData): boolean => {
    return (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    )
  }

  // Initialize from storage
  loadFromStorage()

  return {
    // State
    userLocation,
    locationError,
    isDetecting,
    watchId,
    lastUpdated,

    // Getters
    hasLocation,
    coordinates,
    isLocationStale,

    // Actions
    setLocation,
    setError,
    clearLocation,
    setDetecting,
    setWatchId,
    calculateDistance,
    getDistanceTo,
    geocodeAddress,
    reverseGeocode,
    isValidLocation,

    // Persistence
    saveToStorage,
    loadFromStorage
  }
})
