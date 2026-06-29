import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Route, Compass, BadgeCheck, CircleDashed, Sparkle, Layers, Palette, ArrowRight } from 'lucide-react'
import { StarField } from '@/components/StarField'
import { totalArticles, totalGraphNodes, totalGraphEdges } from '@/lib/content'
import { clusters } from '@/data/categories'

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <StarField count={56} seed="about" />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-reading px-4 py-16 sm:px-6 sm:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label text-gold">
            About KaalVeda
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-3xl font-display text-4xl font-semibold text-fg text-balance sm:text-6xl"
          >
            A map of everything, made to be travelled.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-2xl text-pretty text-muted sm:text-lg"
          >
            <em>KaalVeda</em> — from <span className="text-fg">kaal</span> (time) and{' '}
            <span className="text-fg">veda</span> (knowledge) — is a premium knowledge universe.
            Its premise is simple: knowledge is connected, so learning should feel like a journey,
            not a list of disconnected pages.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-prose px-4 py-14 sm:px-6">
        <Principle icon={Route} title="Every article is a node on a journey">
          Instead of dropping you on an island, KaalVeda hands you a path. From Ancient Egypt you can
          travel onward through religion, kingship, architecture, astronomy and the modern world —
          with a gold <strong className="text-gold">HERE</strong> marker showing exactly where you
          stand, and a “Continue your path” rail offering the next step.
        </Principle>

        <Principle icon={Compass} title="Five clusters, twenty-seven categories">
          The whole map is organised into five clusters — Cosmos &amp; Earth, Life &amp; Time, Belief
          &amp; Story, Mind &amp; Knowledge, and Society &amp; Tomorrow — that also shape how topics
          sit near one another in the Atlas and the underlying knowledge graph.
        </Principle>

        <Principle icon={BadgeCheck} title="Honesty about certainty">
          Not all knowledge is equally settled. Every article carries a fact-status badge so you
          always know how firm the ground is:
          <span className="mt-4 flex flex-col gap-2.5">
            <Status icon={BadgeCheck} color="var(--c-verified)" label="Verified" text="Established by scholarly and scientific consensus." />
            <Status icon={CircleDashed} color="var(--c-theory)" label="Theory" text="A leading, evidence-backed explanation that is still debated." />
            <Status icon={Sparkle} color="var(--c-speculation)" label="Speculation" text="Informed conjecture that reaches beyond current evidence." />
          </span>
        </Principle>

        <Principle icon={Layers} title="Content as a build step">
          Articles are authored as MDX files and compiled by a content engine into a typed dataset —
          articles, a knowledge graph of {totalGraphNodes} nodes and {totalGraphEdges} connections,
          and a ranked search index. It runs automatically before every build, so the live site is
          never stale.
        </Principle>

        <Principle icon={Palette} title="Illuminated manuscript meets star chart">
          The design draws on antique celestial atlases — midnight indigo, warm gold and parchment
          cream, with Fraunces, Inter and JetBrains Mono — deliberately calm and cinematic rather
          than neon. Light and dark themes flow from a single token source.
        </Principle>

        <div className="mt-12 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="label text-faint">The universe so far</p>
          <p className="mt-3 font-display text-3xl font-semibold text-gold">
            {totalArticles} articles · {clusters.length} clusters · 27 categories
          </p>
          <Link to="/explore" className="btn btn-gold mt-6">
            <Compass size={16} /> Enter the Atlas <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Principle({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Route
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-12"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-gold/10 text-gold">
          <Icon size={18} />
        </span>
        <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
      </div>
      <p className="mt-4 text-pretty leading-relaxed text-muted">{children}</p>
    </motion.section>
  )
}

function Status({
  icon: Icon,
  color,
  label,
  text,
}: {
  icon: typeof BadgeCheck
  color: string
  label: string
  text: string
}) {
  return (
    <span className="flex items-center gap-3 rounded-lg border border-border bg-bg/40 px-4 py-2.5">
      <Icon size={16} style={{ color }} />
      <span className="text-sm">
        <strong className="font-semibold" style={{ color }}>
          {label}
        </strong>
        <span className="text-muted"> — {text}</span>
      </span>
    </span>
  )
}
