import express from 'express'
import cors from 'cors'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// Serve static images FIRST (before API routes)
app.use('/images', (req, res, next) => {
  console.log(`📁 Static request: ${req.url}`)
  next()
}, express.static(path.join(__dirname, 'public/images')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'PWA POS Backend is running' })
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
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
