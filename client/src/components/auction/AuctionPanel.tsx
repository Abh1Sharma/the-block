import { Separator } from '@/components/ui/separator'
import type { Vehicle } from '@/types/vehicle'
import { getAuctionStatus } from '@/lib/auction'
import { AuctionStatusChip } from './AuctionStatusChip'
import { AuctionTimer } from './AuctionTimer'
import { BidStats } from './BidStats'
import { BidForm } from './BidForm'
import { BidHistory } from './BidHistory'

interface Props {
  vehicle: Vehicle
}

export function AuctionPanel({ vehicle }: Props) {
  const status = getAuctionStatus(vehicle.auction_start)

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <AuctionStatusChip status={status} />
        <span className="text-xs text-muted-foreground font-mono">{vehicle.lot}</span>
      </div>

      <BidStats vehicle={vehicle} />

      <AuctionTimer auctionStart={vehicle.auction_start} />

      <Separator />

      {status === 'live' ? (
        <BidForm vehicle={vehicle} />
      ) : status === 'upcoming' ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Bidding opens when the auction starts
        </p>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          This auction has closed
        </p>
      )}

      <BidHistory vehicleId={vehicle.id} auctionStart={vehicle.auction_start} />
    </div>
  )
}
