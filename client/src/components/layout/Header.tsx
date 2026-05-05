import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Car } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Header() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    params.delete('page')
    navigate(`/?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <Car className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">OPENLANE</span>
          <span className="text-muted-foreground font-normal hidden sm:inline">Auctions</span>
        </Link>

        <form onSubmit={handleSearch} className="ml-auto flex w-full max-w-sm items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, VIN…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
