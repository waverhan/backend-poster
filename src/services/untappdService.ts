import type { UntappdBeer, UntappdReview, UntappdBeerInfo } from '@/types/untappd'

class UntappdService {
  private baseUrl = 'https://api.untappd.com/v4'
  private clientId = process.env.VITE_UNTAPPD_CLIENT_ID || ''
  private clientSecret = process.env.VITE_UNTAPPD_CLIENT_SECRET || ''

  // Get beer information by beer ID
  async getBeerInfo(beerId: string): Promise<UntappdBeerInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/beer/info/${beerId}?client_id=${this.clientId}&client_secret=${this.clientSecret}`
      )

      if (!response.ok) {
        console.error('Failed to fetch beer info from Untappd:', response.status)
        return null
      }

      const data = await response.json()
      
      if (data.response && data.response.beer) {
        const beer = data.response.beer
        return {
          beer_id: beer.bid,
          beer_name: beer.beer_name,
          beer_description: beer.beer_description,
          beer_abv: beer.beer_abv,
          beer_ibu: beer.beer_ibu,
          beer_style: beer.beer_style,
          brewery_name: beer.brewery?.brewery_name || '',
          rating_score: beer.rating_score,
          rating_count: beer.rating_count,
          beer_label: beer.beer_label,
          created_at: beer.created_at
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching beer info from Untappd:', error)
      return null
    }
  }

  // Get beer reviews/checkins by beer ID
  async getBeerReviews(beerId: string, limit: number = 25): Promise<UntappdReview[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/beer/checkins/${beerId}?client_id=${this.clientId}&client_secret=${this.clientSecret}&limit=${limit}`
      )

      if (!response.ok) {
        console.error('Failed to fetch beer reviews from Untappd:', response.status)
        return []
      }

      const data = await response.json()
      
      if (data.response && data.response.checkins && data.response.checkins.items) {
        return data.response.checkins.items
          .filter((checkin: any) => checkin.checkin_comment && checkin.checkin_comment.trim().length > 0)
          .map((checkin: any) => ({
            checkin_id: checkin.checkin_id,
            user_name: checkin.user?.first_name || 'Anonymous',
            user_avatar: checkin.user?.user_avatar || '',
            rating_score: checkin.rating_score,
            checkin_comment: checkin.checkin_comment,
            created_at: checkin.created_at,
            beer_name: checkin.beer?.beer_name || '',
            brewery_name: checkin.brewery?.brewery_name || ''
          }))
      }

      return []
    } catch (error) {
      console.error('Error fetching beer reviews from Untappd:', error)
      return []
    }
  }

  // Search for beer by name and brewery
  async searchBeer(beerName: string, breweryName?: string): Promise<UntappdBeer[]> {
    try {
      const query = breweryName ? `${beerName} ${breweryName}` : beerName
      const response = await fetch(
        `${this.baseUrl}/search/beer?q=${encodeURIComponent(query)}&client_id=${this.clientId}&client_secret=${this.clientSecret}`
      )

      if (!response.ok) {
        console.error('Failed to search beer on Untappd:', response.status)
        return []
      }

      const data = await response.json()
      
      if (data.response && data.response.beers && data.response.beers.items) {
        return data.response.beers.items.map((item: any) => ({
          beer_id: item.beer.bid,
          beer_name: item.beer.beer_name,
          beer_description: item.beer.beer_description,
          beer_abv: item.beer.beer_abv,
          beer_ibu: item.beer.beer_ibu,
          beer_style: item.beer.beer_style,
          brewery_name: item.brewery?.brewery_name || '',
          rating_score: item.beer.rating_score,
          rating_count: item.beer.rating_count,
          beer_label: item.beer.beer_label
        }))
      }

      return []
    } catch (error) {
      console.error('Error searching beer on Untappd:', error)
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

  // Check if API credentials are configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret)
  }

  // Get API usage info
  async getApiInfo(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/auth/authorize?client_id=${this.clientId}&client_secret=${this.clientSecret}`
      )

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking Untappd API info:', error)
      return null
    }
  }
}

export default new UntappdService()
