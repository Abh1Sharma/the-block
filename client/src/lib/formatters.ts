export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatOdometer(km: number): string {
  return `${new Intl.NumberFormat('en-CA').format(km)} km`
}

export function formatConditionGrade(grade: number): string {
  if (grade >= 4.5) return 'Excellent'
  if (grade >= 4.0) return 'Very Good'
  if (grade >= 3.5) return 'Good'
  if (grade >= 3.0) return 'Average'
  if (grade >= 2.5) return 'Fair'
  if (grade >= 2.0) return 'Below Average'
  if (grade >= 1.5) return 'Poor'
  return 'Salvage'
}

export function formatTitleStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatBodyStyle(style: string): string {
  const map: Record<string, string> = {
    sedan: 'Sedan',
    SUV: 'SUV',
    truck: 'Truck',
    coupe: 'Coupe',
    hatchback: 'Hatchback',
  }
  return map[style] ?? style
}

export function formatFuelType(fuel: string): string {
  const map: Record<string, string> = {
    gasoline: 'Gasoline',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    electric: 'Electric',
  }
  return map[fuel] ?? fuel
}
