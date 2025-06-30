import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addBannersTable() {
  try {
    console.log('🔄 Adding banners table...')
    
    // Create the banners table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        image_url TEXT,
        link_url TEXT,
        link_text TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    console.log('✅ Banners table created successfully!')
    
    // Add some sample banners
    console.log('🔄 Adding sample banners...')
    
    const sampleBanners = [
      {
        id: 'banner-1',
        title: 'Welcome to Our Store!',
        subtitle: 'Fresh products delivered to your door or ready for pickup',
        link_url: '/shop',
        link_text: 'Shop Now',
        is_active: true,
        sort_order: 0
      },
      {
        id: 'banner-2',
        title: 'Special Offers',
        subtitle: 'Check out our latest deals and promotions',
        link_url: '/shop',
        link_text: 'View Offers',
        is_active: true,
        sort_order: 1
      }
    ]
    
    for (const banner of sampleBanners) {
      await prisma.$executeRaw`
        INSERT OR IGNORE INTO banners (id, title, subtitle, link_url, link_text, is_active, sort_order, created_at, updated_at)
        VALUES (${banner.id}, ${banner.title}, ${banner.subtitle}, ${banner.link_url}, ${banner.link_text}, ${banner.is_active}, ${banner.sort_order}, datetime('now'), datetime('now'))
      `
    }
    
    console.log('✅ Sample banners added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding banners table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addBannersTable()
  .then(() => {
    console.log('🎉 Banners table setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to setup banners table:', error)
    process.exit(1)
  })
