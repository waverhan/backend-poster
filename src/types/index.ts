// Core Types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: Address
  role?: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  state?: string
  postal_code?: string
  country: string
  latitude?: number
  longitude?: number
}

export interface Coordinates {
  latitude: number
  longitude: number
}

// Branch/Store Types
export interface Branch {
  id: string
  poster_id?: string
  name: string
  address: string
  phone?: string
  email?: string
  latitude: number
  longitude: number
  delivery_available: boolean
  pickup_available: boolean
  operating_hours?: OperatingHours
  distance_km?: number
  delivery_fee?: number
  created_at?: string
  updated_at?: string
}

export interface OperatingHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string // "09:00"
  close: string // "22:00"
  closed: boolean
}

// Product Types
export interface Category {
  id: string
  poster_category_id?: string
  name: string
  display_name: string
  description?: string
  image_url?: string
  sort_order?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  product_count?: number
}

export interface ProductAttribute {
  name: string
  value: string
  unit?: string
  color?: string // For visual indicators like red bars
}

export interface Product {
  id: string
  poster_product_id?: string
  category_id: string
  name: string
  display_name: string
  description?: string
  price: number
  original_price?: number
  image_url?: string
  display_image_url?: string
  unit?: string // 'pcs', 'kg', 'г', etc.
  min_quantity?: number
  max_quantity?: number
  is_active: boolean
  available: boolean
  requires_bottles: boolean
  attributes?: ProductAttribute[] // Product attributes like alcohol%, IBU, density
  // Custom quantity system for weight-based products
  custom_quantity?: number | null // Custom selling quantity (e.g., 0.05 for 50g, 0.5 for 500ml)
  custom_unit?: string // Display unit (e.g., "г", "мл", "шт")
  quantity_step?: number | null // Step for quantity increase (e.g., 0.5 for beer, 0.05 for snacks)
  branch_id?: string
  category?: Category
  created_at?: string
  updated_at?: string
}

// Bottle Types
export interface BottleSize {
  size: string // '2L', '1.5L', '1L', '0.5L'
  price: number // Price per bottle in UAH
  quantity: number // Number of bottles selected
}

export interface BottleSelection {
  [key: string]: number // bottle size -> quantity
}

// Cart Types
export interface CartItem {
  cart_item_id?: string // Unique identifier for cart item (for items with same product_id but different bottles)
  product_id: string
  poster_product_id?: string
  name: string
  price: number
  quantity: number
  image_url?: string
  max_quantity?: number
  subtotal?: number
  unit?: string // 'pcs', 'kg', 'г', etc.
  // Custom quantity system for weight-based products
  custom_quantity?: number | null // Custom selling quantity (e.g., 0.05 for 50g)
  custom_unit?: string // Display unit (e.g., "г", "мл", "шт")
  quantity_step?: number | null // Step for quantity increase/decrease
  // Bottle selection for draft beverages
  bottles?: BottleSelection
  bottle_cost?: number
  is_draft_beverage?: boolean
  // For inventory validation
  original_quantity?: number // Original quantity before adjustment
}

export interface Cart {
  items: CartItem[]
  total_items: number
  subtotal: number
  delivery_fee: number
  total: number
  branch_id?: string
  delivery_method?: FulfillmentType
}

// Order Types
export type FulfillmentType = 'delivery' | 'pickup'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  poster_order_id?: string
  user_id?: string
  branch_id: string
  branch?: Branch
  fulfillment_type: FulfillmentType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address?: Address
  pickup_time?: string
  estimated_delivery_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  poster_product_id?: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image_url?: string
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  action?: NotificationAction
  created_at: string
  read?: boolean
}

export interface NotificationAction {
  label: string
  handler: () => void
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  per_page: number
  last_page: number
}

// Poster API Types
export interface PosterSpot {
  spot_id: string
  spot_name: string
  spot_address: string
  spot_phone?: string
  spot_latitude?: string
  spot_longitude?: string
}

export interface PosterCategory {
  category_id: string
  category_name: string
  category_color?: string
  sort_order?: number
  fiscal?: string
}

export interface PosterProduct {
  product_id: string
  category_id: string
  product_name: string
  product_price: string
  product_photo?: string
  product_photo_origin?: string
  ingredients?: string
  fiscal?: string
  out?: string
  workshop?: string
  nodiscount?: string
  barcodes?: string[]
  modifications?: PosterModification[]
}

export interface PosterModification {
  modificator_id: string
  modificator_name: string
  modificator_price: string
  modificator_selfprice?: string
  spots?: string[]
}

export interface PosterStorage {
  storage_id: string
  storage_name: string
  spot_id: string
  storage_type: string
}

export interface PosterInventoryItem {
  ingredient_id: string
  ingredient_name: string
  storage_id: string
  storage_ingredient_left: string
  ingredient_left: string
  ingredient_unit: string // 'pcs', 'kg', 'г', etc.
  cost_netto?: string
  cost_brutto?: string
  cost_avg?: string
  date?: string
}

// Location Types
export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  address?: string
  timestamp: number
}

// Network Types
export interface NetworkStatus {
  connected: boolean
  connectionType: string
}

// Loading States
export interface LoadingState {
  global: boolean
  branches: boolean
  products: boolean
  categories: boolean
  cart: boolean
  orders: boolean
  auth: boolean
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
  terms_accepted: boolean
}

export interface CheckoutForm {
  fulfillment_type: FulfillmentType
  branch_id: string
  delivery_address?: Address
  pickup_time?: string
  notes?: string
  payment_method?: string
}

// Delivery Pricing
export interface DeliveryPricing {
  base_fee: number // 99 UAH
  base_distance_km: number // 2 km
  extra_fee_per_km: number // 30 UAH
  free_delivery_threshold?: number
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Review Types
export interface Review {
  id: string
  order_id: string
  customer_name: string
  customer_email: string
  rating: number
  title: string
  comment: string
  images?: string[]
  helpful_votes: number
  created_at: string
  updated_at: string
}

// Site Configuration Types
export interface SiteConfig {
  id: string
  // Branding
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string

  // SEO
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_image_url: string

  // Homepage
  homepage_type: 'landing' | 'shop' // New option for homepage type
  hero_title: string
  hero_subtitle: string
  hero_banner_url: string
  hero_cta_text: string

  // Contact & Footer
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  company_website: string

  // Social Media
  facebook_url?: string
  instagram_url?: string
  telegram_url?: string
  viber_url?: string

  // Business Settings
  currency: string
  timezone: string
  language: string
  min_order_amount: number

  // Delivery Pricing
  delivery_base_fee: number // Base delivery fee (e.g., 99 UAH)
  delivery_base_distance_km: number // Base distance included (e.g., 2 km)
  delivery_extra_fee_per_km: number // Extra fee per km beyond base (e.g., 30 UAH)
  free_delivery_threshold: number // Free delivery above this amount

  // Features
  enable_reviews: boolean
  enable_ai_chat: boolean
  enable_recommendations: boolean
  enable_notifications: boolean
  enable_dark_mode: boolean

  // Payment Settings
  enable_online_payment: boolean
  wayforpay_merchant_account: string
  wayforpay_merchant_secret: string
  wayforpay_merchant_domain: string
  wayforpay_test_mode: boolean

  // Theme
  primary_color: string
  secondary_color: string
  accent_color: string

  created_at: string
  updated_at: string
}
