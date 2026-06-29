import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import type { ArticleSummary } from '@/types'
import { getCategory } from '@/data/categories'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { FactStatusBadge } from '@/components/ui/FactStatusBadge'
import { cn } from '@/lib/utils'

export function ArticleCard({
  article,
  variant = 'default',
  className,
}: {
  article: ArticleSummary
  variant?: 'default' | 'feature' | 'compact'
  className?: string
}) {
  const category = getCategory(article.category)

  return (
    <Link
      to={`/article/${article.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-300 ease-atlas',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]',
        variant === 'feature' && 'p-6 sm:p-7',
        className,
      )}
    >
      {/* top edge glow on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent transition-colors duration-300 group-hover:via-gold/50" />

      <div className="flex items-center justify-between gap-3">
        <span className="label inline-flex items-center gap-2 text-faint">
          <CategoryIcon name={category?.icon ?? 'Compass'} size={14} className="text-gold" />
          {category?.name ?? article.category}
        </span>
        <ArrowUpRight
          size={18}
          className="text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
        />
      </div>

      <h3
        className={cn(
          'mt-3 font-display font-semibold text-fg transition-colors group-hover:text-gold-soft',
          variant === 'feature' ? 'text-2xl' : 'text-xl',
        )}
      >
        {article.title}
      </h3>

      {variant !== 'compact' && (
        <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted">
          {article.lede}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <FactStatusBadge status={article.factStatus} size="sm" />
        <span className="label inline-flex items-center gap-1.5 text-faint">
          <Clock size={12} />
          {article.readMins} min
        </span>
      </div>
    </Link>
  )
}
