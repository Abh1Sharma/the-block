import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import { useVehicles } from '@/hooks/useVehicles'
import { VehicleCard } from '@/components/inventory/VehicleCard'
import { FilterSidebar } from '@/components/inventory/FilterSidebar'
import { InventoryToolbar } from '@/components/inventory/InventoryToolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { FilterState, SortKey } from '@/types/vehicle'
import { cn } from '@/lib/utils'

function buildFilters(searchParams: URLSearchParams): Partial<FilterState> {
  return {
    q: searchParams.get('q') ?? undefined,
    make: searchParams.getAll('make'),
    body_style: searchParams.getAll('body_style'),
    province: searchParams.getAll('province'),
    title_status: searchParams.getAll('title_status'),
    fuel_type: searchParams.getAll('fuel_type'),
    auction_status: searchParams.getAll('auction_status'),
    condition_min: parseFloat(searchParams.get('condition_min') ?? '1'),
    condition_max: parseFloat(searchParams.get('condition_max') ?? '5'),
    price_min: parseInt(searchParams.get('price_min') ?? '0'),
    price_max: parseInt(searchParams.get('price_max') ?? '200000'),
    sort: (searchParams.get('sort') as SortKey) ?? 'auction_asc',
    page: parseInt(searchParams.get('page') ?? '1'),
  }
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3 mt-4" />
      </div>
    </div>
  )
}

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filters = buildFilters(searchParams)
  const { data, isLoading, isFetching } = useVehicles(filters)

  const currentPage = filters.page ?? 1
  const totalPages = data?.totalPages ?? 1

  function setPage(p: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <FilterSidebar className="hidden lg:block w-56 flex-shrink-0" />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <InventoryToolbar
            total={data?.total ?? 0}
            isLoading={isLoading}
            view={view}
            onViewChange={setView}
          />

          {isLoading ? (
            <div className={cn(
              'grid gap-4',
              view === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1',
            )}>
              {Array.from({ length: 24 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : data?.vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No vehicles found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div
              className={cn(
                isFetching && 'opacity-70 transition-opacity',
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-3',
              )}
            >
              {data?.vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} layout={view} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => setPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}

              {totalPages > 7 && currentPage < totalPages && (
                <>
                  <span className="text-muted-foreground">…</span>
                  <Button variant="outline" size="sm" className="w-9" onClick={() => setPage(totalPages)}>
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
