import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUntappdMappings() {
  console.log('🔄 Adding Untappd mappings table...')

  try {
    // Check if the table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'untappd_mappings'
      );
    `

    if (tableExists[0].exists) {
      console.log('✅ Untappd mappings table already exists')
      return
    }

    // Create the untappd_mappings table
    await prisma.$executeRaw`
      CREATE TABLE "untappd_mappings" (
        "id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "untappd_beer_id" INTEGER NOT NULL,
        "untappd_url" TEXT,
        "auto_sync_enabled" BOOLEAN NOT NULL DEFAULT true,
        "last_synced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "untappd_mappings_pkey" PRIMARY KEY ("id")
      );
    `

    // Add unique constraint on product_id
    await prisma.$executeRaw`
      ALTER TABLE "untappd_mappings" ADD CONSTRAINT "untappd_mappings_product_id_key" UNIQUE ("product_id");
    `

    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "untappd_mappings" ADD CONSTRAINT "untappd_mappings_product_id_fkey" 
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    console.log('✅ Untappd mappings table created successfully')

  } catch (error) {
    console.error('❌ Error creating Untappd mappings table:', error)
    throw error
  }
}

async function main() {
  try {
    await addUntappdMappings()
    console.log('🎉 Untappd mappings migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { addUntappdMappings }
