import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ChevronDown, Compass, Route, Sparkles, MapPin, Waypoints } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { clusters } from '@/data/categories'
import { featuredArticles, getArticle, totalArticles, clusterCounts } from '@/lib/content'
import { ArticleCard } from '@/components/ArticleCard'
import { Hero3DBackground } from '@/features/landing/Hero3DBackground'
import { useHeroTier } from '@/features/landing/hero3d/heroCapability'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
  }),
}

/**
 * Hero reveal — a calm, sequenced cascade (lines first, headline word-by-word).
 *
 * `delayChildren` is a factory: on the plain 2D hero it's a small beat so a page
 * transition can settle before the cascade begins. When the 3D cosmos is live,
 * it's held back to ~1.7s so the title resolves like a film's title card *after*
 * the camera's opening dolly — the reveal reads as the shot settling.
 */
const makeHeroStage = (delayChildren: number): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren: 0.13 } },
})
const heroLine: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}
const heroHeadline: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const heroWord: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const HEADLINE_WORDS: { text: string; gold?: boolean }[] = [
  { text: 'The' },
  { text: 'whole' },
  { text: 'of' },
  { text: 'knowledge,' },
  { text: 'as' },
  { text: 'one' },
  { text: 'galaxy.', gold: true },
]

export default function LandingPage() {
  const reduced = useReducedMotion()
  const heroTier = useHeroTier()
  const featured = featuredArticles(6)
  const egypt = getArticle('ancient-egypt')

  // 3D cosmos runs only on a capable device with motion allowed; otherwise the
  // 2D hero stands in. The reveal timing follows suit so the title never floats
  // in before the opening shot has begun.
  const use3D = !reduced && heroTier !== 'off'
  const heroStage = useMemo(() => makeHeroStage(use3D ? 1.7 : 0.16), [use3D])
  const hintDelay = use3D ? 3.4 : 1.15

  return (
    <div>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden">
        <Hero3DBackground tier={heroTier} reduced={reduced} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(68% 48% at 50% 6%, color-mix(in srgb, var(--c-gold) 10%, transparent), transparent 62%)',
          }}
          aria-hidden
        />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
        {/* Text-contrast scrim: a soft indigo darkening behind the title block,
            only over the luminous 3D cosmos, to guarantee legibility without
            dimming the 2D fallback hero. Sits under the text (z-10) and CTAs. */}
        {use3D && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 48% at 50% 44%, color-mix(in srgb, var(--c-bg) 64%, transparent) 0%, color-mix(in srgb, var(--c-bg) 30%, transparent) 44%, transparent 72%)',
            }}
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to top, var(--c-bg), transparent)' }}
          aria-hidden
        />

        <motion.div
          variants={heroStage}
          initial={reduced ? false : 'hidden'}
          animate="show"
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6"
        >
          <motion.span
            variants={heroLine}
            className="label inline-flex items-center gap-2 text-gold/90"
          >
            <Sparkles size={13} /> Explore everything · Learn everything
          </motion.span>

          <motion.h1
            variants={heroHeadline}
            className="mt-7 max-w-[18ch] font-display font-semibold leading-[1.04] tracking-[-0.02em] text-fg text-balance text-[clamp(2.5rem,7vw,5.25rem)]"
          >
            {HEADLINE_WORDS.map((word, i) => (
              <Fragment key={i}>
                <motion.span variants={heroWord} className="inline-block">
                  {word.gold ? (
                    <span className="gold-text gold-text-shimmer">{word.text}</span>
                  ) : (
                    word.text
                  )}
                </motion.span>
                {i < HEADLINE_WORDS.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </motion.h1>

          <motion.p
            variants={heroLine}
            className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg"
          >
            The cosmos, history, religion, science and civilization — charted as one connected map.
            Every article a star; every link, a path between them.
          </motion.p>

          <motion.div
            variants={heroLine}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link to="/explore" className="btn btn-gold group w-full sm:w-auto">
              Begin exploring
              <ArrowRight
                size={17}
                className="transition-transform duration-200 ease-atlas group-hover:translate-x-0.5"
              />
            </Link>
            <Link to="/graph" className="btn btn-ghost w-full sm:w-auto">
              <Waypoints size={16} /> View the map
            </Link>
          </motion.div>

          <motion.div
            variants={heroLine}
            className="mt-12 flex items-center justify-center gap-3 text-faint"
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/40" aria-hidden />
            <span className="text-[0.82rem] tracking-wide">
              <span className="font-display font-semibold text-gold">{totalArticles}</span> articles
              charted so far
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/40" aria-hidden />
          </motion.div>
        </motion.div>

        {!reduced && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: hintDelay, duration: 0.9, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={20} className="text-faint" />
            </motion.span>
          </motion.div>
        )}
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
