import { useScrollProgress } from '@/hooks/useScrollProgress'

/** Thin gold reading-progress bar pinned to the very top of the viewport. */
export function ReadingProgress() {
  const progress = useScrollProgress()
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
