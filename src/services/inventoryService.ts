// Real-time Inventory Service
import { backendApi } from './backendApi'

export interface InventoryStatus {
  product_id: string
  branch_id: string
  stock_level: number
  last_updated: string
  last_sync_at: string
  is_available: boolean
  low_stock_threshold?: number
}

export interface SyncStatus {
  id: string
  sync_type: string
  status: 'started' | 'completed' | 'failed'
  total_records?: number
  error_message?: string
  started_at: string
  completed_at?: string
}

class InventoryService {
  private syncStatusCache: SyncStatus | null = null
  private inventoryCache: Map<string, InventoryStatus[]> = new Map()
  private lastCacheUpdate: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get real-time inventory for a specific branch
   */
  async getBranchInventory(branchId: string, forceRefresh = false): Promise<InventoryStatus[]> {
    const cacheKey = `branch_${branchId}`
    const now = Date.now()

    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && this.inventoryCache.has(cacheKey) && 
        (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      return this.inventoryCache.get(cacheKey)!
    }

    try {
      const inventory: InventoryStatus[] = await backendApi.getBranchInventory(branchId)

      // Update cache
      this.inventoryCache.set(cacheKey, inventory)
      this.lastCacheUpdate = now

      return inventory
    } catch (error) {
      console.error('Failed to fetch branch inventory:', error)

      // Return cached data if available, even if expired
      if (this.inventoryCache.has(cacheKey)) {
        return this.inventoryCache.get(cacheKey)!
      }

      throw error
    }
  }

  /**
   * Get inventory status for specific products in a branch
   */
  async getProductsInventory(productIds: string[], branchId: string): Promise<InventoryStatus[]> {
    try {
      const inventory = await backendApi.getProductsInventory(productIds, branchId)

      return inventory
    } catch (error) {
      console.error('Failed to fetch products inventory:', error)
      throw error
    }
  }

  /**
   * Check if a product is available in sufficient quantity
   */
  async checkProductAvailability(
    productId: string,
    branchId: string,
    requiredQuantity: number = 1
  ): Promise<{ available: boolean; stock_level: number; last_updated: string }> {
    try {
      const result = await backendApi.checkProductAvailability(productId, branchId, requiredQuantity)

      return result
    } catch (error) {
      console.error('Failed to check product availability:', error)
      throw error
    }
  }

  /**
   * Trigger manual inventory sync
   */
  async triggerInventorySync(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await backendApi.triggerInventorySync()
      return result
    } catch (error) {
      console.error('Failed to trigger inventory sync:', error)
      throw error
    }
  }

  /**
   * Get latest sync status
   */
  async getSyncStatus(): Promise<SyncStatus | null> {
    try {
      const result = await backendApi.getSyncStatus()
      this.syncStatusCache = result
      return result
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
      return this.syncStatusCache // Return cached status if available
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit: number = 10): Promise<SyncStatus[]> {
    try {
      const result = await backendApi.getSyncHistory(limit)
      return result
    } catch (error) {
      console.error('Failed to fetch sync history:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time inventory updates (WebSocket)
   */
  subscribeToInventoryUpdates(
    branchId: string, 
    callback: (inventory: InventoryStatus[]) => void
  ): () => void {
    // This would implement WebSocket connection for real-time updates
    // For now, we'll use polling as a fallback
    
    const pollInterval = setInterval(async () => {
      try {
        const inventory = await this.getBranchInventory(branchId, true)
        callback(inventory)
      } catch (error) {
        console.error('Failed to poll inventory updates:', error)
      }
    }, 30000) // Poll every 30 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(pollInterval)
    }
  }

  /**
   * Get low stock alerts for a branch
   */
  async getLowStockAlerts(branchId: string): Promise<InventoryStatus[]> {
    try {
      const response = await backendApi.get(`/inventory/low-stock/${branchId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error)
      throw error
    }
  }

  /**
   * Clear inventory cache
   */
  clearCache(): void {
    this.inventoryCache.clear()
    this.lastCacheUpdate = 0
    this.syncStatusCache = null
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): {
    cached_branches: string[]
    last_update: string
    cache_age_minutes: number
  } {
    const now = Date.now()
    const ageMinutes = Math.floor((now - this.lastCacheUpdate) / (1000 * 60))
    
    return {
      cached_branches: Array.from(this.inventoryCache.keys()),
      last_update: new Date(this.lastCacheUpdate).toISOString(),
      cache_age_minutes: ageMinutes
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()
export default inventoryService
