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
        imagePath = minioPath
        storageType = 'minio'
        console.log(`✅ Image uploaded to MinIO: ${minioPath}`)
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

// GET /api/upload/minio-image/:filename?w=300 - Serve MinIO images with optional resizing
// This endpoint supports responsive image loading with width parameter
router.get('/minio-image/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const { w } = req.query // width parameter for responsive images

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
    console.log(`📁 Fetching image from MinIO: ${filename}${w ? ` (width: ${w}px)` : ''}`)
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`❌ Failed to fetch image from MinIO: ${response.status}`)
      return res.status(response.status).json({ error: 'Failed to fetch image' })
    }

    // Get image buffer
    const buffer = await response.arrayBuffer()
    let imageBuffer = Buffer.from(buffer)

    // Resize image if width parameter is provided
    if (w) {
      const width = parseInt(w, 10)
      if (width > 0 && width < 2000) { // Reasonable width range
        try {
          console.log(`🔄 Resizing image to ${width}px width`)
          imageBuffer = await sharp(imageBuffer)
            .resize(width, width, {
              fit: 'cover',
              withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convert to WebP for better compression
            .toBuffer()

          res.setHeader('Content-Type', 'image/webp')
        } catch (resizeError) {
          console.warn(`⚠️  Failed to resize image, serving original:`, resizeError.message)
          const contentType = response.headers.get('content-type') || 'image/png'
          res.setHeader('Content-Type', contentType)
        }
      }
    } else {
      // No resize, serve original
      const contentType = response.headers.get('content-type') || 'image/png'
      res.setHeader('Content-Type', contentType)
    }

    // Send the image
    res.send(imageBuffer)
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
