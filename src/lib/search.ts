import indexJson from '@/data/generated/search-index.json'
import type { SearchRecord, SearchResult } from '@/types'

export const searchRecords = indexJson as unknown as SearchRecord[]

/**
 * Ranked search across articles + categories. Scoring favours, in order:
 * exact title, title prefix, title substring, then per-term hits in the
 * title, keywords and subtitle. Articles edge out categories on ties.
 */
export function search(query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)

  const results: SearchResult[] = []
  for (const record of searchRecords) {
    const title = record.title.toLowerCase()
    const subtitle = record.subtitle.toLowerCase()
    let score = 0

    if (title === q) score += 140
    else if (title.startsWith(q)) score += 80
    else if (title.includes(q)) score += 48
    if (subtitle.includes(q)) score += 12

    for (const term of terms) {
      if (title.includes(term)) score += 16
      if (subtitle.includes(term)) score += 6
      if (record.keywords.includes(term)) score += 9
      else if (record.keywords.some((k) => k.startsWith(term))) score += 4
    }

    if (record.kind === 'article') score += 3

    if (score > 0) results.push({ ...record, score })
  }

  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  return results.slice(0, limit)
}

/** A small, stable set of suggestions shown before the user types. */
export function defaultSuggestions(limit = 6): SearchRecord[] {
  return searchRecords.filter((r) => r.kind === 'article').slice(0, limit)
}
