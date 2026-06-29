import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Compass, Sparkles, Lock, Share2 } from 'lucide-react'
import type { Article } from '@/types'
import {
  resolveJourney,
  nextJourneyStep,
  relatedArticles,
  relatedFrontier,
  getArticle,
} from '@/lib/content'
import { getCategory } from '@/data/categories'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function JourneyZone({ article }: { article: Article }) {
  const reduced = useReducedMotion()
  const steps = resolveJourney(article)
  const next = nextJourneyStep(article)
  const related = relatedArticles(article)
  const frontier = relatedFrontier(article)
  const hasJourney = steps.length > 0

  return (
    <aside className="space-y-8">
      {hasJourney && (
        <section className="card overflow-hidden p-6">
          <header className="flex items-center gap-2.5">
            <Compass size={16} className="text-gold" />
            <h2 className="label text-faint">Your path through knowledge</h2>
          </header>

          <ol className="relative mt-5">
            {/* spine */}
            <span className="absolute bottom-3 left-[9px] top-3 w-px bg-border" aria-hidden />

            {steps.map((s, i) => {
              const exists = Boolean(s.article)
              const cat = s.article ? getCategory(s.article.category) : undefined
              const Inner = (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-2 py-2 transition-colors',
                    exists && 'hover:bg-gold/8',
                    s.current && 'bg-gold/10',
                  )}
                >
                  <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border-2',
                        s.current
                          ? 'border-gold bg-gold'
                          : s.position === 'past'
                            ? 'border-gold/60 bg-gold/60'
                            : 'border-border-strong bg-bg',
                      )}
                    />
                    {s.current && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-gold"
                        animate={reduced ? undefined : { scale: [1, 1.7], opacity: [0.7, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                        aria-hidden
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'truncate font-medium',
                          s.current ? 'text-gold' : exists ? 'text-fg' : 'text-faint',
                        )}
                      >
                        {s.step.label}
                      </span>
                      {s.current && (
                        <span className="label inline-flex items-center gap-1 rounded-full bg-gold px-1.5 py-0.5 text-[0.55rem] text-[#1b150a]">
                          <MapPin size={9} /> HERE
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
                      {cat && <CategoryIcon name={cat.icon} size={11} />}
                      {cat?.name ?? (exists ? '' : 'Coming soon')}
                    </span>
                  </span>
                </div>
              )

              return (
                <li key={`${s.step.id}-${i}`} className="relative">
                  {exists && !s.current ? (
                    <Link to={`/article/${s.step.id}`}>{Inner}</Link>
                  ) : (
                    Inner
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {next && getArticle(next.id) && (
        <ContinueCard nextId={next.id} label={next.label} />
      )}

      {(related.length > 0 || frontier.length > 0) && (
        <section className="card p-6">
          <header className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-gold" />
            <h2 className="label text-faint">Connected domains</h2>
          </header>
          <p className="mt-2 text-sm text-muted">
            Where this article links into the wider map of knowledge.
          </p>

          <div className="mt-4 space-y-2">
            {related.map((r) => {
              const cat = getCategory(r.category)
              return (
                <Link
                  key={r.id}
                  to={`/article/${r.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-gold/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-gold">
                    <CategoryIcon name={cat?.icon ?? 'Compass'} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg group-hover:text-gold-soft">
                      {r.title}
                    </span>
                    <span className="block truncate text-xs text-faint">{cat?.name}</span>
                  </span>
                  <ArrowRight
                    size={15}
                    className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </Link>
              )
            })}

            {frontier.map((id) => {
              const cat = getCategory(id)
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 opacity-70"
                  title="A frontier of the map — not yet charted"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-faint">
                    {cat ? <CategoryIcon name={cat.icon} size={15} /> : <Lock size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-muted">
                      {cat?.name ?? labelize(id)}
                    </span>
                    <span className="label block text-faint">Frontier · uncharted</span>
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Link
        to={`/graph?from=${article.id}`}
        className="group flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:bg-gold/5 hover:text-gold"
      >
        <Share2 size={15} className="text-gold" />
        View in Graph
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </aside>
  )
}

function ContinueCard({ nextId, label }: { nextId: string; label: string }) {
  const article = getArticle(nextId)
  if (!article) return null
  const cat = getCategory(article.category)
  return (
    <Link
      to={`/article/${nextId}`}
      className="group relative block overflow-hidden rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-6 transition-colors hover:border-gold/70"
    >
      <p className="label text-gold">Continue your path</p>
      <p className="mt-2 font-display text-xl font-semibold text-fg">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{article.lede}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold">
        {cat && <CategoryIcon name={cat.icon} size={15} />}
        Travel onward
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

function labelize(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
