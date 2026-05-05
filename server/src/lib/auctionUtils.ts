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

export function getMinimumBid(currentBid: number | null, startingBid: number): number {
  if (currentBid === null) return startingBid
  return currentBid + MIN_BID_INCREMENT
}
