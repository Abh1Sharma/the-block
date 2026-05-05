import { useSearchParams } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const MAKES = ['BMW', 'Chevrolet', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Jeep', 'Kia', 'Mazda', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen']
const BODY_STYLES = ['sedan', 'SUV', 'truck', 'coupe', 'hatchback']
const PROVINCES = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Nova Scotia', 'Ontario', 'Quebec', 'Saskatchewan']
const TITLE_STATUSES = ['clean', 'rebuilt', 'salvage']
const FUEL_TYPES = ['gasoline', 'diesel', 'hybrid', 'electric']
const AUCTION_STATUSES = ['live', 'upcoming', 'ended']

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

interface CheckboxGroupProps {
  options: string[]
  paramKey: string
  labels?: Record<string, string>
}

function CheckboxGroup({ options, paramKey, labels }: CheckboxGroupProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = searchParams.getAll(paramKey)

  function toggle(value: string) {
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    if (selected.includes(value)) {
      const remaining = selected.filter((v) => v !== value)
      next.delete(paramKey)
      remaining.forEach((v) => next.append(paramKey, v))
    } else {
      next.append(paramKey, value)
    }
    setSearchParams(next)
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <div key={opt} className="flex items-center gap-2">
          <Checkbox
            id={`${paramKey}-${opt}`}
            checked={selected.includes(opt)}
            onCheckedChange={() => toggle(opt)}
          />
          <Label htmlFor={`${paramKey}-${opt}`} className="font-normal cursor-pointer">
            {labels?.[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1)}
          </Label>
        </div>
      ))}
    </div>
  )
}

export function FilterSidebar({ className }: { className?: string }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const conditionMin = parseFloat(searchParams.get('condition_min') ?? '1')
  const conditionMax = parseFloat(searchParams.get('condition_max') ?? '5')
  const priceMin = parseInt(searchParams.get('price_min') ?? '0')
  const priceMax = parseInt(searchParams.get('price_max') ?? '200000')

  const activeFilterCount =
    searchParams.getAll('make').length +
    searchParams.getAll('body_style').length +
    searchParams.getAll('province').length +
    searchParams.getAll('title_status').length +
    searchParams.getAll('fuel_type').length +
    searchParams.getAll('auction_status').length +
    (conditionMin !== 1 || conditionMax !== 5 ? 1 : 0) +
    (priceMin !== 0 || priceMax !== 200000 ? 1 : 0)

  function clearAll() {
    const next = new URLSearchParams()
    const q = searchParams.get('q')
    const sort = searchParams.get('sort')
    if (q) next.set('q', q)
    if (sort) next.set('sort', sort)
    setSearchParams(next)
  }

  function setRangeParam(key: string, value: number, defaultVal: number) {
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    if (value === defaultVal) next.delete(key)
    else next.set(key, String(value))
    setSearchParams(next)
  }

  return (
    <aside className={cn('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground">
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      <Separator />

      <FilterSection title="Status">
        <CheckboxGroup
          options={AUCTION_STATUSES}
          paramKey="auction_status"
          labels={{ live: 'Live now', upcoming: 'Upcoming', ended: 'Ended' }}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Make">
        <CheckboxGroup options={MAKES} paramKey="make" />
      </FilterSection>

      <Separator />

      <FilterSection title="Body Style">
        <CheckboxGroup
          options={BODY_STYLES}
          paramKey="body_style"
          labels={{ sedan: 'Sedan', SUV: 'SUV', truck: 'Truck', coupe: 'Coupe', hatchback: 'Hatchback' }}
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Condition Grade">
        <div className="px-1">
          <Slider
            min={1}
            max={5}
            step={0.5}
            value={[conditionMin, conditionMax]}
            onValueChange={([min, max]) => {
              setRangeParam('condition_min', min!, 1)
              setRangeParam('condition_max', max!, 5)
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{conditionMin.toFixed(1)}</span>
            <span>{conditionMax.toFixed(1)}</span>
          </div>
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Price Range">
        <div className="px-1">
          <Slider
            min={0}
            max={200000}
            step={2500}
            value={[priceMin, priceMax]}
            onValueChange={([min, max]) => {
              setRangeParam('price_min', min!, 0)
              setRangeParam('price_max', max!, 200000)
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(priceMin)}</span>
            <span>{priceMax >= 200000 ? 'Any' : formatCurrency(priceMax)}</span>
          </div>
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Fuel Type">
        <CheckboxGroup options={FUEL_TYPES} paramKey="fuel_type" />
      </FilterSection>

      <Separator />

      <FilterSection title="Province">
        <CheckboxGroup options={PROVINCES} paramKey="province" />
      </FilterSection>

      <Separator />

      <FilterSection title="Title Status">
        <CheckboxGroup options={TITLE_STATUSES} paramKey="title_status" />
      </FilterSection>
    </aside>
  )
}
