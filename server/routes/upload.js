import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { minioService } from '../services/minioService.js'

const router = express.Router()

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/images/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_')
    cb(null, `product_${timestamp}_${sanitizedName}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// POST /api/upload/product-image
router.post('/product-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    let imagePath = `/images/products/${req.file.filename}`
    let storageType = 'local'

    // Try to upload to MinIO if configured
    if (minioService.isMinIOEnabled()) {
      const minioPath = await minioService.uploadProductImage(
        req.file.path,
        req.file.filename
      )

      if (minioPath) {
        // Return MinIO path with minio:// prefix for proper handling
        imagePath = `minio://${minioPath}`
        storageType = 'minio'
        
      }
    }

    res.json({
      success: true,
      imagePath,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      storageType
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Simple in-memory cache for transformed images to avoid reprocessing the same variant
const imageCache = new Map()
const CACHE_TTL_MS = 1000 * 60 * 15 // 15 minutes

const getCacheKey = (filename, width, format, quality) =>
  `${filename}:${width || 'auto'}:${format || 'orig'}:${quality || 'default'}`

// Clamp helper to keep params within sane limits
const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max)

// GET /api/upload/minio-image/:filename?w=300&format=webp - Serve MinIO images with optional resizing
// Supports responsive image loading with width + optional format/quality conversion
router.get('/minio-image/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const { w, format: requestedFormat, q } = req.query // width/format/quality params

    const width = w ? clampNumber(parseInt(w, 10) || 0, 60, 2000) : null
    const format = typeof requestedFormat === 'string' ? requestedFormat.toLowerCase() : null
    const supportedFormats = ['webp', 'avif', 'jpeg', 'png']
    const safeFormat = supportedFormats.includes(format) ? format : null
    const quality = q ? clampNumber(parseInt(q, 10) || 0, 40, 95) : 82

    const cacheKey = getCacheKey(filename, width, safeFormat, quality)
    const now = Date.now()
    const cachedEntry = imageCache.get(cacheKey)

    if (cachedEntry) {
      if (cachedEntry.expiresAt > now) {
        res.setHeader('Content-Type', cachedEntry.contentType)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        return res.send(cachedEntry.buffer)
      }
      imageCache.delete(cacheKey)
    }

    // Set cache headers for long-term caching (images are immutable)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year cache
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    // Get presigned URL from MinIO (without any query parameters)
    const url = await minioService.getImageUrl(`products/${filename}`)

    if (!url) {
      console.warn(`❌ Image not found in MinIO: ${filename}`)
      return res.status(404).json({ error: 'Image not found' })
    }

    // Fetch the image from MinIO
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`❌ Failed to fetch image from MinIO: ${response.status}`)
      return res.status(response.status).json({ error: 'Failed to fetch image' })
    }

    // Get image buffer
    const buffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)

    let contentType = response.headers.get('content-type') || 'image/jpeg'
    let outputBuffer = imageBuffer

    const canTransform =
      (width || safeFormat) &&
      !contentType.includes('gif') &&
      !contentType.includes('svg')

    if (canTransform) {
      try {
        const pipeline = sharp(imageBuffer, { failOn: 'none', unlimited: false })

        if (width) {
          pipeline.resize({
            width,
            withoutEnlargement: true,
            fit: 'inside'
          })
        }

        if (safeFormat === 'webp') {
          pipeline.webp({ quality, effort: 4 })
          contentType = 'image/webp'
        } else if (safeFormat === 'avif') {
          pipeline.avif({ quality: clampNumber(quality, 40, 85), effort: 4 })
          contentType = 'image/avif'
        } else if (safeFormat === 'png') {
          pipeline.png({ quality: clampNumber(quality, 40, 100), compressionLevel: 9 })
          contentType = 'image/png'
        } else if (safeFormat === 'jpeg') {
          pipeline.jpeg({ quality, mozjpeg: true })
          contentType = 'image/jpeg'
        }

        outputBuffer = await pipeline.toBuffer()
      } catch (error) {
        console.warn('⚠️ Image transform failed, falling back to original:', error.message)
        outputBuffer = imageBuffer
      }
    }

    res.setHeader('Content-Type', contentType)
    res.send(outputBuffer)

    imageCache.set(cacheKey, {
      buffer: outputBuffer,
      contentType,
      expiresAt: Date.now() + CACHE_TTL_MS
    })

    if (imageCache.size > 200) {
      const oldestKey = imageCache.keys().next().value
      if (oldestKey) {
        imageCache.delete(oldestKey)
      }
    }
  } catch (error) {
    console.error('Error serving image:', error)
    res.status(500).json({ error: 'Failed to serve image' })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' })
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' })
  }

  console.error('Upload error:', error)
  res.status(500).json({ error: 'Upload failed' })
})

export default router
