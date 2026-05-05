import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types/vehicle'
import { formatCurrency } from '@/lib/formatters'
import { getAuctionStatus } from '@/lib/auction'
import { AuctionStatusChip } from '@/components/auction/AuctionStatusChip'
import { ConditionGradeBar } from './ConditionGradeBar'

interface Props {
  vehicleId: string
  make: string
}

export function RelatedVehicles({ vehicleId, make }: Props) {
  const { data: related } = useQuery<Vehicle[]>({
    queryKey: ['related', vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleId}/related`)
      return res.json() as Promise<Vehicle[]>
    },
    staleTime: 60_000,
  })

  if (!related || related.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">More {make} vehicles</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {related.map((v) => {
          const status = getAuctionStatus(v.auction_start)
          return (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="group rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={v.images[0]}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute left-1.5 top-1.5">
                  <AuctionStatusChip status={status} />
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium leading-snug truncate">
                  {v.year} {v.model} {v.trim}
                </p>
                <ConditionGradeBar grade={v.condition_grade} showLabel={false} size="sm" />
                <p className="text-sm font-bold tabular-nums">
                  {formatCurrency(v.current_bid ?? v.starting_bid)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
