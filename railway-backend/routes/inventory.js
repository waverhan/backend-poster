import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// GET /api/inventory/branch/:branchId - Get all inventory for a branch
router.get('/branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params
    
    console.log(`📦 Getting inventory for branch: ${branchId}`)

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      })
    }

    // Get all inventory for this branch
    const inventory = await prisma.productInventory.findMany({
      where: { branch_id: branchId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true,
            poster_product_id: true
          }
        }
      },
      orderBy: { last_updated: 'desc' }
    })

    const inventoryStatus = inventory.map(item => ({
      product_id: item.product_id,
      branch_id: item.branch_id,
      stock_level: item.quantity || 0,
      last_updated: item.last_updated.toISOString(),
      last_sync_at: item.last_sync_at?.toISOString() || item.last_updated.toISOString(),
      is_available: (item.quantity || 0) > 0,
      low_stock_threshold: 5, // Default threshold
      product_name: item.product.display_name || item.product.name,
      unit: item.unit || 'pcs'
    }))

    console.log(`✅ Found ${inventoryStatus.length} inventory records for branch ${branch.name}`)

    res.json(inventoryStatus)

  } catch (error) {
    console.error('❌ Error getting branch inventory:', error)
    res.status(500).json({
      error: 'Failed to get branch inventory',
      message: error.message
    })
  }
})

// POST /api/inventory/products - Get inventory for specific products
router.post('/products', async (req, res) => {
  try {
    const { product_ids, branch_id } = req.body

    if (!product_ids || !Array.isArray(product_ids) || !branch_id) {
      return res.status(400).json({
        error: 'Invalid request. product_ids (array) and branch_id are required'
      })
    }

    console.log(`📦 Getting inventory for ${product_ids.length} products in branch: ${branch_id}`)

    const inventory = await prisma.productInventory.findMany({
      where: {
        product_id: { in: product_ids },
        branch_id: branch_id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true
          }
        }
      }
    })

    const inventoryStatus = inventory.map(item => ({
      product_id: item.product_id,
      branch_id: item.branch_id,
      stock_level: item.quantity || 0,
      last_updated: item.last_updated.toISOString(),
      last_sync_at: item.last_sync_at?.toISOString() || item.last_updated.toISOString(),
      is_available: (item.quantity || 0) > 0,
      low_stock_threshold: 5,
      product_name: item.product.display_name || item.product.name,
      unit: item.unit || 'pcs'
    }))

    res.json(inventoryStatus)

  } catch (error) {
    console.error('❌ Error getting products inventory:', error)
    res.status(500).json({
      error: 'Failed to get products inventory',
      message: error.message
    })
  }
})

// GET /api/inventory/check/:productId/:branchId - Check product availability
router.get('/check/:productId/:branchId', async (req, res) => {
  try {
    const { productId, branchId } = req.params
    const requiredQuantity = parseFloat(req.query.quantity) || 1

    console.log(`🔍 Checking availability: Product ${productId}, Branch ${branchId}, Quantity ${requiredQuantity}`)

    const inventory = await prisma.productInventory.findUnique({
      where: {
        product_id_branch_id: {
          product_id: productId,
          branch_id: branchId
        }
      }
    })

    const stockLevel = inventory?.quantity || 0
    const available = stockLevel >= requiredQuantity

    res.json({
      available,
      stock_level: stockLevel,
      last_updated: inventory?.last_updated?.toISOString() || new Date().toISOString(),
      required_quantity: requiredQuantity,
      unit: inventory?.unit || 'pcs'
    })

  } catch (error) {
    console.error('❌ Error checking product availability:', error)
    res.status(500).json({
      error: 'Failed to check product availability',
      message: error.message
    })
  }
})

// GET /api/inventory/low-stock/:branchId - Get low stock alerts
router.get('/low-stock/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params
    const threshold = parseFloat(req.query.threshold) || 5

    console.log(`⚠️ Getting low stock alerts for branch: ${branchId}, threshold: ${threshold}`)

    const lowStockItems = await prisma.productInventory.findMany({
      where: {
        branch_id: branchId,
        quantity: {
          gt: 0,
          lte: threshold
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            display_name: true
          }
        }
      },
      orderBy: { quantity: 'asc' }
    })

    const alerts = lowStockItems.map(item => ({
      product_id: item.product_id,
      branch_id: item.branch_id,
      stock_level: item.quantity || 0,
      last_updated: item.last_updated.toISOString(),
      last_sync_at: item.last_sync_at?.toISOString() || item.last_updated.toISOString(),
      is_available: (item.quantity || 0) > 0,
      low_stock_threshold: threshold,
      product_name: item.product.display_name || item.product.name,
      unit: item.unit || 'pcs'
    }))

    console.log(`⚠️ Found ${alerts.length} low stock items`)

    res.json(alerts)

  } catch (error) {
    console.error('❌ Error getting low stock alerts:', error)
    res.status(500).json({
      error: 'Failed to get low stock alerts',
      message: error.message
    })
  }
})

// POST /api/inventory/sync/trigger - Trigger manual inventory sync
router.post('/sync/trigger', async (req, res) => {
  try {
    console.log('🔄 Manual inventory sync triggered')

    // This will call the existing sync endpoint
    const syncResponse = await fetch(`${req.protocol}://${req.get('host')}/api/sync/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!syncResponse.ok) {
      throw new Error(`Sync failed with status: ${syncResponse.status}`)
    }

    const syncResult = await syncResponse.json()

    res.json({
      success: true,
      message: 'Inventory sync triggered successfully',
      result: syncResult
    })

  } catch (error) {
    console.error('❌ Error triggering inventory sync:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to trigger inventory sync',
      message: error.message
    })
  }
})

// GET /api/inventory/sync/status/latest - Get latest sync status
router.get('/sync/status/latest', async (req, res) => {
  try {
    console.log('📊 Getting latest sync status')

    // Get the latest sync log entry
    const latestSync = await prisma.syncLog.findFirst({
      where: { sync_type: 'inventory' },
      orderBy: { started_at: 'desc' }
    })

    if (!latestSync) {
      return res.json(null)
    }

    const syncStatus = {
      id: latestSync.id,
      sync_type: latestSync.sync_type,
      status: latestSync.status,
      total_records: latestSync.total_records,
      error_message: latestSync.error_message,
      started_at: latestSync.started_at.toISOString(),
      completed_at: latestSync.completed_at?.toISOString()
    }

    res.json(syncStatus)

  } catch (error) {
    console.error('❌ Error getting sync status:', error)
    res.status(500).json({
      error: 'Failed to get sync status',
      message: error.message
    })
  }
})

// GET /api/inventory/sync/history - Get sync history
router.get('/sync/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10

    console.log(`📊 Getting sync history (limit: ${limit})`)

    const syncHistory = await prisma.syncLog.findMany({
      where: { sync_type: 'inventory' },
      orderBy: { started_at: 'desc' },
      take: limit
    })

    const history = syncHistory.map(sync => ({
      id: sync.id,
      sync_type: sync.sync_type,
      status: sync.status,
      total_records: sync.total_records,
      error_message: sync.error_message,
      started_at: sync.started_at.toISOString(),
      completed_at: sync.completed_at?.toISOString()
    }))

    res.json(history)

  } catch (error) {
    console.error('❌ Error getting sync history:', error)
    res.status(500).json({
      error: 'Failed to get sync history',
      message: error.message
    })
  }
})

export default router
