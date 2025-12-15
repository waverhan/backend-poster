import express from 'express'
import { getCategories, createCategory } from '../services/database.js'
import { prisma } from '../index.js'

const router = express.Router()

// Helper function to transliterate Cyrillic to Latin characters
function transliterateCyrillic(text) {
  const cyrillic = {
    // Ukrainian and Russian lowercase
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    // Ukrainian-specific lowercase
    'ґ': 'g', 'є': 'ye', 'і': 'i', 'ї': 'yi',
    // Ukrainian and Russian uppercase
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya',
    // Ukrainian-specific uppercase
    'Ґ': 'G', 'Є': 'Ye', 'І': 'I', 'Ї': 'Yi'
  }

  return text
    .split('')
    .map(char => cyrillic[char] || char)
    .join('')
}

// Helper function to generate slug
function generateSlug(text) {
  if (!text) return ''
  return transliterateCyrillic(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    

    const categories = await getCategories(includeInactive)

    
    if (categories.length === 0) {
      console.warn('⚠️ WARNING: No categories found in database!')
      console.warn('⚠️ Check if categories are synced and marked as is_active: true')
    }

    res.json(categories)
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/categories/debug/count - Debug endpoint to check category count
router.get('/debug/count', async (req, res) => {
  try {
    const totalCount = await prisma.category.count()
    const activeCount = await prisma.category.count({ where: { is_active: true } })
    const inactiveCount = await prisma.category.count({ where: { is_active: false } })

    const allCategories = await prisma.category.findMany({
      select: { id: true, name: true, display_name: true, is_active: true, sort_order: true }
    })

    
    
    
    
    

    res.json({
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      categories: allCategories
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    res.status(500).json({ error: 'Debug failed', message: error.message })
  }
})

// POST /api/categories/generate-slugs - Generate missing slugs
router.post('/generate-slugs', async (req, res) => {
  try {
    

    // Get all categories
    const categories = await prisma.category.findMany()

    

    let updated = 0
    for (const category of categories) {
      const slug = generateSlug(category.display_name)
      if (slug && (!category.slug || category.slug === '')) {
        await prisma.category.update({
          where: { id: category.id },
          data: { slug }
        })
        
        updated++
      }
    }

    res.json({
      message: `Generated ${updated} slugs`,
      updated,
      total: categories.length
    })
  } catch (error) {
    console.error('❌ Error generating slugs:', error)
    res.status(500).json({ error: 'Failed to generate slugs' })
  }
})

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const {
      name,
      display_name,
      description,
      image_url,
      sort_order,
      is_active,
      seo_title,
      seo_meta_description,
      seo_content
    } = req.body

    // Validation
    if (!display_name || display_name.trim() === '') {
      console.error('❌ Validation error: display_name is required')
      return res.status(400).json({ error: 'Display name is required' })
    }

    // Auto-generate name if not provided
    const categoryName = name && name.trim() !== ''
      ? name.trim()
      : display_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

    // Generate slug from display_name
    const slug = generateSlug(display_name)

    const category = await prisma.category.create({
      data: {
        name: categoryName,
        display_name: display_name.trim(),
        slug: slug || null,
        description: description || null,
        seo_title: seo_title || null,
        seo_meta_description: seo_meta_description || null,
        seo_content: seo_content || null,
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

    

    const formattedCategory = {
      id: category.id,
      name: category.name,
      display_name: category.display_name,
      slug: category.slug,
      description: category.description || '',
      seo_title: category.seo_title || '',
      seo_meta_description: category.seo_meta_description || '',
      seo_content: category.seo_content || '',
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
    

    const {
      name,
      display_name,
      description,
      image_url,
      sort_order,
      is_active,
      seo_title,
      seo_meta_description,
      seo_content
    } = req.body

    

    // First check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      console.error(`❌ Category not found: ${id}`)
      return res.status(404).json({ error: 'Category not found' })
    }

    // Prepare update data, filtering out undefined values and validating types
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (display_name !== undefined) {
      updateData.display_name = display_name
      // Generate new slug when display_name changes
      const newSlug = generateSlug(display_name)
      // Only update slug if it's different from current slug to avoid unique constraint issues
      if (newSlug && newSlug !== existingCategory.slug) {
        updateData.slug = newSlug
      }
    }
    if (description !== undefined) updateData.description = description
    if (seo_title !== undefined) updateData.seo_title = seo_title
    if (seo_meta_description !== undefined) updateData.seo_meta_description = seo_meta_description
    if (seo_content !== undefined) updateData.seo_content = seo_content
    if (image_url !== undefined) updateData.image_url = image_url
    if (sort_order !== undefined) {
      // Ensure sort_order is a number
      let sortOrderNum
      if (typeof sort_order === 'number') {
        sortOrderNum = sort_order
      } else {
        sortOrderNum = parseInt(sort_order, 10)
        if (isNaN(sortOrderNum)) {
          console.error(`❌ Invalid sort_order value: ${sort_order}`)
          return res.status(400).json({ error: 'sort_order must be a valid number' })
        }
      }
      updateData.sort_order = sortOrderNum
    }
    if (is_active !== undefined) updateData.is_active = is_active

    

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
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
      slug: category.slug,
      description: category.description || '',
      seo_title: category.seo_title || '',
      seo_meta_description: category.seo_meta_description || '',
      seo_content: category.seo_content || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
      product_count: category.products.length
    }

    
    
    res.json(formattedCategory)
  } catch (error) {
    console.error('❌ Error updating category:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    console.error('❌ Request details:', {
      params: req.params,
      body: req.body,
      headers: req.headers
    })

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      console.error(`❌ Unique constraint violation on field: ${field}`)
      return res.status(400).json({
        error: `A category with this ${field} already exists`,
        field: field
      })
    }

    if (error.code === 'P2000') {
      return res.status(400).json({ error: 'Invalid data provided' })
    }

    res.status(500).json({
      error: 'Failed to update category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    })
  }
})

export default router
