import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => setActive((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length])
  const next = useCallback(() => setActive((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length])

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg bg-muted aspect-[16/10]">
        <img
          key={active}
          src={images[active]}
          alt={`${alt} — photo ${active + 1}`}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'flex-shrink-0 h-14 w-20 overflow-hidden rounded-md border-2 transition-colors',
                i === active ? 'border-primary' : 'border-transparent hover:border-muted-foreground/40',
              )}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
