import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { minioService } from './minioService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ImageService {
  constructor() {
    this.imagesDir = path.join(__dirname, '../public/images/products')
    this.ensureImagesDirectory()
  }

  ensureImagesDirectory() {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true })

    }
  }

  // Get the correct Poster image URL
  getPosterImageUrl(productId, hasPhoto = true) {
    if (!hasPhoto || !productId) return null

    // Try different possible formats with multiple timestamp patterns
    // Based on real data: 1707315138, 1678998630, 1678998675, 1678998721, 1688988756, 1678785050, etc.
    const timestamps = [
      '1707315138', '1678998630', '1678998675', '1678998721', '1688988756',
      '1678785050', '1678785078', '1717493132', '1678785093', '1678785064',
      '1689445896', '1678785128', '1678996480', '1678996934',
      '1679039883', '1678000000', '1680000000', '' // Fallback patterns + no timestamp
    ]
    const extensions = ['png', 'jpeg', 'jpg', 'webp']
    const possibleUrls = []

    // Generate all possible combinations
    for (const timestamp of timestamps) {
      for (const ext of extensions) {
        if (timestamp) {
          possibleUrls.push(`https://joinposter.com/upload/pos_cdb_214175/menu/product_${timestamp}_${productId}.${ext}`)
        } else {
          possibleUrls.push(`https://joinposter.com/upload/pos_cdb_214175/menu/product_${productId}.${ext}`)
        }
      }
    }

    return possibleUrls
  }

  // Check if image exists at URL
  async checkImageExists(url) {
    try {
      const response = await axios.head(url, { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  // Find the correct image URL from possible formats
  async findCorrectImageUrl(productId, hasPhoto = true) {
    if (!hasPhoto || !productId) return null

    const possibleUrls = this.getPosterImageUrl(productId, hasPhoto)

    for (const url of possibleUrls) {
      
      if (await this.checkImageExists(url)) {
        
        return url
      }
    }

    
    return null
  }

  // Optimize image: compress and convert to WebP
  // targetSize: max dimension in pixels (default 600 for product cards displayed at 490x490)
  async optimizeImage(inputPath, outputPath, format = 'webp', targetSize = 600) {
    try {
      const image = sharp(inputPath)

      // Get image metadata to determine optimal size
      const metadata = await image.metadata()

      // Resize to target dimensions (default 600px for product cards at 490x490 display)
      // This provides 1.2x pixel density for crisp display on high-DPI screens
      let pipeline = image
        .resize(targetSize, targetSize, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })

      // Convert to specified format with compression
      if (format === 'webp') {
        pipeline = pipeline.webp({ quality: 80 })
      } else if (format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: 80, progressive: true })
      } else if (format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9 })
      }

      await pipeline.toFile(outputPath)

      // Get file sizes for logging
      const originalSize = fs.statSync(inputPath).size
      const optimizedSize = fs.statSync(outputPath).size
      const savings = Math.round((1 - optimizedSize / originalSize) * 100)

      console.log(`✅ Optimized image: ${path.basename(outputPath)} (${savings}% smaller, resized to ${targetSize}x${targetSize})`)

      return outputPath
    } catch (error) {
      console.error(`⚠️  Failed to optimize image ${inputPath}, copying original:`, error.message)
      // Fallback: just copy the original file to avoid segmentation faults
      try {
        fs.copyFileSync(inputPath, outputPath)
        console.log(`✅ Copied original image: ${path.basename(outputPath)}`)
        return outputPath
      } catch (copyError) {
        console.error(`❌ Failed to copy image:`, copyError.message)
        throw copyError
      }
    }
  }

  // Download and save image locally, then upload to MinIO
  async downloadImage(imageUrl, productId) {
    try {
      if (!imageUrl) return null

      const response = await axios.get(imageUrl, {
        responseType: 'stream',
        timeout: 10000
      })

      // Get file extension from URL or default to jpg
      const urlParts = imageUrl.split('.')
      const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg'

      const filename = `product_${productId}.${extension}`
      const filepath = path.join(this.imagesDir, filename)

      // Create write stream
      const writer = fs.createWriteStream(filepath)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on('finish', async () => {
          try {
            // Optimize image to WebP format
            const webpFilename = `product_${productId}.webp`
            const webpPath = path.join(this.imagesDir, webpFilename)

            try {
              await this.optimizeImage(filepath, webpPath, 'webp')
            } catch (optimizeError) {
              console.warn(`⚠️ Could not optimize to WebP, using original:`, optimizeError.message)
            }

            // If MinIO is configured, upload both original and WebP
            if (minioService.isMinIOEnabled()) {
              try {
                // Upload WebP version if it exists
                if (fs.existsSync(webpPath)) {
                  await minioService.uploadProductImage(webpPath, webpFilename)
                }
                // Also upload original as fallback
                const minioPath = await minioService.uploadProductImage(filepath, filename)
                if (minioPath) {
                  // Return MinIO path (WebP preferred)
                  resolve(`minio://${webpFilename}`)
                } else {
                  resolve(`/images/products/${webpFilename}`)
                }
              } catch (minioError) {
                console.error(`❌ Error uploading to MinIO:`, minioError.message)
                resolve(`/images/products/${webpFilename}`)
              }
            } else {
              // MinIO not configured, use local WebP path
              resolve(`/images/products/${webpFilename}`)
            }
          } catch (error) {
            console.error(`❌ Error processing image ${filename}:`, error.message)
            // Fallback to original file
            resolve(`/images/products/${filename}`)
          }
        })
        writer.on('error', (error) => {
          console.error(`❌ Failed to save image ${filename}:`, error.message)
          reject(error)
        })
      })

    } catch (error) {
      console.error(`❌ Failed to download image for product ${productId}:`, error.message)
      return null
    }
  }

  // Process product image: download from Poster API and store locally
  async processProductImage(productId, hasPhoto = true, posterImageUrl = null) {
    try {
      // Check if we already have the image locally
      const localImagePath = this.getLocalImagePath(productId)
      if (localImagePath) {
        // If MinIO is configured, prefer MinIO path for persistence
        if (minioService.isMinIOEnabled()) {
          // Check if WebP version exists in MinIO
          const webpFilename = `product_${productId}.webp`
          try {
            const url = await minioService.getImageUrl(`products/${webpFilename}`)
            if (url) {
              return `minio://${webpFilename}`
            }
          } catch (e) {
            // Fall back to local path if MinIO check fails
          }
        }
        return `/images/products/${path.basename(localImagePath)}`
      }

      // Use provided Poster image URL first, then fallback to finding URL
      let correctUrl = posterImageUrl
      if (!correctUrl) {
        correctUrl = await this.findCorrectImageUrl(productId, hasPhoto)
      }

      if (!correctUrl) {
        return null
      }

      // Download and save the image locally
      const localPath = await this.downloadImage(correctUrl, productId)
      if (localPath) {
        // Return the web-accessible path
        return `/images/products/${path.basename(localPath)}`
      }

      return null

    } catch (error) {
      console.error(`❌ Failed to process image for product ${productId}:`, error.message)
      return null
    }
  }

  // Check if we already have the image locally
  getLocalImagePath(productId) {
    const extensions = ['png', 'jpg', 'jpeg']

    for (const ext of extensions) {
      const filename = `product_${productId}.${ext}`
      const filepath = path.join(this.imagesDir, filename)

      if (fs.existsSync(filepath)) {
        return `/images/products/${filename}`
      }
    }

    return null
  }

  // Batch process images for multiple products
  async processProductImages(products) {
    

    const results = []
    const batchSize = 5 // Process 5 images at a time to avoid overwhelming the server

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      const batchPromises = batch.map(async (product) => {
        const localImagePath = await this.processProductImage(product.poster_product_id, product.hasPhoto)
        return {
          productId: product.poster_product_id,
          localImagePath,
          originalUrl: product.image_url
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults.map(result => result.status === 'fulfilled' ? result.value : null))

      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const successCount = results.filter(r => r && r.localImagePath).length
    

    return results
  }

  // Upload existing local image to MinIO
  async uploadLocalImageToMinIO(productId) {
    try {
      const extensions = ['png', 'jpg', 'jpeg']

      for (const ext of extensions) {
        const filename = `product_${productId}.${ext}`
        const filepath = path.join(this.imagesDir, filename)

        if (fs.existsSync(filepath)) {
          const minioPath = await minioService.uploadProductImage(filepath, filename)
          if (minioPath) {
            return `minio://${minioPath}`
          }
        }
      }

      return null
    } catch (error) {
      console.error(`❌ Failed to upload local image to MinIO for product ${productId}:`, error.message)
      return null
    }
  }

  // Batch upload all local images to MinIO
  async uploadAllLocalImagesToMinIO() {
    try {
      const files = fs.readdirSync(this.imagesDir)
      const results = []

      for (const file of files) {
        if (file.startsWith('product_')) {
          const filepath = path.join(this.imagesDir, file)
          const minioPath = await minioService.uploadProductImage(filepath, file)

          if (minioPath) {
            results.push({
              filename: file,
              minioPath: `minio://${minioPath}`,
              success: true
            })
          } else {
            results.push({
              filename: file,
              success: false
            })
          }
        }
      }

      return results
    } catch (error) {
      console.error('❌ Failed to upload all images to MinIO:', error.message)
      return []
    }
  }

  // Clean up old/unused images
  async cleanupImages() {
    try {
      const files = fs.readdirSync(this.imagesDir)


      // This is a placeholder - you might want to implement logic to remove
      // images for products that no longer exist

    } catch (error) {
      console.error('❌ Failed to cleanup images:', error.message)
    }
  }
}

export const imageService = new ImageService()
export default imageService
