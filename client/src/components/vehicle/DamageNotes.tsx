import { AlertTriangle, CheckCircle } from 'lucide-react'

interface Props {
  notes: string[]
}

export function DamageNotes({ notes }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        No damage noted
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" />
        {notes.length} damage item{notes.length !== 1 ? 's' : ''} noted
      </div>
      <div className="flex flex-wrap gap-1.5">
        {notes.map((note, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-800"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  )
}
