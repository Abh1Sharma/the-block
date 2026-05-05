export type AuctionStatus = 'upcoming' | 'live' | 'ended'

export const AUCTION_DURATION_HOURS = 24
export const MIN_BID_INCREMENT = 250

export function getAuctionStatus(auctionStart: string): AuctionStatus {
  const start = new Date(auctionStart).getTime()
  const now = Date.now()
  const end = start + AUCTION_DURATION_HOURS * 60 * 60 * 1000

  if (now < start) return 'upcoming'
  if (now < end) return 'live'
  return 'ended'
}

export function getTimeRemaining(auctionStart: string): string {
  const status = getAuctionStatus(auctionStart)
  const start = new Date(auctionStart).getTime()
  const now = Date.now()

  if (status === 'upcoming') {
    return formatDuration(start - now)
  }
  if (status === 'live') {
    const end = start + AUCTION_DURATION_HOURS * 60 * 60 * 1000
    return formatDuration(end - now)
  }
  return 'Ended'
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s'

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function getMinimumBid(currentBid: number | null, startingBid: number): number {
  if (currentBid === null) return startingBid
  return currentBid + MIN_BID_INCREMENT
}

export function getQuickBidOptions(minBid: number): number[] {
  return [
    minBid,
    Math.round((minBid + 250) / 250) * 250,
    Math.round((minBid + 750) / 250) * 250,
    Math.round((minBid + 2250) / 250) * 250,
  ]
}

export function isReserveMet(vehicle: {
  reserve_price: number | null
  current_bid: number | null
}): boolean | null {
  if (vehicle.reserve_price === null) return null // no reserve
  if (vehicle.current_bid === null) return false
  return vehicle.current_bid >= vehicle.reserve_price
}
