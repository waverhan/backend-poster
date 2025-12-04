// Address Autocomplete Service for Kyiv
// Supports multiple providers: Google Places, OpenStreetMap, Local Database

export interface AddressSuggestion {
  id: string
  display_name: string
  street: string
  house_number?: string
  district?: string
  full_address: string
  coordinates?: {
    lat: number
    lng: number
  }
  source: 'google' | 'osm' | 'local'
}

export interface AddressAutocompleteOptions {
  provider: 'google' | 'osm' | 'local' | 'auto'
  limit?: number
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

class AddressAutocompleteService {
  private googleApiKey: string
  private kyivBounds = {
    north: 50.590798,
    south: 50.213273,
    east: 30.825272,
    west: 30.239258
  }

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  }

  // Main autocomplete method
  async searchAddresses(
    query: string,
    options: AddressAutocompleteOptions = { provider: 'auto', limit: 5 }
  ): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return []

    console.log('🔍 [AddressAutocompleteService] searchAddresses called')
    console.log('🔍 [AddressAutocompleteService] Query:', query)
    console.log('🔍 [AddressAutocompleteService] Options:', options)

    const results: AddressSuggestion[] = []

    try {
      // Auto mode: try multiple providers
      if (options.provider === 'auto') {
        console.log('🔍 [AddressAutocompleteService] Using AUTO mode - trying OSM first')

        // Try OpenStreetMap/Nominatim first
        const osmResults = await this.searchOpenStreetMap(query, options.limit || 5)
        console.log('🔍 [AddressAutocompleteService] OSM returned:', osmResults.length, 'results')
        results.push(...osmResults)

        // If OSM didn't return enough results, try local database
        if (results.length < (options.limit || 5)) {
          console.log('🔍 [AddressAutocompleteService] OSM results not enough, trying local database')
          const localResults = await this.searchLocalDatabase(query, (options.limit || 5) - results.length)
          console.log('🔍 [AddressAutocompleteService] Local DB returned:', localResults.length, 'results')
          results.push(...localResults)
        }

        // Only try Google if we still don't have enough results and API key is available
        if (results.length < (options.limit || 5) && this.googleApiKey) {
          console.log('🔍 [AddressAutocompleteService] Still not enough, trying Google')
          const googleResults = await this.searchGooglePlaces(query, (options.limit || 5) - results.length)
          console.log('🔍 [AddressAutocompleteService] Google returned:', googleResults.length, 'results')
          results.push(...googleResults)
        }
      } else {
        // Use specific provider
        switch (options.provider) {
          case 'google':
            return await this.searchGooglePlaces(query, options.limit)
          case 'osm':
            return await this.searchOpenStreetMap(query, options.limit)
          case 'local':
            return await this.searchLocalDatabase(query, options.limit)
        }
      }

      // Remove duplicates and sort by relevance
      return this.deduplicateAndSort(results, query).slice(0, options.limit || 5)
    } catch (error) {
      console.error('Address autocomplete error:', error)
      // Fallback to local database
      return await this.searchLocalDatabase(query, options.limit)
    }
  }

  // Google Places API with Ukrainian focus
  private async searchGooglePlaces(query: string, limit = 5): Promise<AddressSuggestion[]> {
    if (!this.googleApiKey) return []

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
      // Only add Kyiv if not already present in the query
      const searchQuery = query.toLowerCase().includes('київ') || query.toLowerCase().includes('kyiv')
        ? query
        : `${query}, Київ, Україна`
      url.searchParams.set('input', searchQuery)
      url.searchParams.set('key', this.googleApiKey)
      url.searchParams.set('language', 'uk')
      url.searchParams.set('components', 'country:ua')
      url.searchParams.set('location', '50.4501,30.5234') // Kyiv center
      url.searchParams.set('radius', '50000') // 50km radius
      url.searchParams.set('types', 'address')
      url.searchParams.set('strictbounds', 'true') // Strict bounds to Kyiv area

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.status !== 'OK') return []

      return data.predictions.slice(0, limit).map((prediction: any) => {
        const addressComponents = this.parseGoogleAddress(prediction.description)
        return {
          id: `google_${prediction.place_id}`,
          display_name: prediction.description,
          street: addressComponents.street,
          house_number: addressComponents.houseNumber,
          district: addressComponents.district,
          full_address: prediction.description,
          source: 'google' as const
        }
      })
    } catch (error) {
      console.error('Google Places API error:', error)
      return []
    }
  }

  // OpenStreetMap Nominatim API with Ukrainian focus
  private async searchOpenStreetMap(query: string, limit = 5): Promise<AddressSuggestion[]> {
    try {
      console.log('🔍 OSM Search - Input query:', query)

      // Normalize the query - remove common prefixes for better matching
      let normalizedQuery = query.trim()
        .replace(/^вул\.?\s*/i, '')
        .replace(/^вулиця\s*/i, '')
        .replace(/^просп\.?\s*/i, '')
        .replace(/^проспект\s*/i, '')
        .replace(/^бул\.?\s*/i, '')
        .replace(/^бульвар\s*/i, '')
        .replace(/^пл\.?\s*/i, '')
        .replace(/^площа\s*/i, '')

      console.log('🔍 OSM Search - Normalized query:', normalizedQuery)

      // Use single optimized query instead of multiple queries for better performance
      const searchQuery = normalizedQuery.includes('київ') || normalizedQuery.includes('kyiv')
        ? normalizedQuery
        : `${normalizedQuery}, Київ, Україна`

      console.log('🔍 OSM Search - Final search query:', searchQuery)

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      console.log('🔍 OSM Search - Backend URL:', backendUrl)

      // Use backend proxy for Nominatim (better reliability and no CORS issues)
      const response = await fetch(`${backendUrl}/api/geocoding/nominatim-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: limit * 2 // Get more results for better filtering
        })
      })

      console.log('🔍 OSM Search - Response status:', response.status)

      if (!response.ok) {
        console.warn('Nominatim proxy error:', response.status)
        return []
      }

      const allResults = await response.json()
      console.log('🔍 OSM Search - Results count:', allResults?.length || 0)

      if (!Array.isArray(allResults)) {
        console.warn('🔍 OSM Search - Results is not an array:', allResults)
        return []
      }

      // Deduplicate by osm_id
      const uniqueResults = allResults.filter((item, index, arr) =>
        arr.findIndex(other => other.osm_id === item.osm_id) === index
      )

      // Filter and prioritize residential addresses over businesses
      const filteredResults = uniqueResults
        .filter((item: any) => {
          // Accept more types for better coverage
          const isAddress = item.type === 'house' ||
                           item.type === 'building' ||
                           item.type === 'residential' ||
                           item.type === 'street' ||
                           item.type === 'road' ||
                           item.class === 'place' ||
                           item.class === 'building' ||
                           item.class === 'highway'

          const isBusiness = item.type === 'shop' ||
                           item.type === 'commercial' ||
                           item.class === 'shop'

          // Exclude MEDMAG specifically if we're looking for residential
          const isMedmag = item.display_name?.toLowerCase().includes('medmag')

          if (isMedmag && query.match(/\d+/)) {
            return false
          }

          return isAddress || !isBusiness
        })
        .slice(0, limit)

      return filteredResults.map((item: any) => {
        // Create Ukrainian address format
        const street = item.address?.road || item.address?.pedestrian || this.extractStreet(item.display_name)
        const houseNumber = item.address?.house_number
        const district = this.translateDistrict(item.address?.suburb || item.address?.city_district || item.address?.county)

        // Format display name in Ukrainian
        let ukrainianAddress = street
        if (houseNumber) {
          ukrainianAddress += `, ${houseNumber}`
        }
        ukrainianAddress += ', Київ'
        if (district) {
          ukrainianAddress += `, ${district}`
        }
        ukrainianAddress += ', Україна'

        return {
          id: `osm_${item.osm_id}`,
          display_name: ukrainianAddress,
          street: street,
          house_number: houseNumber,
          district: district,
          full_address: ukrainianAddress,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          },
          source: 'osm' as const
        }
      })
    } catch (error) {
      console.error('OpenStreetMap API error:', error)
      return []
    }
  }

  // Local database search (fallback) with house numbers
  private async searchLocalDatabase(query: string, limit = 5): Promise<AddressSuggestion[]> {
    try {
      // Import the enhanced search function
      const { searchKyivAddresses } = await import('@/data/kyivStreets')
      const results = searchKyivAddresses(query)

      return results.slice(0, limit).map((result, index) => ({
        id: `local_${index}`,
        display_name: result.fullAddress,
        street: result.street,
        house_number: result.houseNumber,
        district: result.district,
        full_address: result.fullAddress,
        source: 'local' as const
      }))
    } catch (error) {
      console.error('Failed to search local database:', error)
      // Fallback to simple search
      const kyivStreets = await this.getKyivStreets()
      const normalizedQuery = this.normalizeString(query)

      const matches = kyivStreets
        .filter(street => this.normalizeString(street).includes(normalizedQuery))
        .slice(0, limit)
        .map((street, index) => ({
          id: `local_fallback_${index}`,
          display_name: `${street}, Київ`,
          street,
          full_address: `${street}, Київ, Україна`,
          source: 'local' as const
        }))

      return matches
    }
  }

  // Get Kyiv streets database
  private async getKyivStreets(): Promise<string[]> {
    try {
      // Import the comprehensive Kyiv streets database
      const { kyivStreets, kyivMetroStations } = await import('@/data/kyivStreets')
      return [...kyivStreets, ...kyivMetroStations]
    } catch (error) {
      console.error('Failed to load Kyiv streets database:', error)
      // Fallback to basic streets
      return [
        'вул. Хрещатик',
        'вул. Володимирська',
        'вул. Саксаганського',
        'вул. Велика Васильківська',
        'вул. Антоновича',
        'вул. Лесі Українки',
        'просп. Перемоги',
        'просп. Науки',
        'пл. Незалежності'
      ]
    }
  }

  // Utility methods
  private extractStreet(fullAddress: string): string {
    // Extract street name from full address
    const parts = fullAddress.split(',')
    return parts[0]?.trim() || fullAddress
  }

  private parseGoogleAddress(fullAddress: string): {
    street: string
    houseNumber?: string
    district?: string
  } {
    // Parse Google address format: "вул. Хрещатик, 22, Київ, Україна"
    const parts = fullAddress.split(',').map(p => p.trim())

    let street = parts[0] || ''
    let houseNumber: string | undefined
    let district: string | undefined

    // Try to extract house number from first part
    const houseMatch = street.match(/^(.+?),?\s+(\d+[а-яё]?)$/i)
    if (houseMatch) {
      street = houseMatch[1].trim()
      houseNumber = houseMatch[2]
    } else {
      // Try to find house number in second part
      if (parts[1] && /^\d+[а-яё]?$/i.test(parts[1])) {
        houseNumber = parts[1]
      }
    }

    // Look for district information
    const districtPart = parts.find(part =>
      part.includes('район') ||
      part.includes('district') ||
      part.includes('Оболонський') ||
      part.includes('Печерський') ||
      part.includes('Шевченківський') ||
      part.includes('Подільський') ||
      part.includes('Солом\'янський') ||
      part.includes('Голосіївський') ||
      part.includes('Святошинський') ||
      part.includes('Деснянський') ||
      part.includes('Дніпровський') ||
      part.includes('Дарницький')
    )

    if (districtPart) {
      district = districtPart
    }

    return { street, houseNumber, district }
  }

  private translateDistrict(district?: string): string | undefined {
    if (!district) return undefined

    const districtMap: Record<string, string> = {
      'Obolon': 'Оболонський район',
      'Obolonsky': 'Оболонський район',
      'Obolonskyy': 'Оболонський район',
      'Pechersk': 'Печерський район',
      'Pecherskyy': 'Печерський район',
      'Shevchenko': 'Шевченківський район',
      'Shevchenkivsky': 'Шевченківський район',
      'Podil': 'Подільський район',
      'Podilsky': 'Подільський район',
      'Solomianskyi': 'Солом\'янський район',
      'Solomyanskyy': 'Солом\'янський район',
      'Holosiivsky': 'Голосіївський район',
      'Holosiivskyi': 'Голосіївський район',
      'Sviatoshynsky': 'Святошинський район',
      'Sviatoshynskyi': 'Святошинський район',
      'Desniansky': 'Деснянський район',
      'Desnianskyy': 'Деснянський район',
      'Dniprovskyi': 'Дніпровський район',
      'Dniprovsky': 'Дніпровський район',
      'Darnytsky': 'Дарницький район',
      'Darnytskyy': 'Дарницький район'
    }

    // Check if already in Ukrainian
    if (district.includes('район')) {
      return district
    }

    // Try to find translation
    const translated = districtMap[district]
    if (translated) {
      return translated
    }

    // Return as is if no translation found
    return district
  }

  private normalizeString(str: string): string {
    return str.toLowerCase()
      .replace(/ʼ/g, "'")
      .replace(/[ьъ]/g, '')
      .replace(/[её]/g, 'е')
      .replace(/[ії]/g, 'и')
      .trim()
  }

  private deduplicateAndSort(results: AddressSuggestion[], query: string): AddressSuggestion[] {
    // Remove duplicates based on similar addresses
    const unique = results.filter((item, index, arr) =>
      arr.findIndex(other =>
        this.normalizeString(other.street) === this.normalizeString(item.street)
      ) === index
    )

    // Sort by relevance (exact matches first, then by source priority)
    return unique.sort((a, b) => {
      const aExact = this.normalizeString(a.street).startsWith(this.normalizeString(query))
      const bExact = this.normalizeString(b.street).startsWith(this.normalizeString(query))

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // Prefer Google > OSM > Local
      const sourcePriority = { google: 3, osm: 2, local: 1 }
      return sourcePriority[b.source] - sourcePriority[a.source]
    })
  }

  // Validate if address is in Kyiv
  isInKyiv(coordinates: { lat: number, lng: number }): boolean {
    return coordinates.lat >= this.kyivBounds.south &&
           coordinates.lat <= this.kyivBounds.north &&
           coordinates.lng >= this.kyivBounds.west &&
           coordinates.lng <= this.kyivBounds.east
  }

  // Get detailed address information
  async getAddressDetails(suggestion: AddressSuggestion): Promise<AddressSuggestion> {
    if (suggestion.source === 'google' && this.googleApiKey) {
      // Get place details from Google
      try {
        const placeId = suggestion.id.replace('google_', '')
        const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
        url.searchParams.set('place_id', placeId)
        url.searchParams.set('key', this.googleApiKey)
        url.searchParams.set('language', 'uk')

        const response = await fetch(url.toString())
        const data = await response.json()

        if (data.status === 'OK') {
          const place = data.result
          return {
            ...suggestion,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            }
          }
        }
      } catch (error) {
        console.error('Google Place Details error:', error)
      }
    }

    return suggestion
  }
}

export const addressAutocomplete = new AddressAutocompleteService()
