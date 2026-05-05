import { useQuery } from '@tanstack/react-query'
import { fetchVehicle } from '@/lib/api'
import type { Vehicle } from '@/types/vehicle'
import { getAuctionStatus } from '@/lib/auction'

export function useVehicle(id: string) {
  return useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicle(id),
    staleTime: 5_000,
    // Poll every 5s for live auctions — the server is simulating competing bids
    refetchInterval: (query) => {
      if (!query.state.data) return false
      return getAuctionStatus(query.state.data.auction_start) === 'live' ? 5_000 : false
    },
  })
}
