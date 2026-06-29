import type { Category, Cluster, ClusterId } from '@/types'
import taxonomy from './taxonomy.json'

/**
 * Categories + clusters, typed from the single taxonomy source
 * (`src/data/taxonomy.json`) that the content engine also reads.
 */

export const clusters: Cluster[] = (taxonomy.clusters as Array<{
  id: string
  name: string
  tagline: string
}>).map((c) => ({
  id: c.id as ClusterId,
  name: c.name,
  tagline: c.tagline,
  categories: (taxonomy.categories as Array<{ id: string; cluster: string }>)
    .filter((cat) => cat.cluster === c.id)
    .map((cat) => cat.id),
}))

export const categories: Category[] = (taxonomy.categories as Array<{
  id: string
  name: string
  cluster: string
  blurb: string
  icon: string
  glyph: string
}>).map((c) => ({
  id: c.id,
  name: c.name,
  cluster: c.cluster as ClusterId,
  blurb: c.blurb,
  icon: c.icon,
  glyph: c.glyph,
}))

const categoryById = new Map(categories.map((c) => [c.id, c]))
const clusterById = new Map(clusters.map((c) => [c.id, c]))

export function getCategory(id: string): Category | undefined {
  return categoryById.get(id)
}

export function getCluster(id: string): Cluster | undefined {
  return clusterById.get(id as ClusterId)
}

export function getCategoryName(id: string): string {
  return categoryById.get(id)?.name ?? id
}

export function getClusterForCategory(categoryId: string): Cluster | undefined {
  const cat = categoryById.get(categoryId)
  return cat ? clusterById.get(cat.cluster) : undefined
}

export const categoriesByCluster: Record<ClusterId, Category[]> = clusters.reduce(
  (acc, cluster) => {
    acc[cluster.id] = categories.filter((c) => c.cluster === cluster.id)
    return acc
  },
  {} as Record<ClusterId, Category[]>,
)
