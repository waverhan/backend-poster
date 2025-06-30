import { capacitorService } from './capacitor'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import type { LocationData, Branch } from '@/types'

export interface LocationServiceOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoRetry?: boolean
  retryAttempts?: number
  retryDelay?: number
}

export interface DeliveryInfo {
  isAvailable: boolean
  nearestBranch: Branch | null
  distance: number | null
  fee: number
  estimatedTime: string
}

export interface LocationResult {
  success: boolean
  location?: LocationData
  error?: string
  deliveryInfo?: DeliveryInfo
}

class LocationService {
  private locationStore = useLocationStore()
  private branchStore = useBranchStore()
  private watchId: string | null = null
  private isWatching = false

  /**
   * Get current location with enhanced error handling and retry logic
   */
  async getCurrentLocation(options: LocationServiceOptions = {}): Promise<LocationResult> {
    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 300000, // 5 minutes
      autoRetry = true,
      retryAttempts = 3,
      retryDelay = 2000
    } = options

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        this.locationStore.setDetecting(true)
        this.locationStore.setError('')

        // Check if we have a recent cached location
        if (this.locationStore.hasLocation && !this.locationStore.isLocationStale) {
          const location = this.locationStore.userLocation!
          const deliveryInfo = await this.getDeliveryInfo(location)

          return {
            success: true,
            location,
            deliveryInfo
          }
        }

        // Get fresh location
        const location = await capacitorService.getCurrentPosition()

        if (!location || !this.locationStore.isValidLocation(location)) {
          throw new Error('Invalid location data received')
        }

        // Store the location
        this.locationStore.setLocation(location)

        // Get delivery information
        const deliveryInfo = await this.getDeliveryInfo(location)

        // Show success feedback
        await capacitorService.showToast({
          text: 'Location detected successfully!',
          duration: 'short',
          position: 'bottom'
        })

        return {
          success: true,
          location,
          deliveryInfo
        }

      } catch (error: any) {
        lastError = error
        console.error(`Location attempt ${attempt} failed:`, error)

        if (attempt < retryAttempts && autoRetry) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        }
      }
    }

    // All attempts failed
    const errorMessage = lastError?.message || 'Failed to get current location'
    this.locationStore.setError(errorMessage)

    // Show error feedback
    await capacitorService.showToast({
      text: errorMessage,
      duration: 'long',
      position: 'bottom'
    })

    return {
      success: false,
      error: errorMessage
    }
  }

  /**
   * Start watching location changes
   */
  async startWatching(
    callback: (result: LocationResult) => void,
    options: LocationServiceOptions = {}
  ): Promise<boolean> {
    try {
      if (this.isWatching) {
        await this.stopWatching()
      }

      const watchId = await capacitorService.watchPosition(async (location) => {
        if (this.locationStore.isValidLocation(location)) {
          this.locationStore.setLocation(location)
          const deliveryInfo = await this.getDeliveryInfo(location)

          callback({
            success: true,
            location,
            deliveryInfo
          })
        }
      })

      this.watchId = watchId
      this.isWatching = true
      this.locationStore.setWatchId(watchId)

      await capacitorService.showToast({
        text: 'Started tracking your location',
        duration: 'short',
        position: 'bottom'
      })

      return true
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start watching location'
      this.locationStore.setError(errorMessage)

      callback({
        success: false,
        error: errorMessage
      })

      return false
    }
  }

  /**
   * Stop watching location changes
   */
  async stopWatching(): Promise<void> {
    try {
      if (this.watchId) {
        await capacitorService.clearWatch(this.watchId)
        this.watchId = null
        this.isWatching = false
        this.locationStore.setWatchId(null)

        await capacitorService.showToast({
          text: 'Stopped tracking your location',
          duration: 'short',
          position: 'bottom'
        })
      }
    } catch (error: any) {
      console.error('Failed to stop watching location:', error)
    }
  }

  /**
   * Get delivery information for a location
   */
  async getDeliveryInfo(location: LocationData): Promise<DeliveryInfo> {
    try {
      // Ensure branches are loaded
      if (!this.branchStore.branches.length) {
        await this.branchStore.fetchBranches()
      }

      const nearestBranch = this.branchStore.findNearestBranchByCoords(
        location.latitude,
        location.longitude
      )

      if (!nearestBranch) {
        return {
          isAvailable: false,
          nearestBranch: null,
          distance: null,
          fee: 0,
          estimatedTime: 'N/A'
        }
      }

      const distance = this.branchStore.calculateDistance(
        location.latitude,
        location.longitude,
        nearestBranch.latitude || 0,
        nearestBranch.longitude || 0
      )

      const isAvailable = this.branchStore.isDeliveryAvailable(distance)
      const fee = isAvailable ? this.branchStore.calculateDeliveryFeeByDistance(distance) : 0
      const estimatedTime = this.calculateEstimatedDeliveryTime(distance)

      return {
        isAvailable,
        nearestBranch,
        distance,
        fee,
        estimatedTime
      }
    } catch (error) {
      console.error('Failed to get delivery info:', error)
      return {
        isAvailable: false,
        nearestBranch: null,
        distance: null,
        fee: 0,
        estimatedTime: 'N/A'
      }
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<LocationResult> {
    try {
      this.locationStore.setDetecting(true)

      const location = await this.locationStore.geocodeAddress(address)

      if (!location || !this.locationStore.isValidLocation(location)) {
        throw new Error('Could not find location for this address')
      }

      this.locationStore.setLocation(location)
      const deliveryInfo = await this.getDeliveryInfo(location)

      await capacitorService.showToast({
        text: 'Address location found!',
        duration: 'short',
        position: 'bottom'
      })

      return {
        success: true,
        location,
        deliveryInfo
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to geocode address'
      this.locationStore.setError(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      this.locationStore.setDetecting(false)
    }
  }

  /**
   * Get nearby branches within a radius
   */
  getNearbyBranches(
    location: LocationData,
    radiusKm: number = 10
  ): Array<Branch & { distance: number; deliveryFee: number }> {
    return this.branchStore.getBranchesWithinRadiusFromCoords(
      location.latitude,
      location.longitude,
      radiusKm
    ).map(branch => ({
      ...branch,
      deliveryFee: this.branchStore.calculateDeliveryFeeByDistance(branch.distance)
    }))
  }

  /**
   * Check if location permissions are granted
   */
  async checkLocationPermissions(): Promise<boolean> {
    try {
      // This would check actual permissions in a real implementation
      // For now, we'll try to get location and see if it works
      const result = await this.getCurrentLocation({
        timeout: 5000,
        autoRetry: false,
        retryAttempts: 1
      })

      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Request location permissions
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const result = await this.getCurrentLocation({
        timeout: 10000,
        autoRetry: false,
        retryAttempts: 1
      })

      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Calculate estimated delivery time based on distance
   */
  private calculateEstimatedDeliveryTime(distance: number): string {
    // Base time: 30 minutes + 5 minutes per km
    const baseTime = 30
    const timePerKm = 5
    const totalMinutes = baseTime + (distance * timePerKm)

    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)} min`
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)

    if (minutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${minutes}m`
  }

  /**
   * Clear all location data
   */
  clearLocation(): void {
    this.locationStore.clearLocation()
  }

  /**
   * Get current location state
   */
  get currentLocation(): LocationData | null {
    return this.locationStore.userLocation
  }

  /**
   * Check if currently detecting location
   */
  get isDetecting(): boolean {
    return this.locationStore.isDetecting
  }

  /**
   * Get location error if any
   */
  get error(): string | null {
    return this.locationStore.locationError
  }

  /**
   * Check if location is available
   */
  get hasLocation(): boolean {
    return this.locationStore.hasLocation
  }
}

// Export singleton instance
export const locationService = new LocationService()
export default locationService
