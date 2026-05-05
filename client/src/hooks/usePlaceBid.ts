import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeBid, buyNow } from '@/lib/api'
import type { Vehicle } from '@/types/vehicle'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/formatters'

export function usePlaceBid(vehicleId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (amount: number) => placeBid(vehicleId, amount),

    onMutate: async (amount) => {
      await qc.cancelQueries({ queryKey: ['vehicle', vehicleId] })
      const prev = qc.getQueryData<Vehicle>(['vehicle', vehicleId])

      if (prev) {
        qc.setQueryData<Vehicle>(['vehicle', vehicleId], {
          ...prev,
          current_bid: amount,
          bid_count: prev.bid_count + 1,
        })
      }

      return { prev }
    },

    onError: (err, _amount, ctx) => {
      if (ctx?.prev) qc.setQueryData(['vehicle', vehicleId], ctx.prev)
      toast({ variant: 'destructive', title: 'Bid failed', description: err.message })
    },

    onSuccess: (updated) => {
      qc.setQueryData(['vehicle', vehicleId], updated)
      toast({
        variant: 'success',
        title: 'Bid placed!',
        description: `Your bid of ${formatCurrency(updated.current_bid!)} is now the leading bid.`,
      })
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useBuyNow(vehicleId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => buyNow(vehicleId),

    onSuccess: (updated) => {
      qc.setQueryData(['vehicle', vehicleId], updated)
      void qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast({
        variant: 'success',
        title: 'Purchase confirmed!',
        description: `You bought this vehicle at ${formatCurrency(updated.buy_now_price!)}.`,
      })
    },

    onError: (err) => {
      toast({ variant: 'destructive', title: 'Buy Now failed', description: err.message })
    },
  })
}
