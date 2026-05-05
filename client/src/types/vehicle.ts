export interface Vehicle {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  body_style: 'sedan' | 'SUV' | 'truck' | 'coupe' | 'hatchback'
  exterior_color: string
  interior_color: string
  engine: string
  transmission: 'automatic' | 'manual' | 'CVT' | 'single-speed'
  drivetrain: 'FWD' | 'AWD' | 'RWD' | '4WD'
  odometer_km: number
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  condition_grade: number
  condition_report: string
  damage_notes: string[]
  title_status: 'clean' | 'salvage' | 'rebuilt'
  province: string
  city: string
  auction_start: string
  starting_bid: number
  reserve_price: number | null
  buy_now_price: number | null
  images: string[]
  selling_dealership: string
  lot: string
  current_bid: number | null
  bid_count: number
}

export interface VehiclesResponse {
  vehicles: Vehicle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FilterState {
  q: string
  make: string[]
  body_style: string[]
  province: string[]
  title_status: string[]
  fuel_type: string[]
  auction_status: string[]
  condition_min: number
  condition_max: number
  price_min: number
  price_max: number
  sort: SortKey
  page: number
}

export type SortKey =
  | 'auction_asc'
  | 'price_asc'
  | 'price_desc'
  | 'condition_desc'
  | 'condition_asc'
  | 'year_desc'
  | 'year_asc'
  | 'odometer_asc'
  | 'bids_desc'

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  make: [],
  body_style: [],
  province: [],
  title_status: [],
  fuel_type: [],
  auction_status: [],
  condition_min: 1,
  condition_max: 5,
  price_min: 0,
  price_max: 200000,
  sort: 'auction_asc',
  page: 1,
}
