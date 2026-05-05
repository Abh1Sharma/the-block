import { cn } from '@/lib/utils'
import type { AuctionStatus } from '@/lib/auction'

interface Props {
  status: AuctionStatus
  className?: string
}

export function AuctionStatusChip({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        status === 'live' && 'bg-red-500 text-white',
        status === 'upcoming' && 'bg-blue-100 text-blue-800',
        status === 'ended' && 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {status === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-slow" />
      )}
      {status === 'live' && 'LIVE'}
      {status === 'upcoming' && 'Upcoming'}
      {status === 'ended' && 'Ended'}
    </span>
  )
}
