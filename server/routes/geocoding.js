import express from 'express'
import axios from 'axios'

const router = express.Router()

// POST /api/geocoding/photon-search - Proxy for Photon geocoding API (Komoot)
// Photon is faster and more reliable than Nominatim for autocomplete
router.post('/photon-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    

    // Kyiv bounds for filtering results
    const kyivBounds = {
      west: 30.239258,
      south: 50.213273,
      east: 30.825272,
      north: 50.590798
    }

    // Photon API endpoint
    const url = new URL('https://photon.komoot.io/api/')
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('lang', 'uk') // Ukrainian language
    // Bbox format: lon_min,lat_min,lon_max,lat_max
    url.searchParams.set('bbox', `${kyivBounds.west},${kyivBounds.south},${kyivBounds.east},${kyivBounds.north}`)
    url.searchParams.set('osm_tag', 'highway:*') // Focus on streets/roads

    const response = await axios.get(url.toString(), {
      headers: {
        'User-Agent': 'PWA-POS-Shop/1.0 (https://opillia.com.ua)',
        'Accept': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    })

    

    // Transform Photon GeoJSON format to simpler format
    const results = (response.data.features || []).map(feature => ({
      display_name: feature.properties.name || feature.properties.street || '',
      street: feature.properties.street || feature.properties.name || '',
      house_number: feature.properties.housenumber || '',
      city: feature.properties.city || 'Київ',
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      osm_type: feature.properties.osm_type,
      osm_id: feature.properties.osm_id,
      type: feature.properties.type
    }))

    res.json(results)

  } catch (error) {
    console.error('❌ Photon search error:', error.message)

    if (error.response) {
      res.status(error.response.status).json({
        error: 'Photon API error',
        message: error.response.data
      })
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Request timeout',
        message: 'Photon API did not respond in time'
      })
    } else {
      res.status(500).json({
        error: 'Failed to search addresses',
        message: error.message
      })
    }
  }
})

// POST /api/geocoding/nominatim-search - Proxy for Nominatim search API (fallback)
router.post('/nominatim-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    

    // Add "київ" to query if not already present for better results
    let searchQuery = query
    if (!query.toLowerCase().includes('київ') && !query.toLowerCase().includes('kyiv')) {
      searchQuery = `${query}, київ`
      
    }

    // Kyiv bounds
    const kyivBounds = {
      west: 30.239258,
      south: 50.213273,
      east: 30.825272,
      north: 50.590798
    }

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', searchQuery)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('countrycodes', 'ua')
    // Don't use bounded=1 as it's too restrictive - use viewbox for prioritization instead
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

