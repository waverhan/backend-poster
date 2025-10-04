export interface UntappdBeer {
  beer_id: number
  beer_name: string
  beer_description: string
  beer_abv: number
  beer_ibu: number
  beer_style: string
  brewery_name: string
  rating_score: number
  rating_count: number
  beer_label: string
}

export interface UntappdBeerInfo {
  beer_id: number
  beer_name: string
  beer_description: string
  beer_abv: number
  beer_ibu: number
  beer_style: string
  brewery_name: string
  rating_score: number
  rating_count: number
  beer_label: string
  created_at: string
}

export interface UntappdReview {
  checkin_id: number
  user_name: string
  user_avatar: string
  rating_score: number
  checkin_comment: string
  created_at: string
  beer_name: string
  brewery_name: string
}

export interface UntappdSearchResult {
  beers: UntappdBeer[]
  total_count: number
}

export interface ProductUntappdMapping {
  product_id: string
  untappd_beer_id: number
  untappd_url?: string
  last_synced: string
  auto_sync_enabled: boolean
}
