import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, Building2 } from 'lucide-react'
import { useVehicle } from '@/hooks/useVehicle'
import { ImageGallery } from '@/components/vehicle/ImageGallery'
import { SpecsGrid } from '@/components/vehicle/SpecsGrid'
import { ConditionGradeBar } from '@/components/vehicle/ConditionGradeBar'
import { DamageNotes } from '@/components/vehicle/DamageNotes'
import { RelatedVehicles } from '@/components/vehicle/RelatedVehicles'
import { AuctionPanel } from '@/components/auction/AuctionPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatTitleStatus } from '@/lib/formatters'
import { getAuctionStatus, getMinimumBid } from '@/lib/auction'
import { usePlaceBid } from '@/hooks/usePlaceBid'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6">
      <Skeleton className="h-5 w-32 mb-6" />
      <Skeleton className="w-full aspect-[16/10] rounded-lg mb-6" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Skeleton className="h-7 w-2/3" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  )
}

// Mobile-only: fixed bar at the bottom of the screen
function MobileBidBar({ vehicleId, currentBid, startingBid, auctionStart }: {
  vehicleId: string
  currentBid: number | null
  startingBid: number
  auctionStart: string
}) {
  const status = getAuctionStatus(auctionStart)
  const minBid = getMinimumBid(currentBid, startingBid)
  const [open, setOpen] = useState(false)
  const { mutate: placeBid, isPending } = usePlaceBid(vehicleId)

  if (status !== 'live') return null

  return (
    <>
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-white/95 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 max-w-screen-xl mx-auto">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {currentBid !== null ? 'Current bid' : 'Starting bid'}
            </p>
            <p className="font-bold tabular-nums text-lg">{formatCurrency(currentBid ?? startingBid)}</p>
          </div>
          <Button className="ml-auto shrink-0" size="lg" onClick={() => setOpen(true)}>
            Quick bid — {formatCurrency(minBid)}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm bid</DialogTitle>
            <DialogDescription>
              Minimum bid of{' '}
              <span className="font-semibold text-foreground">{formatCurrency(minBid)}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => placeBid(minBid, { onSettled: () => setOpen(false) })}
              disabled={isPending}
            >
              {isPending ? 'Placing…' : 'Confirm Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading, isError } = useVehicle(id!)

  if (isLoading) return <DetailSkeleton />
  if (isError || !vehicle) return <Navigate to="/" replace />

  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6 pb-24 lg:pb-6">

      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to inventory
      </Link>

      {/* Image gallery — full width on all breakpoints */}
      <div className="mb-6">
        <ImageGallery images={vehicle.images} alt={vehicleTitle} />
      </div>

      {/* Title row — full width */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h1 className="text-2xl font-bold leading-tight">{vehicleTitle}</h1>
          <Badge
            variant={
              vehicle.title_status === 'clean' ? 'success'
              : vehicle.title_status === 'rebuilt' ? 'warning'
              : 'danger'
            }
          >
            {formatTitleStatus(vehicle.title_status)} Title
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {vehicle.city}, {vehicle.province} · Lot {vehicle.lot}
        </p>
      </div>

      {/*
        Two-column grid.
        DOM order: AuctionPanel first so it appears at top on mobile (before specs/damage).
        CSS order reverses them on desktop: details left, panel right (sticky).
      */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Auction panel — DOM first → mobile top; CSS order-2 → desktop right column */}
        <div className="lg:order-2">
          <AuctionPanel vehicle={vehicle} />
        </div>

        {/* Vehicle details — DOM second → mobile below panel; CSS order-1 → desktop left column */}
        <div className="lg:order-1 space-y-8 min-w-0">

          <Separator />

          {/* Condition */}
          <section className="space-y-3">
            <h2 className="font-semibold">Condition</h2>
            <ConditionGradeBar grade={vehicle.condition_grade} />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vehicle.condition_report}
            </p>
          </section>

          {/* Damage notes */}
          <section className="space-y-3">
            <h2 className="font-semibold">Damage Notes</h2>
            <DamageNotes notes={vehicle.damage_notes} />
          </section>

          <Separator />

          {/* Specifications */}
          <section className="space-y-4">
            <h2 className="font-semibold">Specifications</h2>
            <SpecsGrid vehicle={vehicle} />
          </section>

          <Separator />

          {/* Selling dealer */}
          <section className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sold by</p>
              <p className="font-medium">{vehicle.selling_dealership}</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.city}, {vehicle.province}
              </p>
            </div>
          </section>

          <Separator />

          {/* Related vehicles — same make */}
          <RelatedVehicles vehicleId={vehicle.id} make={vehicle.make} />

        </div>
      </div>

      {/* Mobile sticky quick-bid bar */}
      <MobileBidBar
        vehicleId={vehicle.id}
        currentBid={vehicle.current_bid}
        startingBid={vehicle.starting_bid}
        auctionStart={vehicle.auction_start}
      />
    </div>
  )
}
