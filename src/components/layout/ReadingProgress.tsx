import { Clock3 } from 'lucide-react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { cn } from '@/lib/utils'

/**
 * Reading affordances pinned to the viewport while an article is open:
 *   1. a slim gold progress line across the very top, and
 *   2. an unobtrusive "X min left" pill in the bottom-right corner.
 *
 * The bar fills via `transform: scaleX(...)` (compositor-only, no layout
 * thrash), driven by the rAF-throttled `useScrollProgress`. The pill reads from
 * the article's `readMins` and only shows mid-read, fading out before the
 * footer so it never collides with the page chrome.
 */
export function ReadingProgress({ readMins }: { readMins?: number }) {
  const progress = useScrollProgress()
  const remaining =
    readMins != null ? Math.max(0, Math.round(readMins * (1 - progress / 100))) : null
  const showPill = progress > 2 && progress < 99

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
        <div
          className="h-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-soft transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>

      {remaining != null && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur transition-opacity duration-300 sm:bottom-6 sm:right-6',
            showPill ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Clock3 size={12} className="text-gold" />
          {remaining <= 0 ? 'Almost done' : `${remaining} min left`}
        </div>
      )}
    </>
  )
}
