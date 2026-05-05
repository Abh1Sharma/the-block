import { cn } from '@/lib/utils'
import { formatConditionGrade } from '@/lib/formatters'

interface Props {
  grade: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

function gradeColor(grade: number): string {
  if (grade >= 4.0) return 'bg-emerald-500'
  if (grade >= 3.0) return 'bg-yellow-400'
  if (grade >= 2.0) return 'bg-orange-400'
  return 'bg-red-500'
}

function gradeBadgeColor(grade: number): string {
  if (grade >= 4.0) return 'bg-emerald-100 text-emerald-800'
  if (grade >= 3.0) return 'bg-yellow-100 text-yellow-800'
  if (grade >= 2.0) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export function ConditionGradeBar({ grade, showLabel = true, size = 'md' }: Props) {
  const pct = ((grade - 1) / 4) * 100

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'rounded-full font-semibold tabular-nums',
          size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-sm',
          gradeBadgeColor(grade),
        )}
      >
        {grade.toFixed(1)}
      </span>
      {showLabel && (
        <>
          <div className={cn('flex-1 rounded-full bg-secondary overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
            <div
              className={cn('h-full rounded-full transition-all', gradeColor(grade))}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatConditionGrade(grade)}</span>
        </>
      )}
    </div>
  )
}
