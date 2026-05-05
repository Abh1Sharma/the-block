import { Hono } from 'hono'
import { getAllVehicles, getVehicleById, getRelatedVehicles, getBidHistory, type Vehicle } from '../store/vehicleStore.js'
import { getAuctionStatus } from '../lib/auctionUtils.js'

const vehicles = new Hono()

vehicles.get('/', (c) => {
  let result = getAllVehicles()

  const q = c.req.query('q')
  const make = c.req.queries('make') ?? []
  const bodyStyle = c.req.queries('body_style') ?? []
  const province = c.req.queries('province') ?? []
  const titleStatus = c.req.queries('title_status') ?? []
  const fuelType = c.req.queries('fuel_type') ?? []
  const auctionStatuses = c.req.queries('auction_status') ?? []
  const conditionMin = parseFloat(c.req.query('condition_min') ?? '1')
  const conditionMax = parseFloat(c.req.query('condition_max') ?? '5')
  const priceMin = parseInt(c.req.query('price_min') ?? '0')
  const priceMax = parseInt(c.req.query('price_max') ?? '9999999')
  const sort = c.req.query('sort') ?? 'auction_asc'
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'))
  const limit = Math.min(48, Math.max(1, parseInt(c.req.query('limit') ?? '24')))

  if (q) {
    const lower = q.toLowerCase()
    result = result.filter(
      (v) =>
        v.make.toLowerCase().includes(lower) ||
        v.model.toLowerCase().includes(lower) ||
        v.trim.toLowerCase().includes(lower) ||
        v.vin.toLowerCase().includes(lower) ||
        String(v.year).includes(lower) ||
        v.selling_dealership.toLowerCase().includes(lower),
    )
  }

  if (make.length) result = result.filter((v) => make.includes(v.make))
  if (bodyStyle.length) result = result.filter((v) => bodyStyle.includes(v.body_style))
  if (province.length) result = result.filter((v) => province.includes(v.province))
  if (titleStatus.length) result = result.filter((v) => titleStatus.includes(v.title_status))
  if (fuelType.length) result = result.filter((v) => fuelType.includes(v.fuel_type))

  result = result.filter(
    (v) => v.condition_grade >= conditionMin && v.condition_grade <= conditionMax,
  )

  result = result.filter((v) => {
    const price = v.current_bid ?? v.starting_bid
    return price >= priceMin && price <= priceMax
  })

  if (auctionStatuses.length) {
    result = result.filter((v) => auctionStatuses.includes(getAuctionStatus(v.auction_start)))
  }

  result = sortVehicles(result, sort)

  const total = result.length
  const paginated = result.slice((page - 1) * limit, page * limit)

  return c.json({ vehicles: paginated, total, page, limit, totalPages: Math.ceil(total / limit) })
})

vehicles.get('/:id', (c) => {
  const vehicle = getVehicleById(c.req.param('id'))
  if (!vehicle) return c.json({ error: 'Vehicle not found' }, 404)
  return c.json(vehicle)
})

vehicles.get('/:id/related', (c) => {
  const related = getRelatedVehicles(c.req.param('id'))
  return c.json(related)
})

vehicles.get('/:id/bids', (c) => {
  const vehicle = getVehicleById(c.req.param('id'))
  if (!vehicle) return c.json({ error: 'Vehicle not found' }, 404)
  return c.json(getBidHistory(c.req.param('id')))
})

function sortVehicles(list: Vehicle[], sort: string): Vehicle[] {
  const s = [...list]
  const price = (v: Vehicle) => v.current_bid ?? v.starting_bid

  switch (sort) {
    case 'price_asc':
      return s.sort((a, b) => price(a) - price(b))
    case 'price_desc':
      return s.sort((a, b) => price(b) - price(a))
    case 'condition_desc':
      return s.sort((a, b) => b.condition_grade - a.condition_grade)
    case 'condition_asc':
      return s.sort((a, b) => a.condition_grade - b.condition_grade)
    case 'year_desc':
      return s.sort((a, b) => b.year - a.year)
    case 'year_asc':
      return s.sort((a, b) => a.year - b.year)
    case 'odometer_asc':
      return s.sort((a, b) => a.odometer_km - b.odometer_km)
    case 'bids_desc':
      return s.sort((a, b) => b.bid_count - a.bid_count)
    case 'auction_asc':
    default:
      return s.sort(
        (a, b) => new Date(a.auction_start).getTime() - new Date(b.auction_start).getTime(),
      )
  }
}

export default vehicles
