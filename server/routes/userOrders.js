import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/user/orders - Get user's order history
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    console.log(`📋 Fetching order history for user: ${userId}`)

    const orders = await prisma.order.findMany({
      where: {
        user_id: userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image_url: true,
                unit: true,
                is_draft_beverage: true,
                is_bottle_product: true
              }
            }
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Transform orders to match frontend interface
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status.toLowerCase(),
      fulfillment: order.fulfillment.toLowerCase(),
      total_amount: order.total_amount,
      delivery_fee: order.delivery_fee,
      subtotal: order.total_amount - order.delivery_fee,
      delivery_address: order.delivery_address,
      notes: order.notes,
      payment_method: order.payment_method || 'cash',
      payment_status: order.payment_status || 'pending',
      poster_order_id: order.poster_order_id,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      branch: order.branch,
      items: order.items.map(item => {
        // Debug product name resolution
        const productName = item.product_name || item.product?.name || `Product ${item.product_id}`
        if (!item.product_name && !item.product?.name) {
          console.log(`⚠️ Missing product name for item ${item.id}, product_id: ${item.product_id}`)
        }

        return {
          id: item.id,
          product_id: item.product_id,
          name: productName,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          custom_quantity: item.custom_quantity,
          custom_unit: item.custom_unit,
          image_url: item.product?.image_url,
          unit: item.product?.unit,
          is_draft_beverage: item.product?.is_draft_beverage || false,
          is_bottle_product: item.product?.is_bottle_product || false
        }
      })
    }))

    console.log(`✅ Found ${transformedOrders.length} orders for user ${userId}`)
    res.json({
      success: true,
      orders: transformedOrders,
      total: transformedOrders.length
    })

  } catch (error) {
    console.error('❌ Error fetching user orders:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order history' 
    })
  }
})

// GET /api/user/orders/:id - Get specific order details
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const orderId = req.params.id
    console.log(`📋 Fetching order ${orderId} for user: ${userId}`)

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image_url: true,
                unit: true,
                price: true,
                is_draft_beverage: true,
                is_bottle_product: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Transform order to match frontend interface
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      status: order.status.toLowerCase(),
      fulfillment: order.fulfillment.toLowerCase(),
      total_amount: order.total_amount,
      delivery_fee: order.delivery_fee,
      subtotal: order.total_amount - order.delivery_fee,
      delivery_address: order.delivery_address,
      notes: order.notes,
      payment_method: order.payment_method || 'cash',
      payment_status: order.payment_status || 'pending',
      poster_order_id: order.poster_order_id,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      branch: order.branch,
      items: order.items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name || item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        custom_quantity: item.custom_quantity,
        custom_unit: item.custom_unit,
        image_url: item.product?.image_url,
        unit: item.product?.unit,
        current_price: item.product?.price, // Current price for reorder comparison
        category_name: item.product?.category?.name,
        is_draft_beverage: item.product?.is_draft_beverage || false,
        is_bottle_product: item.product?.is_bottle_product || false
      }))
    }

    console.log(`✅ Found order ${orderId} for user ${userId}`)
    res.json({
      success: true,
      order: transformedOrder
    })

  } catch (error) {
    console.error('❌ Error fetching order details:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order details' 
    })
  }
})

// POST /api/user/orders/:id/reorder - Add order items to cart for reordering
router.post('/orders/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const orderId = req.params.id
    console.log(`🔄 Processing reorder for order ${orderId} by user: ${userId}`)

    // Get the order with items
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId // Ensure user can only reorder their own orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                is_active: true,
                image_url: true,
                unit: true,
                is_draft_beverage: true,
                is_bottle_product: true,
                category: {
                  select: {
                    is_active: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Filter out inactive products and prepare reorder items
    const reorderItems = []
    const unavailableItems = []

    for (const item of order.items) {
      if (item.product && item.product.is_active && item.product.category?.is_active !== false) {
        reorderItems.push({
          product_id: item.product_id,
          name: item.product.name,
          price: item.product.price, // Use current price, not historical price
          quantity: item.quantity,
          custom_quantity: item.custom_quantity,
          custom_unit: item.custom_unit,
          image_url: item.product.image_url,
          unit: item.product.unit,
          is_draft_beverage: item.product.is_draft_beverage,
          is_bottle_product: item.product.is_bottle_product,
          historical_price: item.unit_price // Keep track of what they paid before
        })
      } else {
        unavailableItems.push({
          name: item.product_name || item.product?.name || 'Unknown Product',
          reason: !item.product ? 'Product no longer exists' :
                  !item.product.is_active ? 'Product is no longer available' :
                  'Product category is no longer active'
        })
      }
    }

    console.log(`✅ Prepared ${reorderItems.length} items for reorder, ${unavailableItems.length} unavailable`)

    res.json({
      success: true,
      reorder_items: reorderItems,
      unavailable_items: unavailableItems,
      original_order: {
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at.toISOString(),
        total_amount: order.total_amount
      }
    })

  } catch (error) {
    console.error('❌ Error processing reorder:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process reorder' 
    })
  }
})

export default router
