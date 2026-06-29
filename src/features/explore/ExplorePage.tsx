import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { clusters, categoriesByCluster } from '@/data/categories'
import { categoryCounts, clusterCounts, totalArticles } from '@/lib/content'
import { clusterAccent, palette } from '@/styles/tokens'
import { useTheme } from '@/hooks/useTheme'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { StarField } from '@/components/StarField'
import type { Category, ClusterId } from '@/types'

export default function ExplorePage() {
  const { theme } = useTheme()

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 starfield opacity-50" aria-hidden />
        <StarField count={70} />
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-reading px-4 py-16 text-center sm:px-6 sm:py-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="label text-gold"
          >
            The Atlas
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold text-fg text-balance sm:text-6xl"
          >
            The whole of knowledge, as one galaxy.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-muted sm:text-lg"
          >
            Twenty-seven categories, drawn into five great clusters. Pick a star and begin —
            every path eventually connects to every other.
          </motion.p>
          <p className="label mt-6 text-faint">{totalArticles} articles charted so far</p>
        </div>
      </section>

      {/* Clusters */}
      <div className="mx-auto max-w-reading space-y-16 px-4 py-16 sm:px-6">
        {clusters.map((cluster, ci) => {
          const accentKey = clusterAccent[cluster.id]
          const accent = palette[theme][accentKey]
          const cats = categoriesByCluster[cluster.id as ClusterId] ?? []
          return (
            <section key={cluster.id} aria-labelledby={`cluster-${cluster.id}`}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span
                    className="mt-1 h-12 w-1 rounded-full"
                    style={{ background: `linear-gradient(${accent}, transparent)` }}
                    aria-hidden
                  />
                  <div>
                    <span className="label" style={{ color: accent }}>
                      Cluster {String(ci + 1).padStart(2, '0')}
                    </span>
                    <h2
                      id={`cluster-${cluster.id}`}
                      className="mt-1 font-display text-2xl font-semibold text-fg sm:text-3xl"
                    >
                      {cluster.name}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-muted">{cluster.tagline}</p>
                  </div>
                </div>
                <span className="label text-faint">
                  {cats.length} categories · {clusterCounts[cluster.id] ?? 0} articles
                </span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cats.map((cat, i) => (
                  <CategoryNode key={cat.id} category={cat} accent={accent} index={i} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function CategoryNode({
  category,
  accent,
  index,
}: {
  category: Category
  accent: string
  index: number
}) {
  const count = categoryCounts[category.id] ?? 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/category/${category.id}`}
        className="group relative flex h-full items-start gap-4 overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong"
      >
        <span
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: accent }}
          aria-hidden
        />
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
            background: `color-mix(in srgb, ${accent} 10%, transparent)`,
          }}
        >
          <CategoryIcon name={category.icon} size={20} />
        </span>

        <span className="relative min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="font-display text-lg font-semibold text-fg group-hover:text-gold-soft">
              {category.name}
            </span>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
            />
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">{category.blurb}</span>
          <span className="label mt-3 inline-block text-faint">
            {count > 0 ? `${count} article${count === 1 ? '' : 's'}` : 'Charting soon'}
          </span>
        </span>
      </Link>
    </motion.div>
  )
}
