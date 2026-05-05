import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

const ARRAY_PARAMS = ['make', 'body_style', 'province', 'title_status', 'fuel_type', 'auction_status'] as const

const LABELS: Record<string, Record<string, string>> = {
  auction_status: { live: 'Live now', upcoming: 'Upcoming', ended: 'Ended' },
  body_style: { SUV: 'SUV', sedan: 'Sedan', truck: 'Truck', coupe: 'Coupe', hatchback: 'Hatchback' },
}

export function ActiveFilterChips() {
  const [searchParams, setSearchParams] = useSearchParams()

  const chips: { key: string; value: string; label: string }[] = []

  for (const key of ARRAY_PARAMS) {
    for (const val of searchParams.getAll(key)) {
      chips.push({ key, value: val, label: LABELS[key]?.[val] ?? val })
    }
  }

  const conditionMin = parseFloat(searchParams.get('condition_min') ?? '1')
  const conditionMax = parseFloat(searchParams.get('condition_max') ?? '5')
  if (conditionMin !== 1 || conditionMax !== 5) {
    chips.push({ key: 'condition', value: 'range', label: `Condition ${conditionMin}–${conditionMax}` })
  }

  const priceMin = parseInt(searchParams.get('price_min') ?? '0')
  const priceMax = parseInt(searchParams.get('price_max') ?? '200000')
  if (priceMin !== 0 || priceMax !== 200000) {
    chips.push({ key: 'price', value: 'range', label: `${formatCurrency(priceMin)}–${priceMax >= 200000 ? 'Any' : formatCurrency(priceMax)}` })
  }

  if (chips.length === 0) return null

  function remove(chip: { key: string; value: string }) {
    const next = new URLSearchParams(searchParams)
    next.delete('page')

    if (chip.key === 'condition') {
      next.delete('condition_min')
      next.delete('condition_max')
    } else if (chip.key === 'price') {
      next.delete('price_min')
      next.delete('price_max')
    } else {
      const vals = next.getAll(chip.key).filter((v) => v !== chip.value)
      next.delete(chip.key)
      vals.forEach((v) => next.append(chip.key, v))
    }

    setSearchParams(next)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          onClick={() => remove(chip)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  )
}
