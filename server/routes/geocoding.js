import express from 'express'
import axios from 'axios'

const router = express.Router()

// POST /api/geocoding/nominatim-search - Proxy for Nominatim search API
router.post('/nominatim-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    console.log(`🔍 Nominatim search proxy: "${query}"`)

    // Kyiv bounds
    const kyivBounds = {
      west: 30.239258,
      south: 50.213273,
      east: 30.825272,
      north: 50.590798
    }

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('countrycodes', 'ua')
    url.searchParams.set('bounded', '1')
    url.searchParams.set('viewbox', `${kyivBounds.west},${kyivBounds.south},${kyivBounds.east},${kyivBounds.north}`)
    url.searchParams.set('accept-language', 'uk,ru,en')
    url.searchParams.set('extratags', '1')
    url.searchParams.set('dedupe', '0')

    const response = await axios.get(url.toString(), {
      headers: {
        'User-Agent': 'PWA-POS-Shop/1.0 (https://opillia.com.ua)',
        'Accept-Language': 'uk,ru,en',
        'Accept': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    })

    console.log(`✅ Nominatim returned ${response.data.length} results`)

    res.json(response.data)

  } catch (error) {
    console.error('❌ Nominatim search error:', error.message)
    
    if (error.response) {
      // Nominatim returned an error
      res.status(error.response.status).json({
        error: 'Nominatim API error',
        message: error.response.data
      })
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      res.status(504).json({
        error: 'Request timeout',
        message: 'Nominatim API did not respond in time'
      })
    } else {
      // Other error
      res.status(500).json({
        error: 'Failed to search addresses',
        message: error.message
      })
    }
  }
})

export default router

