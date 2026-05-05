import { Link } from 'react-router-dom'
import { MapPin, Gavel } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { getAuctionStatus } from '@/lib/auction'
import { formatCurrency, formatOdometer } from '@/lib/formatters'
import { AuctionStatusChip } from '@/components/auction/AuctionStatusChip'
import { ConditionGradeBar } from '@/components/vehicle/ConditionGradeBar'
import { cn } from '@/lib/utils'

interface Props {
  vehicle: Vehicle
  layout: 'grid' | 'list'
}

export function VehicleCard({ vehicle, layout }: Props) {
  const status = getAuctionStatus(vehicle.auction_start)
  const displayPrice = vehicle.current_bid ?? vehicle.starting_bid
  const hasActiveBid = vehicle.current_bid !== null

  if (layout === 'list') {
    return (
      <Link
        to={`/vehicles/${vehicle.id}`}
        className="flex gap-4 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
      >
        <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute left-1.5 top-1.5">
            <AuctionStatusChip status={status} />
          </div>
        </div>

        <div className="flex flex-1 min-w-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Lot {vehicle.lot}</p>
            <h3 className="font-semibold truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{vehicle.trim}</p>
            <div className="mt-1.5">
              <ConditionGradeBar grade={vehicle.condition_grade} size="sm" />
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-muted-foreground">{hasActiveBid ? 'Current bid' : 'Starting bid'}</p>
            <p className="text-lg font-bold font-price">{formatCurrency(displayPrice)}</p>
            <p className="text-xs text-muted-foreground">{formatOdometer(vehicle.odometer_km)}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-2 top-2">
          <AuctionStatusChip status={status} />
        </div>
        {vehicle.bid_count > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            <Gavel className="h-3 w-3" />
            {vehicle.bid_count}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Lot {vehicle.lot}</p>
          <h3 className="font-semibold leading-snug">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
        </div>

        <ConditionGradeBar grade={vehicle.condition_grade} size="sm" />

        <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', 'mt-auto')}>
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{vehicle.city}, {vehicle.province}</span>
        </div>

        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground">{hasActiveBid ? 'Current bid' : 'Starting bid'}</p>
          <p className="text-xl font-bold font-price">{formatCurrency(displayPrice)}</p>
        </div>
      </div>
    </Link>
  )
}
