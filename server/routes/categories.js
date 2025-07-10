import express from 'express'
import { PrismaClient } from '@prisma/client'
import { getCategories, createCategory } from '../services/database.js'

const prisma = new PrismaClient()

const router = express.Router()

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await getCategories()
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating category with data:', req.body)

    const { name, display_name, description, image_url, sort_order, is_active } = req.body

    // Validation
    if (!display_name || display_name.trim() === '') {
      console.error('❌ Validation error: display_name is required')
      return res.status(400).json({ error: 'Display name is required' })
    }

    // Auto-generate name if not provided
    const categoryName = name && name.trim() !== ''
      ? name.trim()
      : display_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

    console.log('📝 Processed category name:', categoryName)

    const category = await prisma.category.create({
      data: {
        name: categoryName,
        display_name: display_name.trim(),
        description: description || null,
        image_url: image_url || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true
      },
      include: {
        products: {
          where: { is_active: true },
          select: { id: true }
        }
      }
    })

    console.log('✅ Category created successfully:', category.id)

    const formattedCategory = {
      id: category.id,
      name: category.name,
      display_name: category.display_name,
      description: category.description || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
      product_count: category.products.length
    }

    res.status(201).json(formattedCategory)
  } catch (error) {
    console.error('❌ Error creating category:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A category with this name already exists' })
    }

    if (error.code === 'P2000') {
      return res.status(400).json({ error: 'Invalid data provided' })
    }

    res.status(500).json({
      error: 'Failed to create category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, display_name, description, image_url, sort_order, is_active } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        display_name,
        description,
        image_url,
        sort_order,
        is_active
      },
      include: {
        products: {
          where: { is_active: true },
          select: { id: true }
        }
      }
    })

    const formattedCategory = {
      id: category.id,
      name: category.name,
      display_name: category.display_name,
      description: category.description || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
      product_count: category.products.length
    }

    res.json(formattedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

export default router
