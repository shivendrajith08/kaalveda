import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft, Clock3 } from 'lucide-react'
import { getTimeline } from '@/data/timelines'
import { articles } from '@/lib/content'
import { Timeline } from '@/features/timeline/Timeline'
import { StarField } from '@/components/StarField'

export default function TimelinePage() {
  const { id = '' } = useParams()
  const timeline = getTimeline(id)

  if (!timeline) return <Navigate to="/404" replace />

  const sourceArticle = articles.find((a) => a.media.timeline === id)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <StarField count={50} seed={`timeline-${id}`} />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-reading px-4 py-14 sm:px-6 sm:py-16">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-faint" aria-label="Breadcrumb">
            <Link to="/explore" className="transition-colors hover:text-gold">
              Atlas
            </Link>
            <ChevronRight size={12} />
            {sourceArticle ? (
              <Link to={`/article/${sourceArticle.id}`} className="transition-colors hover:text-gold">
                {sourceArticle.title}
              </Link>
            ) : (
              <span>Timeline</span>
            )}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5"
          >
            <span className="label inline-flex items-center gap-2 text-gold">
              <Clock3 size={14} /> Timeline
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold text-fg sm:text-5xl">
              {timeline.title}
            </h1>
            {timeline.subtitle && (
              <p className="mt-4 max-w-2xl text-pretty text-muted sm:text-lg">{timeline.subtitle}</p>
            )}
            <p className="label mt-5 text-faint">{timeline.events.length} events</p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Timeline timeline={timeline} />

        {sourceArticle && (
          <div className="mt-14 border-t border-border pt-8">
            <Link
              to={`/article/${sourceArticle.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
            >
              <ArrowLeft size={15} /> Back to {sourceArticle.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
