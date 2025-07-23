// WayForPay Payment Service
import { useSiteConfigStore } from '@/stores/siteConfig'
import CryptoJS from 'crypto-js'
import type { Order, CartItem } from '@/types'

export interface WayForPayConfig {
  merchantAccount: string
  merchantDomainName: string
  merchantSecretKey: string
  testMode: boolean
}

export interface WayForPayProduct {
  name: string
  price: number
  count: number
}

export interface WayForPayRequest {
  merchantAccount: string
  merchantDomainName: string
  orderReference: string
  orderDate: number
  amount: number
  currency: string
  productName: string[]
  productPrice: number[]
  productCount: number[]
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientPhone: string
  language: string
  returnUrl: string
  serviceUrl: string
  merchantSignature: string
}

class WayForPayService {
  private config: WayForPayConfig | null = null
  private siteConfigStore = useSiteConfigStore()

  constructor() {
    this.updateConfig()
  }

  // Update configuration from site settings
  updateConfig() {
    const siteConfig = this.siteConfigStore.currentConfig
    
    if (siteConfig.enable_online_payment) {
      this.config = {
        merchantAccount: siteConfig.wayforpay_merchant_account,
        merchantDomainName: siteConfig.wayforpay_merchant_domain,
        merchantSecretKey: siteConfig.wayforpay_merchant_secret,
        testMode: siteConfig.wayforpay_test_mode
      }
    } else {
      this.config = null
    }
  }

  // Check if payment is enabled and configured
  isEnabled(): boolean {
    return this.config !== null && 
           this.config.merchantAccount !== '' && 
           this.config.merchantSecretKey !== ''
  }

  // Generate merchant signature for WayForPay
  private generateSignature(data: Record<string, any>): string {
    if (!this.config) return ''

    // WayForPay signature fields in specific order
    const signatureFields = [
      'merchantAccount',
      'merchantDomainName', 
      'orderReference',
      'orderDate',
      'amount',
      'currency',
      'productName',
      'productCount',
      'productPrice'
    ]

    let signatureString = ''
    
    for (const field of signatureFields) {
      if (data[field] !== undefined) {
        if (Array.isArray(data[field])) {
          signatureString += data[field].join(';') + ';'
        } else {
          signatureString += data[field] + ';'
        }
      }
    }

    // Add secret key at the end
    signatureString += this.config.merchantSecretKey

    // Generate HMAC MD5 signature
    return this.hmacMD5(signatureString, this.config.merchantSecretKey)
  }

  // HMAC MD5 implementation using crypto-js
  private hmacMD5(message: string, key: string): string {
    return CryptoJS.HmacMD5(message, key).toString()
  }

  // Create payment request for order
  createPaymentRequest(order: Order, cartItems: CartItem[]): WayForPayRequest | null {
    if (!this.isEnabled() || !this.config) {
      console.error('WayForPay is not enabled or configured')
      return null
    }

    // Prepare products data
    const productNames: string[] = []
    const productPrices: number[] = []
    const productCounts: number[] = []

    cartItems.forEach(item => {
      productNames.push(item.product.name)
      productPrices.push(item.product.price)
      productCounts.push(item.quantity)
    })

    // Add delivery fee if applicable
    if (order.delivery_fee && order.delivery_fee > 0) {
      productNames.push('Доставка')
      productPrices.push(order.delivery_fee)
      productCounts.push(1)
    }

    const orderDate = Math.floor(Date.now() / 1000) // Unix timestamp
    const baseUrl = window.location.origin

    const requestData = {
      merchantAccount: this.config.merchantAccount,
      merchantDomainName: this.config.merchantDomainName,
      orderReference: order.id,
      orderDate: orderDate,
      amount: order.total_amount,
      currency: 'UAH',
      productName: productNames,
      productPrice: productPrices,
      productCount: productCounts,
      clientFirstName: order.customer_name.split(' ')[0] || 'Клієнт',
      clientLastName: order.customer_name.split(' ').slice(1).join(' ') || '',
      clientEmail: order.customer_email,
      clientPhone: order.customer_phone,
      language: 'UA',
      returnUrl: `${baseUrl}/order-success/${order.id}`,
      serviceUrl: `${baseUrl}/api/wayforpay/callback`,
      merchantSignature: ''
    }

    // Generate signature
    requestData.merchantSignature = this.generateSignature(requestData)

    return requestData as WayForPayRequest
  }

  // Redirect to WayForPay payment page
  redirectToPayment(paymentRequest: WayForPayRequest) {
    if (!paymentRequest) {
      console.error('Invalid payment request')
      return
    }

    // Create form and submit to WayForPay
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = this.config?.testMode 
      ? 'https://secure.wayforpay.com/pay' 
      : 'https://secure.wayforpay.com/pay'

    // Add all fields to form
    Object.entries(paymentRequest).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key + '[]'
          input.value = item.toString()
          form.appendChild(input)
        })
      } else {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      }
    })

    // Submit form
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  // Process payment for order
  async processPayment(order: Order, cartItems: CartItem[]): Promise<boolean> {
    try {
      this.updateConfig() // Ensure we have latest config

      if (!this.isEnabled()) {
        throw new Error('Online payment is not enabled or configured')
      }

      const paymentRequest = this.createPaymentRequest(order, cartItems)
      
      if (!paymentRequest) {
        throw new Error('Failed to create payment request')
      }

      // Redirect to WayForPay
      this.redirectToPayment(paymentRequest)
      
      return true
    } catch (error) {
      console.error('Payment processing error:', error)
      return false
    }
  }

  // Verify payment callback signature
  verifyCallback(data: Record<string, any>): boolean {
    if (!this.config) return false

    const receivedSignature = data.merchantSignature
    delete data.merchantSignature

    const calculatedSignature = this.generateSignature(data)
    
    return receivedSignature === calculatedSignature
  }

  // Get payment status from callback
  getPaymentStatus(data: Record<string, any>): 'success' | 'failed' | 'pending' {
    const status = data.transactionStatus?.toLowerCase()
    
    switch (status) {
      case 'approved':
        return 'success'
      case 'declined':
      case 'expired':
        return 'failed'
      default:
        return 'pending'
    }
  }
}

export const wayforpayService = new WayForPayService()
export default wayforpayService
