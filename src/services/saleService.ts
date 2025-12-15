import { backendApi } from './backendApi'
import type { Product } from '@/types'

export class SaleService {
  private static instance: SaleService
  private checkInterval: number | null = null
  private readonly CHECK_INTERVAL_MS = 60000 // Check every minute

  static getInstance(): SaleService {
    if (!SaleService.instance) {
      SaleService.instance = new SaleService()
    }
    return SaleService.instance
  }

  /**
   * Start monitoring sale expirations
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      return // Already monitoring
    }

    
    
    this.checkInterval = window.setInterval(() => {
      this.checkExpiredSales()
    }, this.CHECK_INTERVAL_MS)

    // Check immediately
    this.checkExpiredSales()
  }

  /**
   * Stop monitoring sale expirations
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      
    }
  }

  /**
   * Check for expired sales and revert prices
   */
  private async checkExpiredSales(): Promise<void> {
    try {
      const response = await backendApi.request<{ expiredProducts: Product[] }>('/sales/check-expired', {
        method: 'POST'
      })

      if (response.expiredProducts && response.expiredProducts.length > 0) {
        
        
        // Emit event to notify components about expired sales
        window.dispatchEvent(new CustomEvent('salesExpired', {
          detail: { expiredProducts: response.expiredProducts }
        }))
      }
    } catch (error) {
      console.error('❌ Failed to check expired sales:', error)
    }
  }

  /**
   * Manually expire a sale for a specific product
   */
  async expireProductSale(productId: string): Promise<boolean> {
    try {
      await backendApi.request(`/sales/expire/${productId}`, {
        method: 'POST'
      })

      
      return true
    } catch (error) {
      console.error(`❌ Failed to expire sale for product ${productId}:`, error)
      return false
    }
  }

  /**
   * Set sale expiration for a product
   */
  async setSaleExpiration(productId: string, expiresAt: Date): Promise<boolean> {
    try {
      await backendApi.request(`/sales/set-expiration/${productId}`, {
        method: 'POST',
        body: JSON.stringify({
          sale_expires_at: expiresAt.toISOString()
        })
      })

      
      return true
    } catch (error) {
      console.error(`❌ Failed to set sale expiration for product ${productId}:`, error)
      return false
    }
  }

  /**
   * Check if a product's sale has expired
   */
  isSaleExpired(product: Product): boolean {
    if (!product.sale_expires_at || !product.original_price || product.original_price <= product.price) {
      return false
    }

    const expirationTime = new Date(product.sale_expires_at).getTime()
    return Date.now() >= expirationTime
  }

  /**
   * Get time remaining for a sale
   */
  getTimeRemaining(product: Product): number {
    if (!product.sale_expires_at) {
      return 0
    }

    const expirationTime = new Date(product.sale_expires_at).getTime()
    return Math.max(0, expirationTime - Date.now())
  }
}

export const saleService = SaleService.getInstance()
