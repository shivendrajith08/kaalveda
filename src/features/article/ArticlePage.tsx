import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Map as MapIcon,
  Image as ImageIcon,
  Video,
  Clock3,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Quote,
  ExternalLink,
} from 'lucide-react'
import { getArticle, categoryLabel } from '@/lib/content'
import { getCategory, getClusterForCategory } from '@/data/categories'
import { getTimeline } from '@/data/timelines'
import { getQuiz } from '@/data/quizzes'
import { FactStatusBadge } from '@/components/ui/FactStatusBadge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { BookmarkButton } from '@/components/BookmarkButton'
import { ReadingProgress } from '@/components/layout/ReadingProgress'
import { ArticleBody } from '@/components/article/ArticleBody'
import { JourneyZone } from '@/features/article/JourneyZone'
import { MediaCard } from '@/features/article/MediaCard'
import { BigBangExplainer } from '@/features/article/BigBangExplainer'
import { Timeline } from '@/features/timeline/Timeline'
import { Quiz } from '@/features/quiz/Quiz'
import { StarField } from '@/components/StarField'
import { cn } from '@/lib/utils'

type TabId = 'article' | 'maps' | 'images' | 'videos' | 'timeline' | 'quiz'

export default function ArticlePage() {
  const { id = '' } = useParams()
  const article = getArticle(id)
  const [tab, setTab] = useState<TabId>('article')

  const timeline = useMemo(() => getTimeline(article?.media.timeline), [article])
  const quiz = useMemo(() => getQuiz(article?.media.quiz), [article])

  if (!article) return <Navigate to="/404" replace />

  const category = getCategory(article.category)
  const cluster = getClusterForCategory(article.category)

  const tabs: { id: TabId; label: string; icon: typeof FileText; count?: number; enabled: boolean }[] = [
    { id: 'article', label: 'Article', icon: FileText, enabled: true },
    { id: 'maps', label: 'Maps', icon: MapIcon, count: article.media.maps.length, enabled: true },
    { id: 'images', label: 'Images', icon: ImageIcon, count: article.media.images.length, enabled: true },
    { id: 'videos', label: 'Videos', icon: Video, count: article.media.videos.length, enabled: true },
    { id: 'timeline', label: 'Timeline', icon: Clock3, enabled: Boolean(timeline) },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, enabled: Boolean(quiz) },
  ]

  return (
    <>
      <ReadingProgress />

      {/* Hero header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 starfield opacity-[0.35]" aria-hidden />
        <StarField count={40} className="opacity-60" seed={article.id} />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-reading px-4 py-12 sm:px-6 sm:py-16">
          {/* breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-faint" aria-label="Breadcrumb">
            <Link to="/explore" className="transition-colors hover:text-gold">
              Atlas
            </Link>
            <ChevronRight size={12} />
            {cluster && <span>{cluster.name}</span>}
            <ChevronRight size={12} />
            <Link to={`/category/${article.category}`} className="transition-colors hover:text-gold">
              {categoryLabel(article.category)}
            </Link>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-3xl"
          >
            <p className="label text-gold">{article.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-fg text-balance sm:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted sm:text-xl">
              {article.lede}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <FactStatusBadge status={article.factStatus} />
              <Link
                to={`/category/${article.category}`}
                className="chip text-muted transition-colors hover:text-gold"
              >
                <CategoryIcon name={category?.icon ?? 'Compass'} size={13} className="text-gold" />
                {categoryLabel(article.category)}
              </Link>
              <span className="chip text-muted">
                <Clock3 size={13} /> {article.readMins} min read
              </span>
              <span className="chip text-muted">{article.wordCount.toLocaleString()} words</span>
              <BookmarkButton articleId={article.id} withLabel />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Two zones */}
      <div className="mx-auto max-w-reading px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14">
          {/* CONTENT ZONE */}
          <div className="min-w-0">
            {/* Tabs */}
            <div className="sticky top-16 z-30 -mx-4 mb-2 bg-bg/80 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
              <div
                role="tablist"
                aria-label="Article content"
                className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1"
              >
                {tabs.map((t) => {
                  const Icon = t.icon
                  const active = tab === t.id
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={active}
                      disabled={!t.enabled}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        'relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        active ? 'text-[#1b150a]' : 'text-muted hover:text-fg',
                        !t.enabled && 'cursor-not-allowed opacity-40 hover:text-muted',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-full bg-gold"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon size={15} className="relative z-10" />
                      <span className="relative z-10">{t.label}</span>
                      {typeof t.count === 'number' && t.count > 0 && (
                        <span
                          className={cn(
                            'relative z-10 rounded-full px-1.5 text-[0.65rem]',
                            active ? 'bg-[#1b150a]/15 text-[#1b150a]' : 'bg-elevated text-faint',
                          )}
                        >
                          {t.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Panels */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5"
            >
              {tab === 'article' && (
                <article>
                  <ArticleBody blocks={article.body} />
                  <Citations article={article} />
                </article>
              )}

              {tab === 'maps' && (
                <MediaGrid
                  empty="No maps charted for this article yet."
                  items={article.media.maps.map((m) => ({ kind: 'map' as const, item: m }))}
                />
              )}
              {tab === 'images' && (
                <MediaGrid
                  empty="No image plates for this article yet."
                  items={article.media.images.map((m) => ({ kind: 'image' as const, item: m }))}
                />
              )}
              {tab === 'videos' &&
                /* The Big Bang's code-drawn explainer is its video content. */
                (article.id === 'the-big-bang' ? (
                  <BigBangExplainer />
                ) : (
                  <MediaGrid
                    empty="No videos for this article yet."
                    items={article.media.videos.map((m) => ({ kind: 'video' as const, item: m }))}
                  />
                ))}

              {tab === 'timeline' && timeline && (
                <div>
                  <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-fg">{timeline.title}</h2>
                      {timeline.subtitle && <p className="mt-1 text-muted">{timeline.subtitle}</p>}
                    </div>
                    <Link to={`/timeline/${timeline.id}`} className="btn btn-ghost text-sm">
                      Full timeline <ArrowRight size={15} />
                    </Link>
                  </div>
                  <Timeline timeline={timeline} />
                </div>
              )}

              {tab === 'quiz' && quiz && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-semibold text-fg">{quiz.title}</h2>
                    {quiz.description && <p className="mt-1 text-muted">{quiz.description}</p>}
                  </div>
                  <Quiz quiz={quiz} />
                </div>
              )}
            </motion.div>
          </div>

          {/* JOURNEY ZONE */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <JourneyZone article={article} />
          </div>
        </div>
      </div>
    </>
  )
}

function MediaGrid({
  items,
  empty,
}: {
  items: { kind: 'map' | 'image' | 'video'; item: Parameters<typeof MediaCard>[0]['item'] }[]
  empty: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-faint">{empty}</p>
      </div>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((m, i) => (
        <MediaCard key={i} kind={m.kind} item={m.item} />
      ))}
    </div>
  )
}

function Citations({ article }: { article: ReturnType<typeof getArticle> }) {
  if (!article || article.citations.length === 0) return null
  return (
    <section className="mt-14 border-t border-border pt-8">
      <h2 className="label flex items-center gap-2 text-faint">
        <Quote size={14} className="text-gold" /> Sources & further reading
      </h2>
      <ul className="mt-4 space-y-3">
        {article.citations.map((c, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 font-mono text-xs text-gold">[{i + 1}]</span>
            <span className="text-muted">
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-fg transition-colors hover:text-gold"
                >
                  {c.label}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="font-medium text-fg">{c.label}</span>
              )}
              {c.source && <span className="block text-xs text-faint">{c.source}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
