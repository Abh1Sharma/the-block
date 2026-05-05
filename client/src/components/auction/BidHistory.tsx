import { useQuery } from '@tanstack/react-query'
import { Gavel } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { getAuctionStatus } from '@/lib/auction'

interface BidEvent {
  amount: number
  timestamp: string
  bidder: string
}

interface Props {
  vehicleId: string
  auctionStart: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export function BidHistory({ vehicleId, auctionStart }: Props) {
  const isLive = getAuctionStatus(auctionStart) === 'live'

  const { data: bids } = useQuery<BidEvent[]>({
    queryKey: ['bids', vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/bids`)
      return res.json() as Promise<BidEvent[]>
    },
    refetchInterval: isLive ? 5_000 : false,
    staleTime: 5_000,
  })

  if (!bids || bids.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Recent bids
      </p>
      <div className="space-y-1.5">
        {bids.slice(0, 5).map((bid, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gavel className="h-3 w-3 flex-shrink-0" />
              <span>{bid.bidder === 'You' ? <span className="text-primary font-medium">You</span> : bid.bidder}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium tabular-nums">{formatCurrency(bid.amount)}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(bid.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
