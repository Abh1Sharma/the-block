import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { AUCTION_DURATION_HOURS } from '../lib/auctionUtils.js'

export interface Vehicle {
  id: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  body_style: string
  exterior_color: string
  interior_color: string
  engine: string
  transmission: string
  drivetrain: string
  odometer_km: number
  fuel_type: string
  condition_grade: number
  condition_report: string
  damage_notes: string[]
  title_status: string
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

function findVehiclesJson(): string {
  const candidates = [
    resolve(process.cwd(), 'data/vehicles.json'),
    resolve(process.cwd(), '../data/vehicles.json'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  throw new Error(`Cannot locate data/vehicles.json. CWD: ${process.cwd()}`)
}

const raw = readFileSync(findVehiclesJson(), 'utf-8')
const seedData = JSON.parse(raw) as Vehicle[]

let vehicles: Vehicle[] = normalizeAuctionTimes(seedData)

function normalizeAuctionTimes(input: Vehicle[]): Vehicle[] {
  const now = Date.now()
  return input.map((v, i) => {
    const bucket = i % 3
    let offsetMs: number

    if (bucket === 0) {
      // LIVE: started 2–13h ago (within 24h window)
      const hoursAgo = 2 + (i % 12)
      offsetMs = -hoursAgo * 60 * 60 * 1000
    } else if (bucket === 1) {
      // UPCOMING: starts in 1–47h
      const hoursAhead = 1 + (i % 46)
      offsetMs = hoursAhead * 60 * 60 * 1000
    } else {
      // ENDED: started 25–71h ago
      const hoursAgo = 25 + (i % 46)
      offsetMs = -hoursAgo * 60 * 60 * 1000
    }

    return { ...v, auction_start: new Date(now + offsetMs).toISOString() }
  })
}

function getLiveVehicles(): Vehicle[] {
  const now = Date.now()
  return vehicles.filter((v) => {
    const start = new Date(v.auction_start).getTime()
    const end = start + AUCTION_DURATION_HOURS * 60 * 60 * 1000
    return now >= start && now < end
  })
}

export interface BidEvent {
  amount: number
  timestamp: string
  bidder: string
}

// Bid history keyed by vehicle id — last 20 bids per vehicle
const bidHistory = new Map<string, BidEvent[]>()

function randomBidder(): string {
  const prefixes = ['Buyer', 'Bidder', 'User', 'Dealer']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]!
  return `${prefix}#${Math.floor(1000 + Math.random() * 9000)}`
}

export function getAllVehicles(): Vehicle[] {
  return vehicles
}

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id)
}

export function getRelatedVehicles(id: string, limit = 4): Vehicle[] {
  const vehicle = getVehicleById(id)
  if (!vehicle) return []
  return vehicles
    .filter((v) => v.id !== id && v.make === vehicle.make)
    .slice(0, limit)
}

export function getBidHistory(id: string): BidEvent[] {
  return bidHistory.get(id) ?? []
}

export function placeBid(id: string, amount: number, bidder?: string): Vehicle | null {
  const idx = vehicles.findIndex((v) => v.id === id)
  if (idx === -1) return null

  const updated: Vehicle = {
    ...vehicles[idx],
    current_bid: amount,
    bid_count: vehicles[idx].bid_count + 1,
  }
  vehicles[idx] = updated

  // Record bid event
  const history = bidHistory.get(id) ?? []
  history.unshift({ amount, timestamp: new Date().toISOString(), bidder: bidder ?? randomBidder() })
  bidHistory.set(id, history.slice(0, 20))

  return updated
}

// Simulates competing bids on live vehicles to make the demo feel alive
export function runCompetingBidSimulation(): void {
  const INCREMENTS = [250, 500, 750, 1000]
  const BID_PROBABILITY = 0.10 // 10% chance per live vehicle per tick

  setInterval(() => {
    const live = getLiveVehicles()
    live.forEach((vehicle) => {
      if (Math.random() > BID_PROBABILITY) return

      const currentBid = vehicle.current_bid ?? vehicle.starting_bid
      const increment = INCREMENTS[Math.floor(Math.random() * INCREMENTS.length)]!
      const newBid = Math.round((currentBid + increment) / 250) * 250

      // Don't exceed buy_now_price if set
      if (vehicle.buy_now_price && newBid >= vehicle.buy_now_price) return

      placeBid(vehicle.id, newBid)
    })
  }, 3000)
}
