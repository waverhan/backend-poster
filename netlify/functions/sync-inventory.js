// Netlify Function for Inventory Synchronization
// This function can be triggered by cron jobs or webhooks

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Poster API configuration
const POSTER_API_TOKEN = '218047:05891220e474bad7f26b6eaa0be3f344'
const POSTER_API_BASE = 'https://joinposter.com/api'

exports.handler = async (event, context) => {
  try {
    console.log('🔄 Starting inventory synchronization...')
    
    // Get all branches from database
    const branches = await prisma.branch.findMany({
      where: { is_active: true }
    })

    let totalUpdated = 0
    const syncResults = []

    for (const branch of branches) {
      console.log(`📍 Syncing inventory for branch: ${branch.name}`)
      
      try {
        // Fetch current inventory from Poster API
        const inventoryResponse = await fetch(
          `${POSTER_API_BASE}/storage.getStorageLeftovers?token=${POSTER_API_TOKEN}&spot_id=${branch.poster_id}`,
          { method: 'GET' }
        )

        if (!inventoryResponse.ok) {
          throw new Error(`Poster API error: ${inventoryResponse.status}`)
        }

        const inventoryData = await inventoryResponse.json()
        
        if (inventoryData.error) {
          throw new Error(`Poster API error: ${inventoryData.error}`)
        }

        const leftovers = inventoryData.response || []
        let branchUpdated = 0

        // Update inventory for each product
        for (const leftover of leftovers) {
          const productId = leftover.ingredient_id
          const stockLevel = parseFloat(leftover.storage_ingredient_left) || 0

          // Update product inventory in database
          const updated = await prisma.productInventory.upsert({
            where: {
              product_id_branch_id: {
                product_id: productId,
                branch_id: branch.id
              }
            },
            update: {
              stock_level: stockLevel,
              last_updated: new Date(),
              last_sync_at: new Date()
            },
            create: {
              product_id: productId,
              branch_id: branch.id,
              stock_level: stockLevel,
              last_updated: new Date(),
              last_sync_at: new Date()
            }
          })

          if (updated) branchUpdated++
        }

        syncResults.push({
          branch: branch.name,
          products_updated: branchUpdated,
          status: 'success'
        })

        totalUpdated += branchUpdated
        console.log(`✅ Updated ${branchUpdated} products for ${branch.name}`)

      } catch (branchError) {
        console.error(`❌ Error syncing ${branch.name}:`, branchError)
        syncResults.push({
          branch: branch.name,
          products_updated: 0,
          status: 'error',
          error: branchError.message
        })
      }
    }

    // Update sync log
    await prisma.syncLog.create({
      data: {
        sync_type: 'inventory',
        status: 'completed',
        total_records: totalUpdated,
        details: JSON.stringify(syncResults),
        started_at: new Date(),
        completed_at: new Date()
      }
    })

    console.log(`🎉 Inventory sync completed! Updated ${totalUpdated} products across ${branches.length} branches`)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Inventory synchronization completed',
        total_updated: totalUpdated,
        branches_synced: branches.length,
        results: syncResults,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Inventory sync failed:', error)

    // Log the error
    try {
      await prisma.syncLog.create({
        data: {
          sync_type: 'inventory',
          status: 'failed',
          error_message: error.message,
          started_at: new Date(),
          completed_at: new Date()
        }
      })
    } catch (logError) {
      console.error('Failed to log sync error:', logError)
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Inventory synchronization failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}
