import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5', className)} aria-label="KaalVeda home">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden>
          <circle cx="32" cy="32" r="20" fill="none" stroke="var(--c-gold)" strokeWidth="1.4" opacity="0.6" />
          <circle cx="32" cy="32" r="13" fill="none" stroke="var(--c-gold)" strokeWidth="1" opacity="0.35" />
          <path d="M32 20 L40 44 L32 38 L24 44 Z" fill="var(--c-gold)" />
          <circle cx="32" cy="32" r="2.4" fill="var(--c-bg)" stroke="var(--c-gold-soft)" strokeWidth="1.2" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight text-fg">KaalVeda</span>
          <span className="label text-[0.55rem] text-faint">Explore · Learn</span>
        </span>
      )}
    </Link>
  )
}
