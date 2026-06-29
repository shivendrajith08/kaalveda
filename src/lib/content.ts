import articlesJson from '@/data/generated/articles.json'
import graphJson from '@/data/generated/graph.json'
import type { Article, ArticleSummary, KnowledgeGraph, JourneyStep } from '@/types'
import { getCategory, getClusterForCategory } from '@/data/categories'

export const articles = articlesJson as unknown as Article[]
export const graph = graphJson as unknown as KnowledgeGraph

const byId = new Map(articles.map((a) => [a.id, a]))

export function toSummary(a: Article): ArticleSummary {
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    factStatus: a.factStatus,
    readMins: a.readMins,
    eyebrow: a.eyebrow,
    lede: a.lede,
  }
}

export function getArticle(id: string): Article | undefined {
  return byId.get(id)
}

export function hasArticle(id: string): boolean {
  return byId.has(id)
}

export const articleSummaries: ArticleSummary[] = articles.map(toSummary)

export function articlesInCategory(categoryId: string): Article[] {
  return articles.filter((a) => a.category === categoryId)
}

export const categoryCounts: Record<string, number> = articles.reduce(
  (acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>,
)

export const clusterCounts: Record<string, number> = articles.reduce(
  (acc, a) => {
    const cluster = getClusterForCategory(a.category)
    if (cluster) acc[cluster.id] = (acc[cluster.id] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>,
)

/** Resolved related articles that actually exist, as summaries. */
export function relatedArticles(article: Article): ArticleSummary[] {
  return article.related
    .map((id) => byId.get(id))
    .filter((a): a is Article => Boolean(a))
    .map(toSummary)
}

/** Related ids that do not (yet) have an article — "frontier" links. */
export function relatedFrontier(article: Article): string[] {
  return article.related.filter((id) => !byId.has(id))
}

export interface ResolvedJourneyStep {
  step: JourneyStep
  /** The article for this step, if it exists. */
  article?: ArticleSummary
  /** True when this step is the article currently being read. */
  current: boolean
  /** Position state relative to the current step. */
  position: 'past' | 'current' | 'future'
}

/** Resolve an article's journey, marking the current "HERE" step. */
export function resolveJourney(article: Article): ResolvedJourneyStep[] {
  const currentIndex = article.journey.findIndex((s) => s.id === article.id)
  return article.journey.map((step, index) => {
    const resolved = byId.get(step.id)
    const position: ResolvedJourneyStep['position'] =
      currentIndex === -1
        ? 'future'
        : index < currentIndex
          ? 'past'
          : index === currentIndex
            ? 'current'
            : 'future'
    return {
      step,
      article: resolved ? toSummary(resolved) : undefined,
      current: index === currentIndex,
      position,
    }
  })
}

/** The next journey step after the current article, if any. */
export function nextJourneyStep(article: Article): JourneyStep | undefined {
  const i = article.journey.findIndex((s) => s.id === article.id)
  if (i === -1) return undefined
  return article.journey[i + 1]
}

/** Featured articles for the landing rail — flagship first. */
export function featuredArticles(limit = 6): ArticleSummary[] {
  const flagship = byId.get('ancient-egypt')
  const rest = articles.filter((a) => a.id !== 'ancient-egypt')
  const ordered = flagship ? [flagship, ...rest] : rest
  return ordered.slice(0, limit).map(toSummary)
}

export function categoryLabel(categoryId: string): string {
  return getCategory(categoryId)?.name ?? categoryId
}

export const totalArticles = articles.length
export const totalGraphNodes = graph.nodes.length
export const totalGraphEdges = graph.edges.length
