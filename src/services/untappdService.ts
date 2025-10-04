import type { UntappdBeer, UntappdReview, UntappdBeerInfo } from '@/types/untappd'

class UntappdService {
  private backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

  // Get beer information by beer ID using web scraping
  async getBeerInfo(beerId: string): Promise<UntappdBeerInfo | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/untappd/beer/${beerId}`)

      if (!response.ok) {
        console.error('Failed to fetch beer info from backend:', response.status)
        return null
      }

      const data = await response.json()
      return data.beer || null
    } catch (error) {
      console.error('Error fetching beer info:', error)
      return null
    }
  }

  // Get beer reviews/checkins by beer ID using web scraping
  async getBeerReviews(beerId: string, limit: number = 25): Promise<UntappdReview[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/untappd/beer/${beerId}/reviews?limit=${limit}`)

      if (!response.ok) {
        console.error('Failed to fetch beer reviews from backend:', response.status)
        return []
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('Error fetching beer reviews:', error)
      return []
    }
  }

  // Search for beer by name and brewery using web scraping
  async searchBeer(beerName: string, breweryName?: string): Promise<UntappdBeer[]> {
    try {
      const query = breweryName ? `${beerName} ${breweryName}` : beerName
      const response = await fetch(`${this.backendUrl}/api/untappd/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        console.error('Failed to search beer on backend:', response.status)
        return []
      }

      const data = await response.json()
      return data.beers || []
    } catch (error) {
      console.error('Error searching beer:', error)
      return []
    }
  }

  // Get beer info by Untappd URL
  async getBeerInfoFromUrl(untappdUrl: string): Promise<UntappdBeerInfo | null> {
    try {
      // Extract beer ID from URL like https://untappd.com/b/opillya-opillia-korifej-nefiltrovane/6371222
      const match = untappdUrl.match(/\/b\/[^\/]+\/(\d+)/)
      if (!match) {
        console.error('Invalid Untappd URL format')
        return null
      }

      const beerId = match[1]
      return await this.getBeerInfo(beerId)
    } catch (error) {
      console.error('Error extracting beer ID from URL:', error)
      return null
    }
  }

  // Check if backend scraping service is available
  async isConfigured(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/untappd/status`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Get scraping service status
  async getServiceStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/untappd/status`)

      if (!response.ok) {
        return { available: false, error: 'Service unavailable' }
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking Untappd service status:', error)
      return { available: false, error: error.message }
    }
  }
}

export default new UntappdService()
