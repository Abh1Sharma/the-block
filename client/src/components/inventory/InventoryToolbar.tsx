import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FilterSidebar } from './FilterSidebar'
import { ActiveFilterChips } from './ActiveFilterChips'
import type { SortKey } from '@/types/vehicle'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'auction_asc', label: 'Auction time' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'condition_desc', label: 'Best condition' },
  { value: 'year_desc', label: 'Newest first' },
  { value: 'odometer_asc', label: 'Lowest mileage' },
  { value: 'bids_desc', label: 'Most active' },
]

interface Props {
  total: number
  isLoading: boolean
  view: 'grid' | 'list'
  onViewChange: (v: 'grid' | 'list') => void
}

export function InventoryToolbar({ total, isLoading, view, onViewChange }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = (searchParams.get('sort') ?? 'auction_asc') as SortKey

  function setSort(value: SortKey) {
    const next = new URLSearchParams(searchParams)
    next.set('sort', value)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterSidebar />
          </SheetContent>
        </Sheet>

        <span className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${total.toLocaleString()} vehicles`}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-48 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden sm:flex rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9 rounded-r-none', view === 'grid' && 'bg-secondary')}
              onClick={() => onViewChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9 rounded-l-none border-l', view === 'list' && 'bg-secondary')}
              onClick={() => onViewChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ActiveFilterChips />
    </div>
  )
}
