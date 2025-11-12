import { Client } from 'minio'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

class MinIOService {
  constructor() {
    this.client = null
    this.bucketName = process.env.MINIO_BUCKET || 'opillia-images'
    this.isConfigured = false
    this.initializeClient()
  }

  initializeClient() {
    try {
      const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost:9000'
      const minioAccessKey = process.env.MINIO_ACCESS_KEY
      const minioSecretKey = process.env.MINIO_SECRET_KEY
      const minioUseSSL = process.env.MINIO_USE_SSL === 'true'

      // Only initialize if credentials are provided
      if (!minioAccessKey || !minioSecretKey) {
        console.log('⚠️  MinIO credentials not provided. Using local file storage.')
        return
      }

      this.client = new Client({
        endPoint: minioEndpoint,
        accessKey: minioAccessKey,
        secretKey: minioSecretKey,
        useSSL: minioUseSSL
      })

      this.isConfigured = true
      console.log('✅ MinIO service configured successfully')
      this.ensureBucket()
    } catch (error) {
      console.error('❌ Failed to configure MinIO service:', error)
    }
  }

  async ensureBucket() {
    if (!this.isConfigured) return

    try {
      const exists = await this.client.bucketExists(this.bucketName)
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1')
        console.log(`✅ Created MinIO bucket: ${this.bucketName}`)
      }
    } catch (error) {
      console.error(`❌ Failed to ensure bucket ${this.bucketName}:`, error)
    }
  }

  async uploadProductImage(filePath, fileName) {
    if (!this.isConfigured) {
      console.log('⚠️  MinIO not configured. Skipping upload.')
      return null
    }

    try {
      const fileStream = fs.createReadStream(filePath)
      const fileStats = fs.statSync(filePath)
      const objectName = `products/${fileName}`

      await this.client.putObject(
        this.bucketName,
        objectName,
        fileStream,
        fileStats.size,
        { 'Content-Type': 'image/jpeg' }
      )

      console.log(`✅ Uploaded image to MinIO: ${objectName}`)
      return objectName
    } catch (error) {
      console.error('❌ Failed to upload image to MinIO:', error)
      return null
    }
  }

  async deleteProductImage(objectName) {
    if (!this.isConfigured) return false

    try {
      await this.client.removeObject(this.bucketName, objectName)
      console.log(`✅ Deleted image from MinIO: ${objectName}`)
      return true
    } catch (error) {
      console.error('❌ Failed to delete image from MinIO:', error)
      return false
    }
  }

  async getImageUrl(objectName) {
    if (!this.isConfigured) return null

    try {
      const url = await this.client.presignedGetObject(
        this.bucketName,
        objectName,
        24 * 60 * 60 // 24 hours expiry
      )
      return url
    } catch (error) {
      console.error('❌ Failed to get image URL from MinIO:', error)
      return null
    }
  }

  async listProductImages() {
    if (!this.isConfigured) return []

    try {
      const objectsList = []
      const stream = this.client.listObjects(this.bucketName, 'products/', true)

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          objectsList.push(obj.name)
        })
        stream.on('error', reject)
        stream.on('end', () => resolve(objectsList))
      })
    } catch (error) {
      console.error('❌ Failed to list images from MinIO:', error)
      return []
    }
  }

  isMinIOEnabled() {
    return this.isConfigured
  }
}

export const minioService = new MinIOService()

