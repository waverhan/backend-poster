const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestBranch() {
  try {
    console.log('🔄 Adding test branch...')

    // Check if branch already exists
    const existingBranch = await prisma.branch.findFirst({
      where: { name: 'Test Branch' }
    })

    if (existingBranch) {
      console.log('⏭️ Test branch already exists:', existingBranch.name)
      return existingBranch
    }

    // Create test branch
    const branch = await prisma.branch.create({
      data: {
        poster_id: 'test-branch-1',
        name: 'Test Branch',
        address: '123 Test Street, Kyiv, Ukraine',
        phone: '+380123456789',
        latitude: 50.4501,
        longitude: 30.5234,
        is_active: true
      }
    })

    console.log('✅ Created test branch:', branch.name)
    return branch

  } catch (error) {
    console.error('❌ Failed to add test branch:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestBranch()
