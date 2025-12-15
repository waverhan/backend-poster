import express from 'express'
import discountService from '../services/discountService.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Get applicable discounts for order (public) - MUST BE BEFORE /:id route
router.post('/applicable', async (req, res) => {
  try {
    
    const { customerId, userId, subtotal, items } = req.body

    const orderData = {
      customerId,
      userId,
      subtotal,
      items
    }

    const applicable = await discountService.getApplicableDiscounts(orderData)
    
    res.json(applicable)
  } catch (error) {
    console.error('Error getting applicable discounts:', error)
    res.status(500).json({ error: 'Failed to get applicable discounts' })
  }
})

// Get enabled discounts (public)
router.get('/enabled', async (req, res) => {
  try {
    const discounts = await discountService.getEnabledDiscounts()
    res.json(discounts)
  } catch (error) {
    console.error('Error fetching enabled discounts:', error)
    res.status(500).json({ error: 'Failed to fetch discounts' })
  }
})

// Get all discounts (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const discounts = await discountService.getAllDiscounts()
    res.json(discounts)
  } catch (error) {
    console.error('Error fetching discounts:', error)
    res.status(500).json({ error: 'Failed to fetch discounts' })
  }
})

// Create discount (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    
    const discount = await discountService.createDiscount(req.body)
    res.status(201).json(discount)
  } catch (error) {
    console.error('Error creating discount:', error.message, error)
    res.status(500).json({ error: error.message || 'Failed to create discount' })
  }
})

// Update discount (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    
    const discount = await discountService.updateDiscount(req.params.id, req.body)
    res.json(discount)
  } catch (error) {
    console.error('Error updating discount:', error.message, error)
    res.status(500).json({ error: error.message || 'Failed to update discount' })
  }
})

// Delete discount (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await discountService.deleteDiscount(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting discount:', error)
    res.status(500).json({ error: 'Failed to delete discount' })
  }
})

export default router

