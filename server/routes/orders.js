import express from 'express'
import { PrismaClient } from '@prisma/client'
import { emailService } from '../services/emailService.js'
import axios from 'axios'
import { sendViberOrderNotification, sendViberStatusUpdate } from '../services/viberService.js'

const router = express.Router()
const prisma = new PrismaClient()

// Poster API configuration
const POSTER_API_BASE = 'https://joinposter.com/api'
const POSTER_TOKEN = '218047:05891220e474bad7f26b6eaa0be3f344'

// Helper function to map frontend shop IDs to backend branch poster_ids
const mapShopIdToPosterBranchId = (shopId) => {
  const mapping = {
    '1': '7',  // Братиславська 14Б
    '2': '6',  // Ованеса Туманяна 1А
    '3': '4',  // Голосіївський проспект 5
    '4': '5',  // Голосіївський проспект 100/2
    '5': '9',  // Гетьмана 40А
    '6': '8'   // Данькевича 10
  }
  return mapping[String(shopId)] || shopId
}

// Helper function to format phone number for Poster POS API
const formatPhoneForPoster = (phone) => {
  if (!phone) return '380000000000'

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If it's already in the correct format (starts with 380 and 12 digits)
  if (digits.startsWith('380') && digits.length === 12) {
    return digits // Return without + sign as Poster API expects 380XXXXXXXXX format
  }

  // If it starts with 0 (Ukrainian format), replace with 380
  if (digits.startsWith('0') && digits.length === 10) {
    return '380' + digits.substring(1) // Remove the 0 and add 380 prefix
  }

  // If it's just 9 digits, add 380 prefix
  if (digits.length === 9) {
    return '380' + digits
  }

  // Default fallback for invalid numbers
  return '380671234567'
}

// Helper function to generate order number
function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().substr(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const time = date.getHours().toString().padStart(2, '0') + date.getMinutes().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `ORD${year}${month}${day}${time}${random}`
}

// Helper function to calculate estimated delivery time
function calculateEstimatedDelivery(deliveryMethod) {
  const now = new Date()
  const minutes = deliveryMethod === 'delivery' ? 90 : 30 // 90 min for delivery, 30 min for pickup

  // Calculate initial estimated time
  let estimatedTime = new Date(now.getTime() + minutes * 60000)

  // Business hours: 10:30 - 22:00
  const BUSINESS_START_HOUR = 10
  const BUSINESS_START_MINUTE = 30
  const BUSINESS_END_HOUR = 22   // 22:00

  const currentHour = estimatedTime.getHours()
  const currentMinutes = estimatedTime.getMinutes()

  // If estimated time is outside business hours, adjust it
  if (currentHour < BUSINESS_START_HOUR || (currentHour === BUSINESS_START_HOUR && currentMinutes < BUSINESS_START_MINUTE)) {
    // Too early - set to business start time (10:30)
    estimatedTime.setHours(BUSINESS_START_HOUR, BUSINESS_START_MINUTE, 0, 0)
  } else if (currentHour >= BUSINESS_END_HOUR) {
    // Too late - set to next day business start (10:30)
    estimatedTime.setDate(estimatedTime.getDate() + 1)
    estimatedTime.setHours(BUSINESS_START_HOUR, BUSINESS_START_MINUTE, 0, 0)
  }
  // If between 10:30-22:00, keep the calculated time

  return estimatedTime.toISOString()
}

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        customer: true,
        branch: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Transform to match frontend interface
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer?.name || 'Guest',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      delivery_method: order.fulfillment.toLowerCase(),
      delivery_address: order.delivery_address,
      pickup_branch: order.fulfillment === 'PICKUP' ? {
        id: order.branch.id,
        name: order.branch.name,
        address: order.branch.address
      } : undefined,
      items: order.items.map(item => ({
        product_id: item.product_id,
        name: `Product ${item.product_id}`, // We'll need to join with products table for actual name
        price: item.unit_price,
        quantity: item.quantity
      })),
      subtotal: order.total_amount - order.delivery_fee,
      delivery_fee: order.delivery_fee,
      total: order.total_amount,
      status: order.status.toLowerCase(),
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      notes: order.notes,
      no_callback_confirmation: order.no_callback_confirmation,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      estimated_delivery: calculateEstimatedDelivery(order.fulfillment.toLowerCase())
    }))

    
    res.json(transformedOrders)
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Test endpoint for email functionality
router.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email functionality...')

    // Create a test order object
    const testOrder = {
      id: 'test-order-123',
      order_number: 'TEST-' + Date.now(),
      customer: {
        name: 'Test Customer',
        email: 'info@opillia.com.ua',
        phone: '+380671234567'
      },
      items: [
        {
          product: { name: 'Test Beer' },
          quantity: 2,
          unit_price: 50.00,
          total_price: 100.00
        }
      ],
      total_amount: 199.00,
      delivery_fee: 99.00,
      fulfillment: 'DELIVERY',
      delivery_address: 'вул. Тестова, 123, Київ',
      branch: { name: 'Test Branch Kyiv' },
      notes: 'Test order for email functionality',
      estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date()
    }

    console.log(`📧 Sending test email to: ${testOrder.customer.email}`)

    // Send the email
    const result = await emailService.sendOrderConfirmationEmail(testOrder)

    if (result.success) {
      console.log(`✅ Test email sent successfully!`)
      console.log(`📧 Message ID: ${result.messageId}`)

      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        sentTo: testOrder.customer.email,
        orderNumber: testOrder.order_number,
        emailConfigured: emailService.isConfigured
      })
    } else {
      console.log(`❌ Failed to send test email`)
      console.log(`❌ Error: ${result.error}`)

      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        emailConfigured: emailService.isConfigured
      })
    }

  } catch (error) {
    console.error('💥 Error in test email:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during email test',
      error: error.message,
      emailConfigured: emailService.isConfigured
    })
  }
})

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        branch: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Transform to match frontend interface
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer?.name || 'Guest',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      delivery_method: order.fulfillment.toLowerCase(),
      delivery_address: order.delivery_address,
      pickup_branch: order.fulfillment === 'PICKUP' ? {
        id: order.branch.id,
        name: order.branch.name,
        address: order.branch.address
      } : undefined,
      items: order.items.map(item => ({
        product_id: item.product_id,
        name: `Product ${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity
      })),
      subtotal: order.total_amount - order.delivery_fee,
      delivery_fee: order.delivery_fee,
      total: order.total_amount,
      status: order.status.toLowerCase(),
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      notes: order.notes,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      estimated_delivery: calculateEstimatedDelivery(order.fulfillment.toLowerCase())
    }

    
    res.json(transformedOrder)
  } catch (error) {
    console.error('❌ Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    console.log('📦 Incoming order request body:', JSON.stringify(req.body, null, 2))

    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_method,
      delivery_address,
      pickup_branch,
      items,
      delivery_fee,
      notes,
      no_callback_confirmation,
      payment_method = 'cash'
    } = req.body



    console.log(`🚚 Order details: method=${delivery_method}, pickup_branch=`, pickup_branch)

    
    

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal + (delivery_fee || 0)

    // Create or find customer
    let customer = null
    if (customer_email || customer_phone) {
      // Try to find existing customer by email first, then by phone
      if (customer_email) {
        customer = await prisma.customer.findUnique({
          where: { email: customer_email }
        })
      }

      if (!customer && customer_phone) {
        customer = await prisma.customer.findUnique({
          where: { phone: customer_phone }
        })
      }

      if (customer) {

        // Update existing customer (only update fields that have changed)
        const updateData = {}
        if (customer.name !== customer_name) updateData.name = customer_name
        if (customer.email !== customer_email) updateData.email = customer_email
        // Only update phone if it's the same customer or if phone is different
        if (customer.phone !== customer_phone) {
          // Check if another customer already has this phone
          const existingPhoneCustomer = await prisma.customer.findUnique({
            where: { phone: customer_phone }
          })
          if (!existingPhoneCustomer || existingPhoneCustomer.id === customer.id) {
            updateData.phone = customer_phone
          }
        }

        if (Object.keys(updateData).length > 0) {
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: updateData
          })
        }
      } else {
        // Create new customer
        customer = await prisma.customer.create({
          data: {
            name: customer_name,
            email: customer_email,
            phone: customer_phone
          }
        })

      }
    }

    // Find branch (use pickup branch or default to first branch for delivery)
    let branch
    if (delivery_method === 'pickup' && pickup_branch) {
      console.log(`🏪 Looking for pickup branch with ID: ${pickup_branch.id}`)

      // First try to find by the provided ID (which should be the database UUID)
      branch = await prisma.branch.findUnique({
        where: {
          id: pickup_branch.id,
          is_active: true
        }
      })

      if (!branch) {
        console.warn(`⚠️ No branch found with ID ${pickup_branch.id}, trying poster_id lookup`)
        // Fallback: try to map as if it's a simple numeric ID
        const posterBranchId = mapShopIdToPosterBranchId(pickup_branch.id)
        branch = await prisma.branch.findFirst({
          where: {
            poster_id: posterBranchId,
            is_active: true
          }
        })
      }

      if (branch) {
        console.log(`✅ Found branch: ${branch.name} (poster_id: ${branch.poster_id})`)
      }
    } else {
      // For delivery, use the first available branch
      branch = await prisma.branch.findFirst({
        where: { is_active: true }
      })
    }

    if (!branch) {
      console.error(`❌ No branch found for pickup_branch:`, pickup_branch)
      return res.status(400).json({ error: 'No available branch found' })
    }

    console.log(`📍 Using branch for order: ${branch.name} (ID: ${branch.id}, poster_id: ${branch.poster_id})`)

    // Create order
    const order = await prisma.order.create({
      data: {
        customer_id: customer?.id,
        branch_id: branch.id,
        order_number: generateOrderNumber(),
        status: 'PENDING',
        fulfillment: delivery_method.toUpperCase(),
        total_amount: total,
        delivery_fee: delivery_fee || 0,
        delivery_address,
        notes,
        no_callback_confirmation: no_callback_confirmation !== undefined ? no_callback_confirmation : true,
        // Temporarily remove payment fields until database migration is complete
        // payment_method: payment_method || 'cash',
        // payment_status: payment_method === 'online' ? 'pending' : 'pending',
        items: {
          create: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            custom_quantity: item.custom_quantity || null,
            custom_unit: item.custom_unit || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        branch: true
      }
    })

    // Transform to match frontend interface

    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer?.name || customer_name,
      customer_email: order.customer?.email || customer_email,
      customer_phone: order.customer?.phone || customer_phone,
      delivery_method: order.fulfillment.toLowerCase(),
      delivery_address: order.delivery_address,
      pickup_branch: order.fulfillment === 'PICKUP' ? {
        id: order.branch.id,
        name: order.branch.name,
        address: order.branch.address
      } : undefined,
      items: order.items.map(item => ({
        product_id: item.product_id,
        name: item.product?.name || items.find(i => i.product_id === item.product_id)?.name || `Product ${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity,
        custom_quantity: item.custom_quantity,
        custom_unit: item.custom_unit
      })),
      subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total_amount,
      status: order.status.toLowerCase(),
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      notes: order.notes,
      no_callback_confirmation: order.no_callback_confirmation,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      estimated_delivery: calculateEstimatedDelivery(order.fulfillment.toLowerCase())
    }

    

    // Send email notification to customer (async, don't wait for it)
    if (transformedOrder.customer_email) {
      console.log(`📧 Sending order confirmation email to: ${transformedOrder.customer_email}`)
      emailService.sendOrderConfirmationEmail(order)
        .then(result => {
          if (result.success) {
            console.log(`✅ Order confirmation email sent successfully to ${transformedOrder.customer_email}`)
            console.log(`📧 Message ID: ${result.messageId}`)
          } else {
            console.log(`❌ Failed to send order confirmation email to ${transformedOrder.customer_email}`)
            console.log(`❌ Error: ${result.error}`)
          }
        })
        .catch(error => {
          console.error(`❌ Error sending email confirmation:`, error)
        })
    } else {
      console.log('⚠️ No customer email provided, skipping email notification')
    }

    // Send Viber notification to customer (async, don't wait for it)
    if (transformedOrder.customer_phone) {
      sendViberOrderNotification(transformedOrder)
        .then(result => {
          if (result.success) {

          } else {

          }
        })
        .catch(error => {
          console.error(`❌ Error sending Viber notification:`, error)
        })
    }

    // 🚀 AUTOMATICALLY SEND ORDER TO POSTER POS
    try {
      

      // Get products to map to Poster product IDs
      const productIds = order.items.map(item => item.product_id)
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        }
      })

      // Map order items to Poster format with proper quantity handling
      const posterProducts = order.items.map(item => {
        const product = products.find(p => p.id === item.product_id)

        // Calculate the correct quantity for Poster POS
        let posterQuantity = item.quantity

        // If item has custom quantity system (weight-based), convert to grams for Poster
        if (item.custom_quantity && item.custom_unit) {
          // item.quantity is the number of units ordered
          // item.custom_quantity is the weight per unit in kg
          // Poster expects quantity in grams, so multiply by 1000
          posterQuantity = (item.quantity * item.custom_quantity) * 1000
          console.log(`🔄 Weight conversion: ${item.quantity} units × ${item.custom_quantity}kg = ${item.quantity * item.custom_quantity}kg = ${posterQuantity}g`)
        }

        return {
          product_id: parseInt(product?.poster_product_id) || parseInt(item.product_id),
          count: posterQuantity
        }
      }).filter(item => item.product_id && !isNaN(item.product_id)) // Only include items with valid Poster product IDs

      if (posterProducts.length > 0) {
        // Prepare Poster API request according to documentation
        const spotId = parseInt(order.branch.shop_id) || parseInt(order.branch.poster_id) || 1
        console.log(`📍 Using spot_id ${spotId} for branch ${order.branch.name} (shop_id: ${order.branch.shop_id}, poster_id: ${order.branch.poster_id})`)

        const posterOrderData = {
          spot_id: spotId,
          phone: formatPhoneForPoster(order.customer?.phone),
          products: posterProducts
        }

        // Add fulfillment type to comment and address for delivery
        if (order.fulfillment === 'DELIVERY') {
          posterOrderData.comment = 'delivery'
          if (order.delivery_address) {
            posterOrderData.address = order.delivery_address
          }
        } else {
          posterOrderData.comment = 'takeaway'
        }

        // Send to Poster POS API
        const posterResponse = await axios.post(
          `${POSTER_API_BASE}/incomingOrders.createIncomingOrder?token=${POSTER_TOKEN}`,
          posterOrderData,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        )

        

        // Update order with Poster order ID
        if (posterResponse.data && posterResponse.data.response) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              poster_order_id: posterResponse.data.response.toString(),
              status: 'CONFIRMED' // Update status to confirmed after successful Poster integration
            }
          })

          // Update the transformed order status
          transformedOrder.status = 'confirmed'

          
        }
      } else {
        
      }
    } catch (posterError) {
      console.error('❌ Failed to send order to Poster POS:', posterError.message)
      console.error('📋 Poster error details:', posterError.response?.data || posterError)
      // Don't fail the entire order creation if Poster integration fails
      // The order is still created in our system
    }

    res.status(201).json(transformedOrder)
  } catch (error) {
    console.error('❌ Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        updated_at: new Date()
      },
      include: {
        items: true,
        customer: true,
        branch: true
      }
    })

    // Transform to match frontend interface
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer?.name || 'Guest',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      delivery_method: order.fulfillment.toLowerCase(),
      delivery_address: order.delivery_address,
      pickup_branch: order.fulfillment === 'PICKUP' ? {
        id: order.branch.id,
        name: order.branch.name,
        address: order.branch.address
      } : undefined,
      items: order.items.map(item => ({
        product_id: item.product_id,
        name: `Product ${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity
      })),
      subtotal: order.total_amount - order.delivery_fee,
      delivery_fee: order.delivery_fee,
      total: order.total_amount,
      status: order.status.toLowerCase(),
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
      notes: order.notes,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      estimated_delivery: calculateEstimatedDelivery(order.fulfillment.toLowerCase())
    }

    

    // Send email status update notification (async, don't wait for it)
    if (transformedOrder.customer_email) {
      emailService.sendOrderStatusUpdateEmail(order, status.toUpperCase())
        .then(result => {
          if (result.success) {
            
          } else {
            
          }
        })
        .catch(error => {
          console.error(`❌ Error sending email status update:`, error)
        })
    }

    // Send Viber status update notification (async, don't wait for it)
    if (transformedOrder.customer_phone) {
      sendViberStatusUpdate(transformedOrder, status.toLowerCase())
        .then(result => {
          if (result.success) {
            
          } else {
            
          }
        })
        .catch(error => {
          console.error(`❌ Error sending Viber status update:`, error)
        })
    }

    res.json(transformedOrder)
  } catch (error) {
    console.error('❌ Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// POST /api/orders/:id/send-to-poster - Send order to Poster POS
router.post('/:id/send-to-poster', async (req, res) => {
  try {
    const { id } = req.params
    

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        branch: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Get products to map to Poster product IDs
    const productIds = order.items.map(item => item.product_id)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    })

    // Map order items to Poster format and combine duplicates
    const productMap = new Map()

    order.items.forEach(item => {
      const product = products.find(p => p.id === item.product_id)
      const posterProductId = parseInt(product?.poster_product_id) || parseInt(item.product_id)

      console.log(`🔍 Processing item: ${item.product_id}, poster_product_id: ${product?.poster_product_id}, final posterProductId: ${posterProductId}`)

      if (!posterProductId || isNaN(posterProductId)) {
        console.log(`❌ Skipping invalid product ID: ${posterProductId}`)
        return // Skip invalid product IDs
      }

      // Calculate the correct quantity for Poster POS
      let posterQuantity = item.quantity

      // If item has custom quantity system (weight-based), convert to grams for Poster
      if (item.custom_quantity && item.custom_unit) {
        // item.quantity is the number of units ordered (e.g., 2 units of 50g snacks)
        // item.custom_quantity is the weight per unit in kg (e.g., 0.05 for 50g)
        // Poster expects quantity in grams, so multiply by 1000
        posterQuantity = (item.quantity * item.custom_quantity) * 1000
        console.log(`🔄 Weight conversion: ${item.quantity} units × ${item.custom_quantity}kg = ${item.quantity * item.custom_quantity}kg = ${posterQuantity}g`)
      }

      // Combine quantities for duplicate products
      if (productMap.has(posterProductId)) {
        const oldQuantity = productMap.get(posterProductId)
        const newQuantity = oldQuantity + posterQuantity
        productMap.set(posterProductId, newQuantity)
        console.log(`🔄 Combined duplicate product ${posterProductId}: ${oldQuantity} + ${posterQuantity} = ${newQuantity}`)
      } else {
        productMap.set(posterProductId, posterQuantity)
        console.log(`➕ Added new product ${posterProductId}: ${posterQuantity}`)
      }
    })

    // Convert map to array format expected by Poster
    const posterProducts = Array.from(productMap.entries()).map(([product_id, count]) => ({
      product_id,
      count
    }))

    console.log(`📦 Final products for Poster:`, JSON.stringify(posterProducts, null, 2))

    if (posterProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid Poster product IDs found for order items'
      })
    }

    // Prepare Poster API request according to documentation
    const spotId = parseInt(order.branch.shop_id) || parseInt(order.branch.poster_id) || 1
    console.log(`📍 Using spot_id ${spotId} for branch ${order.branch.name} (shop_id: ${order.branch.shop_id}, poster_id: ${order.branch.poster_id})`)



    const posterOrderData = {
      spot_id: spotId,
      phone: formatPhoneForPoster(order.customer?.phone),
      products: posterProducts
    }

    // Add fulfillment type to comment and address for delivery
    if (order.fulfillment === 'DELIVERY') {
      posterOrderData.comment = 'delivery'
      if (order.delivery_address) {
        posterOrderData.address = order.delivery_address
      }
    } else {
      posterOrderData.comment = 'takeaway'
    }

    // Send to Poster POS API
    
    const posterResponse = await axios.post(
      `${POSTER_API_BASE}/incomingOrders.createIncomingOrder?token=${POSTER_TOKEN}`,
      posterOrderData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    )

    
    

    // Update order with Poster order ID
    if (posterResponse.data && posterResponse.data.response) {
      
      await prisma.order.update({
        where: { id },
        data: {
          poster_order_id: posterResponse.data.response.toString(),
          status: 'CONFIRMED' // Update status to confirmed after successful Poster integration
        }
      })
      
    } else {
      console.warn('⚠️ No Poster order ID in response:', posterResponse.data)
    }

    res.json({
      success: true,
      posterOrderId: posterResponse.data?.response,
      message: 'Order successfully sent to Poster POS'
    })

  } catch (error) {
    console.error('❌ Error sending order to Poster POS:', error)

    // Log more details about the error
    if (error.response) {
      console.error('Poster API error response:', error.response.data)
      console.error('Poster API error status:', error.response.status)
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send order to Poster POS',
      error: error.message
    })
  }
})

// POST /api/orders/send-email - Send order confirmation email (mock)
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, order_id } = req.body

    

    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP

    // For now, we'll just simulate success
    setTimeout(() => {
      
    }, 1000)

    res.json({
      success: true,
      message: 'Email sent successfully (mock)',
      messageId: `mock_${Date.now()}`
    })

  } catch (error) {
    console.error('❌ Error sending email:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    })
  }
})

// GET /api/orders/debug/poster-products - Debug endpoint to check Poster product mappings
router.get('/debug/poster-products', async (req, res) => {
  try {
    

    // Get all products with their Poster IDs
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        poster_product_id: true,
        custom_quantity: true,
        is_active: true
      },
      where: {
        is_active: true
      }
    })

    // Check which products have valid Poster IDs
    const validPosterProducts = products.filter(p => p.poster_product_id && !isNaN(parseInt(p.poster_product_id)))
    const invalidPosterProducts = products.filter(p => !p.poster_product_id || isNaN(parseInt(p.poster_product_id)))

    // Test Poster API connection
    let posterApiStatus = 'unknown'
    try {
      const testResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts?token=${POSTER_TOKEN}&type=products`, {
        timeout: 5000
      })
      posterApiStatus = testResponse.status === 200 ? 'connected' : 'error'
    } catch (apiError) {
      posterApiStatus = `error: ${apiError.message}`
    }

    res.json({
      success: true,
      poster_api_status: posterApiStatus,
      total_products: products.length,
      valid_poster_products: validPosterProducts.length,
      invalid_poster_products: invalidPosterProducts.length,
      valid_products: validPosterProducts.map(p => ({
        id: p.id,
        name: p.name,
        poster_product_id: p.poster_product_id,
        custom_quantity: p.custom_quantity
      })),
      invalid_products: invalidPosterProducts.map(p => ({
        id: p.id,
        name: p.name,
        poster_product_id: p.poster_product_id || 'missing'
      }))
    })
  } catch (error) {
    console.error('❌ Error checking Poster products:', error)
    res.status(500).json({ error: 'Failed to check Poster products' })
  }
})

// POST /api/orders/debug/test-poster - Test Poster API with sample order
router.post('/debug/test-poster', async (req, res) => {
  try {
    

    // Create a test order payload according to Poster API documentation
    const testOrderData = {
      spot_id: 1, // Default spot
      phone: '+380680000000', // Test phone number
      products: [
        {
          product_id: 169, // Example from documentation
          count: 1
        }
      ]
    }

    // Send to Poster POS API
    const posterResponse = await axios.post(
      `${POSTER_API_BASE}/incomingOrders.createIncomingOrder?token=${POSTER_TOKEN}`,
      testOrderData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    

    res.json({
      success: true,
      message: 'Poster API test successful',
      poster_response: posterResponse.data,
      test_order_data: testOrderData
    })
  } catch (error) {
    console.error('❌ Poster API test failed:', error.message)
    console.error('📋 Error details:', error.response?.data || error)

    res.status(500).json({
      success: false,
      error: 'Poster API test failed',
      message: error.message,
      poster_error: error.response?.data || null
    })
  }
})

export default router
