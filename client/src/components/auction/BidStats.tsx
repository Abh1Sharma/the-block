import { Gavel, ShieldCheck, ShieldX } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { formatCurrency } from '@/lib/formatters'
import { isReserveMet } from '@/lib/auction'

interface Props {
  vehicle: Vehicle
}

export function BidStats({ vehicle }: Props) {
  const reserveMet = isReserveMet(vehicle)

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground">
          {vehicle.current_bid !== null ? 'Current bid' : 'Starting bid'}
        </p>
        <p className="text-3xl font-bold font-price">
          {formatCurrency(vehicle.current_bid ?? vehicle.starting_bid)}
        </p>
        {vehicle.current_bid === null && (
          <p className="text-xs text-muted-foreground mt-0.5">No bids yet</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Gavel className="h-4 w-4" />
          <span>{vehicle.bid_count} bid{vehicle.bid_count !== 1 ? 's' : ''}</span>
        </div>

        {reserveMet === null && (
          <span className="text-xs text-muted-foreground">No reserve</span>
        )}
        {reserveMet === false && (
          <div className="flex items-center gap-1 text-amber-700">
            <ShieldX className="h-4 w-4" />
            <span className="text-xs font-medium">Reserve not met</span>
          </div>
        )}
        {reserveMet === true && (
          <div className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">Reserve met</span>
          </div>
        )}
      </div>
    </div>
  )
}
