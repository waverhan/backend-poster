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

  // Business hours: 10:00 - 22:00
  const BUSINESS_START = 10 // 10:00
  const BUSINESS_END = 22   // 22:00

  const currentHour = estimatedTime.getHours()
  const currentMinutes = estimatedTime.getMinutes()

  // If estimated time is outside business hours, adjust it
  if (currentHour < BUSINESS_START) {
    // Too early - set to business start time
    estimatedTime.setHours(BUSINESS_START, 0, 0, 0)
  } else if (currentHour >= BUSINESS_END) {
    // Too late - set to next day business start
    estimatedTime.setDate(estimatedTime.getDate() + 1)
    estimatedTime.setHours(BUSINESS_START, 0, 0, 0)
  }
  // If between 10:00-22:00, keep the calculated time

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
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_method,
      delivery_address,
      pickup_branch,
      items,
      delivery_fee,
      notes
    } = req.body

    
    

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
        // Update existing customer
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: customer_name,
            email: customer_email,
            phone: customer_phone
          }
        })
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
      branch = await prisma.branch.findUnique({
        where: { id: pickup_branch.id }
      })
    } else {
      // For delivery, use the first available branch
      branch = await prisma.branch.findFirst({
        where: { is_active: true }
      })
    }

    if (!branch) {
      return res.status(400).json({ error: 'No available branch found' })
    }

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
        items: {
          create: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }))
        }
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
        name: items.find(i => i.product_id === item.product_id)?.name || `Product ${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity
      })),
      subtotal,
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

    

    // Send email notification to customer (async, don't wait for it)
    if (transformedOrder.customer_email) {
      emailService.sendOrderConfirmationEmail(order)
        .then(result => {
          if (result.success) {
            
          } else {
            
          }
        })
        .catch(error => {
          console.error(`❌ Error sending email confirmation:`, error)
        })
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

        // If product has custom quantity system, convert to kg for Poster
        if (product?.custom_quantity) {
          posterQuantity = item.quantity * product.custom_quantity
          
        }

        return {
          product_id: parseInt(product?.poster_product_id) || parseInt(item.product_id),
          count: posterQuantity
        }
      }).filter(item => item.product_id && !isNaN(item.product_id)) // Only include items with valid Poster product IDs

      if (posterProducts.length > 0) {
        // Prepare Poster API request according to documentation
        const posterOrderData = {
          spot_id: parseInt(order.branch.poster_id) || 1, // Use branch's Poster ID or default to 1
          phone: order.customer?.phone || '+380000000000',
          products: posterProducts
        }

        // Add delivery address if it's a delivery order
        if (order.fulfillment === 'DELIVERY' && order.delivery_address) {
          posterOrderData.address = order.delivery_address
        }

        )

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

    // Map order items to Poster format with proper quantity handling
    const posterProducts = order.items.map(item => {
      const product = products.find(p => p.id === item.product_id)

      // Calculate the correct quantity for Poster POS
      let posterQuantity = item.quantity

      // If product has custom quantity system, convert to kg for Poster
      if (product?.custom_quantity) {
        // item.quantity is the number of units ordered (e.g., 2 units of 50g snacks)
        // custom_quantity is the weight per unit in kg (e.g., 0.05 for 50g)
        // So total weight = item.quantity * custom_quantity
        posterQuantity = item.quantity * product.custom_quantity
        
      }

      return {
        product_id: parseInt(product?.poster_product_id) || parseInt(item.product_id),
        count: posterQuantity
      }
    }).filter(item => item.product_id && !isNaN(item.product_id)) // Only include items with valid Poster product IDs

    if (posterProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid Poster product IDs found for order items'
      })
    }

    // Prepare Poster API request according to documentation
    const posterOrderData = {
      spot_id: parseInt(order.branch.poster_id) || 1, // Use branch's Poster ID or default to 1
      phone: order.customer?.phone || '+380000000000',
      products: posterProducts
    }

    // Add delivery address if it's a delivery order
    if (order.fulfillment === 'DELIVERY' && order.delivery_address) {
      posterOrderData.address = order.delivery_address
    }

    )

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

    )

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
