import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBranches() {
  try {
    console.log('🔍 Checking current branches...')

    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' }
    })

    console.log(`📍 Found ${branches.length} branches:`)
    branches.forEach((branch, index) => {
      console.log(`${index + 1}. ${branch.name}`)
      console.log(`   - ID: ${branch.id}`)
      console.log(`   - Poster ID: ${branch.poster_id || 'N/A'}`)
      console.log(`   - Shop ID: ${branch.shop_id || 'N/A'}`)
      console.log(`   - Address: ${branch.address || 'N/A'}`)
      console.log(`   - Coordinates: ${branch.latitude}, ${branch.longitude}`)
      console.log(`   - Active: ${branch.is_active}`)
      console.log('')
    })

    // Check mapping
    console.log('🗺️ Shop ID to Poster ID mapping:')
    const mapping = {
      '1': '7',  // Братиславська 14Б
      '3': '4',  // Голосіївський проспект 5
      '4': '5',  // Голосіївський проспект 100/2
      '5': '9',  // Гетьмана 40А
      '6': '8'   // Данькевича 10
    }

    Object.entries(mapping).forEach(([shopId, posterId]) => {
      const branch = branches.find(b => b.shop_id === shopId || b.poster_id === posterId)
      console.log(`Shop ${shopId} → Poster ${posterId}: ${branch ? branch.name : 'NOT FOUND'}`)
    })

  } catch (error) {
    console.error('❌ Error checking branches:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBranches()
