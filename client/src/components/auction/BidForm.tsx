import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/formatters'
import { getMinimumBid, getQuickBidOptions } from '@/lib/auction'
import { usePlaceBid, useBuyNow } from '@/hooks/usePlaceBid'
import type { Vehicle } from '@/types/vehicle'

interface Props {
  vehicle: Vehicle
}

export function BidForm({ vehicle }: Props) {
  const minBid = getMinimumBid(vehicle.current_bid, vehicle.starting_bid)
  const quickBids = getQuickBidOptions(minBid)

  const [amount, setAmount] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAmount, setPendingAmount] = useState<number>(0)

  const { mutate: placeBid, isPending: bidPending } = usePlaceBid(vehicle.id)
  const { mutate: buyNow, isPending: buyNowPending } = useBuyNow(vehicle.id)

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10)
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= minBid

  function submitBid(amt: number) {
    setPendingAmount(amt)
    setConfirmOpen(true)
  }

  function confirmBid() {
    placeBid(pendingAmount, {
      onSettled: () => {
        setConfirmOpen(false)
        setAmount('')
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Minimum bid: <span className="font-semibold text-foreground">{formatCurrency(minBid)}</span>
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {quickBids.map((bid, i) => (
            <Button
              key={i}
              variant={i === 0 ? 'default' : 'outline'}
              size="sm"
              className="text-sm tabular-nums"
              onClick={() => submitBid(bid)}
            >
              {formatCurrency(bid)}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={`Custom amount (min ${formatCurrency(minBid)})`}
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              setAmount(raw ? Number(raw).toLocaleString('en-CA') : '')
            }}
            className="flex-1 text-sm"
          />
          <Button
            onClick={() => isValidAmount && submitBid(parsedAmount)}
            disabled={!isValidAmount}
            className="whitespace-nowrap"
          >
            Bid
          </Button>
        </div>
      </div>

      {vehicle.buy_now_price && (
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Buy it now at <span className="font-semibold text-foreground">{formatCurrency(vehicle.buy_now_price)}</span>
          </p>
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => buyNow()}
            disabled={buyNowPending}
          >
            {buyNowPending ? 'Processing…' : `Buy Now — ${formatCurrency(vehicle.buy_now_price)}`}
          </Button>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm your bid</DialogTitle>
            <DialogDescription>
              You are placing a binding bid on:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-md bg-muted p-4">
            <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</p>
            <p className="text-xs text-muted-foreground">Lot {vehicle.lot}</p>
            <div className="border-t mt-2 pt-2">
              <p className="text-xs text-muted-foreground">Your bid</p>
              <p className="text-2xl font-bold font-price">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={bidPending}>
              Cancel
            </Button>
            <Button onClick={confirmBid} disabled={bidPending}>
              {bidPending ? 'Placing bid…' : 'Confirm Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
