import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Telescope } from 'lucide-react'
import { getCategory, getCluster, categoriesByCluster } from '@/data/categories'
import { articlesInCategory, toSummary } from '@/lib/content'
import { clusterAccent, palette } from '@/styles/tokens'
import { useTheme } from '@/hooks/useTheme'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ArticleCard } from '@/components/ArticleCard'
import { StarField } from '@/components/StarField'

export default function CategoryPage() {
  const { id = '' } = useParams()
  const { theme } = useTheme()
  const category = getCategory(id)

  if (!category) return <Navigate to="/404" replace />

  const cluster = getCluster(category.cluster)
  const accent = palette[theme][clusterAccent[category.cluster]]
  const articles = articlesInCategory(category.id).map(toSummary)
  const siblings = (categoriesByCluster[category.cluster] ?? []).filter((c) => c.id !== category.id)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <StarField count={48} seed={category.id} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(70% 60% at 15% 0%, color-mix(in srgb, ${accent} 16%, transparent), transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-reading px-4 py-14 sm:px-6 sm:py-16">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-faint" aria-label="Breadcrumb">
            <Link to="/explore" className="transition-colors hover:text-gold">
              Atlas
            </Link>
            <ChevronRight size={12} />
            <span>{cluster?.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex items-start gap-5"
          >
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
                background: `color-mix(in srgb, ${accent} 10%, transparent)`,
              }}
            >
              <CategoryIcon name={category.icon} size={30} />
            </span>
            <div>
              <span className="label" style={{ color: accent }}>
                {cluster?.name}
              </span>
              <h1 className="mt-1 font-display text-4xl font-semibold text-fg sm:text-5xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-muted sm:text-lg">{category.blurb}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-reading px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="label text-faint">
            {articles.length > 0
              ? `${articles.length} article${articles.length === 1 ? '' : 's'}`
              : 'No articles yet'}
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              >
                <ArticleCard article={a} className="h-full" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <Telescope size={32} className="text-gold" />
            <p className="mt-4 font-display text-xl font-semibold text-fg">
              This region is still being charted.
            </p>
            <p className="mt-2 max-w-md text-sm text-muted">
              No articles have landed in {category.name} yet. Explore a neighbouring domain in the
              same cluster, or follow a journey from the flagship article.
            </p>
            <Link to="/article/ancient-egypt" className="btn btn-gold mt-6">
              Start with Ancient Egypt
            </Link>
          </div>
        )}

        {/* Siblings */}
        {siblings.length > 0 && (
          <section className="mt-16">
            <h2 className="label text-faint">More in {cluster?.name}</h2>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {siblings.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="chip text-muted transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <CategoryIcon name={c.icon} size={14} />
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
