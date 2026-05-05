import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getAuctionStatus, getTimeRemaining, type AuctionStatus } from '@/lib/auction'

interface Props {
  auctionStart: string
  onStatusChange?: (status: AuctionStatus) => void
}

export function AuctionTimer({ auctionStart, onStatusChange }: Props) {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(auctionStart))
  const [status, setStatus] = useState(() => getAuctionStatus(auctionStart))

  useEffect(() => {
    const tick = () => {
      const next = getAuctionStatus(auctionStart)
      setRemaining(getTimeRemaining(auctionStart))
      if (next !== status) {
        setStatus(next)
        onStatusChange?.(next)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [auctionStart, status, onStatusChange])

  if (status === 'ended') {
    return <p className="text-sm text-muted-foreground">Auction ended</p>
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm">
        <span className="text-muted-foreground">{status === 'live' ? 'Ends in ' : 'Starts in '}</span>
        <span className="font-semibold tabular-nums">{remaining}</span>
      </span>
    </div>
  )
}
