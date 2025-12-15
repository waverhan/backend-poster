import express from 'express'
import crypto from 'crypto'
import { prisma } from '../services/database.js'

const router = express.Router()

// Helper function to generate WayForPay signature
function generateSignature(data, secretKey) {
  // WayForPay signature fields in specific order for callback
  const signatureFields = [
    'merchantAccount',
    'orderReference', 
    'amount',
    'currency'
  ]

  let signatureString = ''
  
  for (const field of signatureFields) {
    if (data[field] !== undefined) {
      signatureString += data[field] + ';'
    }
  }

  // Add secret key at the end
  signatureString += secretKey

  // Generate HMAC MD5 signature
  return crypto.createHmac('md5', secretKey).update(signatureString).digest('hex')
}

// Helper function to verify signature
function verifySignature(data, secretKey) {
  const receivedSignature = data.merchantSignature
  const calculatedSignature = generateSignature(data, secretKey)
  
  return receivedSignature === calculatedSignature
}

// WayForPay payment callback
router.post('/callback', async (req, res) => {
  try {
    

    const callbackData = req.body

    // Get site configuration to verify signature
    let siteConfig
    try {
      siteConfig = await prisma.siteConfig.findFirst()
    } catch (error) {
      console.error('❌ Failed to get site config:', error)
      return res.status(500).json({ error: 'Configuration error' })
    }

    if (!siteConfig || !siteConfig.enable_online_payment) {
      console.error('❌ Online payment not enabled')
      return res.status(400).json({ error: 'Online payment not enabled' })
    }

    // Verify signature
    const isValidSignature = verifySignature(callbackData, siteConfig.wayforpay_merchant_secret)
    
    if (!isValidSignature) {
      console.error('❌ Invalid signature in WayForPay callback')
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const {
      orderReference,
      transactionStatus,
      amount,
      currency,
      authCode,
      cardPan,
      transactionId,
      reasonCode,
      reason
    } = callbackData

    

    // Find the order
    let order
    try {
      order = await prisma.order.findUnique({
        where: { id: orderReference }
      })
    } catch (error) {
      console.error('❌ Failed to find order:', error)
      return res.status(500).json({ error: 'Database error' })
    }

    if (!order) {
      console.error(`❌ Order not found: ${orderReference}`)
      return res.status(404).json({ error: 'Order not found' })
    }

    // Update order based on payment status
    let newStatus = order.status
    let paymentStatus = 'pending'

    switch (transactionStatus?.toLowerCase()) {
      case 'approved':
        newStatus = 'confirmed'
        paymentStatus = 'paid'
        
        break
      
      case 'declined':
      case 'expired':
        newStatus = 'cancelled'
        paymentStatus = 'failed'
        
        break
      
      default:
        paymentStatus = 'pending'
        
    }

    // Update order in database
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderReference },
        data: {
          status: newStatus,
          payment_status: paymentStatus,
          payment_method: 'online',
          payment_transaction_id: transactionId,
          payment_details: JSON.stringify({
            authCode,
            cardPan: cardPan ? `****${cardPan.slice(-4)}` : null,
            transactionId,
            reasonCode,
            reason,
            amount,
            currency,
            timestamp: new Date().toISOString()
          }),
          updated_at: new Date()
        }
      })

      

      // TODO: Send notification emails, update inventory, etc.
      
      // Respond to WayForPay
      res.json({
        orderReference,
        status: 'accept',
        time: Math.floor(Date.now() / 1000)
      })

    } catch (error) {
      console.error('❌ Failed to update order:', error)
      res.status(500).json({ error: 'Failed to update order' })
    }

  } catch (error) {
    console.error('❌ WayForPay callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get payment status for order
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        payment_status: true,
        payment_method: true,
        payment_transaction_id: true,
        total_amount: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      transactionId: order.payment_transaction_id,
      amount: order.total_amount
    })

  } catch (error) {
    console.error('❌ Error getting payment status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Test WayForPay configuration
router.get('/test-config', async (req, res) => {
  try {
    const siteConfig = await prisma.siteConfig.findFirst()
    
    if (!siteConfig) {
      return res.status(404).json({ error: 'Site configuration not found' })
    }

    const isConfigured = siteConfig.enable_online_payment && 
                        siteConfig.wayforpay_merchant_account && 
                        siteConfig.wayforpay_merchant_secret

    res.json({
      enabled: siteConfig.enable_online_payment,
      configured: isConfigured,
      testMode: siteConfig.wayforpay_test_mode,
      merchantAccount: siteConfig.wayforpay_merchant_account ? '***' + siteConfig.wayforpay_merchant_account.slice(-4) : null,
      domain: siteConfig.wayforpay_merchant_domain
    })

  } catch (error) {
    console.error('❌ Error testing WayForPay config:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
