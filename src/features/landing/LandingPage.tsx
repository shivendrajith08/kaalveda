import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Compass, Route, Search, Sparkles, MapPin } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { clusters } from '@/data/categories'
import {
  featuredArticles,
  getArticle,
  totalArticles,
  totalGraphEdges,
  clusterCounts,
} from '@/lib/content'
import { ArticleCard } from '@/components/ArticleCard'
import { StarField } from '@/components/StarField'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function LandingPage() {
  const { openPalette } = useCommandPalette()
  const reduced = useReducedMotion()
  const featured = featuredArticles(6)
  const egypt = getArticle('ancient-egypt')

  return (
    <div>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 starfield" aria-hidden />
        <StarField count={90} className={cn(!reduced && 'animate-drift')} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 50% -10%, color-mix(in srgb, var(--c-gold) 12%, transparent), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto flex max-w-reading flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
          <motion.span
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="chip border-gold/30 text-gold"
          >
            <Sparkles size={13} /> Explore Everything. Learn Everything.
          </motion.span>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-fg text-balance sm:text-7xl"
          >
            Travel through <span className="gold-text">everything we know</span>.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          >
            KaalVeda is not a wiki. It is a connected map of knowledge — the cosmos, history,
            religion, science and civilization — where every article is a node on a journey, and
            you follow the path from one idea to the next.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link to="/explore" className="btn btn-gold w-full sm:w-auto">
              <Compass size={17} /> Enter the Atlas
            </Link>
            <button type="button" onClick={openPalette} className="btn btn-ghost w-full sm:w-auto">
              <Search size={16} /> Search the universe
              <kbd className="label ml-1 rounded border border-border px-1.5 py-0.5 text-[0.6rem]">⌘K</kbd>
            </button>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-faint"
          >
            <Stat value="27" label="categories" />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Stat value="5" label="clusters" />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Stat value={String(totalArticles)} label="articles" />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Stat value={String(totalGraphEdges)} label="connections" />
          </motion.div>
        </div>
      </section>

      {/* ──────────────────── The journey idea ──────────────────── */}
      {egypt && (
        <section className="mx-auto max-w-reading px-4 py-16 sm:px-6">
          <SectionLabel icon={Route}>Not pages — a path</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-fg sm:text-4xl">
            Knowledge as a journey you can walk.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-muted">
            Start at Ancient Egypt and a route opens before you — through religion, kingship,
            architecture, the stars, and on to the present day. A gold <strong className="text-gold">HERE</strong>{' '}
            marker always shows where you stand.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2">
            {egypt.journey.map((step, i) => {
              const exists = Boolean(getArticle(step.id))
              return (
                <div key={step.id} className="flex items-center gap-2">
                  {exists ? (
                    <Link
                      to={`/article/${step.id}`}
                      className={cn(
                        'chip transition-colors hover:border-gold/50 hover:text-gold',
                        i === 0 && 'border-gold/50 text-gold',
                      )}
                    >
                      {i === 0 && <MapPin size={12} />}
                      {step.label}
                    </Link>
                  ) : (
                    <span className="chip text-faint">{step.label}</span>
                  )}
                  {i < egypt.journey.length - 1 && (
                    <ArrowRight size={14} className="text-faint" />
                  )}
                </div>
              )
            })}
          </div>

          <Link
            to="/article/ancient-egypt"
            className="mt-8 inline-flex items-center gap-2 font-medium text-gold transition-colors hover:text-gold-soft"
          >
            Begin the flagship journey — Ancient Egypt
            <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* ──────────────────── Featured rail ──────────────────── */}
      <section className="mx-auto max-w-reading px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel icon={Sparkles}>Begin anywhere</SectionLabel>
            <h2 className="mt-3 font-display text-3xl font-semibold text-fg sm:text-4xl">
              Featured journeys
            </h2>
          </div>
          <Link
            to="/explore"
            className="hidden shrink-0 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-gold sm:flex"
          >
            All categories <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a, i) => (
            <motion.div
              key={a.id}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              <ArticleCard article={a} className="h-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────── Clusters ──────────────────── */}
      <section className="mx-auto max-w-reading px-4 py-16 sm:px-6">
        <SectionLabel icon={Compass}>Five clusters, one map</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-semibold text-fg sm:text-4xl">
          The shape of the knowable.
        </h2>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster, i) => (
            <motion.div
              key={cluster.id}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              <Link
                to="/explore"
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-border-strong"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-fg group-hover:text-gold-soft">
                    {cluster.name}
                  </h3>
                  <span className="label text-faint">{clusterCounts[cluster.id] ?? 0}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{cluster.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cluster.categories.slice(0, 5).map((catId) => (
                    <span key={catId} className="label rounded-full border border-border px-2 py-0.5 text-faint">
                      {labelize(catId)}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}

          <Link
            to="/explore"
            className="group flex h-full min-h-[10rem] flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-gradient-to-br from-gold/8 to-transparent p-6 text-center transition-colors hover:border-gold/60"
          >
            <Compass size={26} className="text-gold transition-transform group-hover:rotate-45" />
            <p className="mt-3 font-display text-lg font-semibold text-fg">Open the full Atlas</p>
            <p className="mt-1 text-sm text-muted">All 27 categories as one galaxy.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-2xl font-semibold text-gold">{value}</span>
      <span className="label text-faint">{label}</span>
    </span>
  )
}

function SectionLabel({ icon: Icon, children }: { icon: typeof Compass; children: React.ReactNode }) {
  return (
    <span className="label inline-flex items-center gap-2 text-gold">
      <Icon size={14} /> {children}
    </span>
  )
}

function labelize(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
