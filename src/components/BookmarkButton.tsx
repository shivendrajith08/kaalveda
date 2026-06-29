import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBookmarks } from '@/hooks/useBookmarks'
import { cn } from '@/lib/utils'

export function BookmarkButton({
  articleId,
  withLabel = false,
}: {
  articleId: string
  withLabel?: boolean
}) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const active = isBookmarked(articleId)

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(articleId)}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-gold/50 bg-gold/12 text-gold'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg',
      )}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="flex">
        {active ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </motion.span>
      {withLabel && <span>{active ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
