import { useQuery } from '@tanstack/react-query'
import { fetchVehicles } from '@/lib/api'
import type { FilterState, VehiclesResponse } from '@/types/vehicle'

export function useVehicles(filters: Partial<FilterState>) {
  return useQuery<VehiclesResponse>({
    queryKey: ['vehicles', filters],
    queryFn: () => fetchVehicles(filters),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  })
}
