import type { Vehicle, VehiclesResponse, FilterState } from '@/types/vehicle'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function buildVehiclesQuery(filters: Partial<FilterState>): string {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.condition_min !== undefined && filters.condition_min !== 1)
    params.set('condition_min', String(filters.condition_min))
  if (filters.condition_max !== undefined && filters.condition_max !== 5)
    params.set('condition_max', String(filters.condition_max))
  if (filters.price_min) params.set('price_min', String(filters.price_min))
  if (filters.price_max && filters.price_max < 200000)
    params.set('price_max', String(filters.price_max))

  for (const make of filters.make ?? []) params.append('make', make)
  for (const bs of filters.body_style ?? []) params.append('body_style', bs)
  for (const p of filters.province ?? []) params.append('province', p)
  for (const ts of filters.title_status ?? []) params.append('title_status', ts)
  for (const ft of filters.fuel_type ?? []) params.append('fuel_type', ft)
  for (const as_ of filters.auction_status ?? []) params.append('auction_status', as_)

  return params.toString()
}

export async function fetchVehicles(filters: Partial<FilterState>): Promise<VehiclesResponse> {
  const qs = buildVehiclesQuery(filters)
  return request<VehiclesResponse>(`/vehicles${qs ? `?${qs}` : ''}`)
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${id}`)
}

export async function placeBid(id: string, amount: number): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${id}/bids`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export async function buyNow(id: string): Promise<Vehicle & { bought_now: boolean }> {
  return request<Vehicle & { bought_now: boolean }>(`/vehicles/${id}/buy-now`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
