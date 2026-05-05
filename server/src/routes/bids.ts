import { Hono } from 'hono'
import { getVehicleById, placeBid } from '../store/vehicleStore.js'
import { getAuctionStatus, getMinimumBid } from '../lib/auctionUtils.js'

const bids = new Hono()

bids.post('/:id/bids', async (c) => {
  const vehicle = getVehicleById(c.req.param('id'))

  if (!vehicle) {
    return c.json({ error: 'Vehicle not found' }, 404)
  }

  const status = getAuctionStatus(vehicle.auction_start)
  if (status !== 'live') {
    return c.json({ error: 'This auction is not currently active' }, 400)
  }

  let body: { amount?: unknown; bidder?: unknown }
  try {
    body = await c.req.json<{ amount?: unknown; bidder?: unknown }>()
  } catch {
    return c.json({ error: 'Invalid request body' }, 400)
  }

  const amount = body.amount
  const bidder = typeof body.bidder === 'string' ? body.bidder : 'You'
  if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
    return c.json({ error: 'Bid amount must be a positive number' }, 400)
  }

  const minBid = getMinimumBid(vehicle.current_bid, vehicle.starting_bid)
  if (amount < minBid) {
    return c.json(
      { error: `Bid must be at least $${minBid.toLocaleString('en-CA')}`, minBid },
      400,
    )
  }

  if (vehicle.buy_now_price && amount >= vehicle.buy_now_price) {
    return c.json(
      { error: `Bid cannot meet or exceed the Buy Now price. Use Buy Now instead.` },
      400,
    )
  }

  const updated = placeBid(c.req.param('id'), amount, bidder)
  if (!updated) return c.json({ error: 'Failed to place bid' }, 500)

  return c.json(updated)
})

bids.post('/:id/buy-now', async (c) => {
  const vehicle = getVehicleById(c.req.param('id'))

  if (!vehicle) return c.json({ error: 'Vehicle not found' }, 404)
  if (!vehicle.buy_now_price) return c.json({ error: 'No Buy Now price available' }, 400)

  const status = getAuctionStatus(vehicle.auction_start)
  if (status !== 'live') return c.json({ error: 'Auction is not active' }, 400)

  const updated = placeBid(c.req.param('id'), vehicle.buy_now_price)
  if (!updated) return c.json({ error: 'Buy Now failed' }, 500)

  return c.json({ ...updated, bought_now: true })
})

export default bids
