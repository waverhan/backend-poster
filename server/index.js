import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import categoriesRouter from './routes/categories.js'
import productsRouter from './routes/products.js'
import branchesRouter from './routes/branches.js'
import syncRouter from './routes/sync.js'
import uploadRouter from './routes/upload.js'
import ordersRouter from './routes/orders.js'
import siteConfigRouter from './routes/siteConfig.js'
import licenseRouter from './routes/license.js'
import messagingRouter from './routes/messaging.js'
import bannersRouter from './routes/banners.js'
import inventoryRouter from './routes/inventory.js'
import feedRoutes from './routes/feeds.js'
import sitemapRoutes from './routes/sitemap.js'
import wayforpayRoutes from './routes/wayforpay.js'
import salesRouter from './routes/sales.js'
import untappdRouter from './routes/untappd.js'
import reviewsRouter from './routes/reviews.js'
import likesRouter from './routes/likes.js'
import aiReviewsRouter from './routes/aiReviews.js'
import authRouter from './routes/auth.js'
import userOrdersRouter from './routes/userOrders.js'
import notFoundErrorsRouter from './routes/notFoundErrors.js'
import discountsRouter from './routes/discounts.js'
import geocodingRouter from './routes/geocoding.js'
import fixBundleRouter from './routes/fix-bundle.js'
import './scripts/setup-cron.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Initialize Prisma with connection pooling and error handling
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty'
})

// Handle Prisma connection errors
prisma.$on('error', (e) => {
  console.error('❌ Prisma error:', e)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, closing database connection...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, closing database connection...')
  await prisma.$disconnect()
  process.exit(0)
})

// Middleware - Simple CORS configuration that allows all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}))

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  res.header('Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`)
  next()
})

// Enable compression for all responses
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false
    }
    // Use compression for all requests
    return compression.filter(req, res)
  },
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024 // Only compress responses larger than 1KB
}))

app.use(express.json())

// Serve static images FIRST (before API routes) with optimized headers
app.use('/images', (req, res, next) => {
  console.log(`📁 Static request: ${req.url}`)

  // Optimized cache headers for faster loading
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year cache
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

  next()
}, express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1y', // 1 year cache
  etag: false, // Disable ETag for faster serving
  lastModified: false, // Disable last-modified for faster serving
  index: false, // Disable directory indexing
  dotfiles: 'ignore' // Ignore dotfiles
}))

// Middleware to handle MinIO image URLs in product responses
app.use((req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res)

  // Override json method to transform MinIO URLs
  res.json = function(data) {
    // Transform MinIO URLs to accessible endpoints
    const transformData = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(transformData)
      } else if (obj !== null && typeof obj === 'object') {
        const transformed = {}
        for (const key in obj) {
          if (key === 'image_url' || key === 'display_image_url') {
            if (typeof obj[key] === 'string') {
              if (obj[key].startsWith('minio://')) {
                // Convert minio://products/filename to /api/upload/minio-image/filename
                const filename = obj[key].replace('minio://', '').replace('products/', '')
                transformed[key] = `/api/upload/minio-image/${filename}`
              } else if (obj[key].startsWith('/images/products/')) {
                // Convert local Railway paths to MinIO endpoint
                // /images/products/product_57.png -> /api/upload/minio-image/product_57.png
                const filename = obj[key].replace('/images/products/', '')
                transformed[key] = `/api/upload/minio-image/${filename}`
              } else {
                transformed[key] = obj[key]
              }
            } else {
              transformed[key] = obj[key]
            }
          } else {
            transformed[key] = transformData(obj[key])
          }
        }
        return transformed
      }
      return obj
    }

    const transformedData = transformData(data)
    return originalJson(transformedData)
  }

  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'PWA POS Backend is running' })
})

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CORS is working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/branches', branchesRouter)
app.use('/api/sync', syncRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/site-config', siteConfigRouter)
app.use('/api/license', licenseRouter)
app.use('/api/messaging', messagingRouter)
app.use('/api/banners', bannersRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/feeds', feedRoutes)
app.use('/api', sitemapRoutes)
app.use('/api/wayforpay', wayforpayRoutes)
app.use('/api/sales', salesRouter)
app.use('/api/untappd', untappdRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/likes', likesRouter)
app.use('/api/ai-reviews', aiReviewsRouter)
app.use('/api/auth', authRouter)
app.use('/api/user', userOrdersRouter)
app.use('/api/404-errors', notFoundErrorsRouter)
app.use('/api/discounts', discountsRouter)
app.use('/api/geocoding', geocodingRouter)
app.use('/api/fix-bundle', fixBundleRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'PWA POS Backend'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'PWA POS Backend API'
  });
});

// 404 tracking middleware for frontend routes
app.use((req, res, next) => {
  // Skip tracking for static files, API routes, and system files
  if (req.path.startsWith('/api') ||
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i) ||
      req.path === '/robots.txt' ||
      req.path === '/sitemap.xml' ||
      req.path === '/favicon.ico' ||
      req.path === '/.well-known' ||
      req.path.startsWith('/.well-known/')) {
    return next()
  }

  // Track 404 error asynchronously (don't wait for it)
  const getClientIp = () => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip
  }

  prisma.notFoundError.findFirst({
    where: { requested_url: req.path }
  }).then(existing => {
    if (existing) {
      prisma.notFoundError.update({
        where: { id: existing.id },
        data: {
          count: existing.count + 1,
          last_seen: new Date(),
          referrer: req.headers.referer || existing.referrer,
          user_agent: req.headers['user-agent'] || existing.user_agent,
          ip_address: getClientIp() || existing.ip_address
        }
      }).catch(err => console.error('Error updating 404 error:', err))
    } else {
      prisma.notFoundError.create({
        data: {
          requested_url: req.path,
          referrer: req.headers.referer,
          user_agent: req.headers['user-agent'],
          ip_address: getClientIp()
        }
      }).catch(err => console.error('Error creating 404 error:', err))
    }
  }).catch(err => console.error('Error tracking 404:', err))

  next()
})

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(port, () => {
  console.log(`🚀 PWA POS Backend running on http://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
})

export { prisma }
