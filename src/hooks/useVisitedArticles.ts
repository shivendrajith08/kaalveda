import { useCallback, useState } from 'react'

/**
 * Tracks which articles a reader has opened — the closest thing KaalVeda has
 * to a "read history". There was no prior tracking of this kind (only
 * `kaalveda-bookmarks`), so this is the canonical store; reuse it rather than
 * adding another.
 *
 * Two horizons are kept:
 *   - `visited`        — all-time unique ids, persisted in localStorage. Used to
 *                        steer readers toward articles they have never opened.
 *   - `sessionVisited` — unique ids for this tab session only (sessionStorage).
 *                        Drives the "5th article" celebration without re-firing
 *                        for returning visitors.
 */

const STORE_KEY = 'kaalveda-visited'
const SESSION_KEY = 'kaalveda-session-visited'

const ls = typeof window !== 'undefined' ? window.localStorage : undefined
const ss = typeof window !== 'undefined' ? window.sessionStorage : undefined

function read(storage: Storage | undefined, key: string): string[] {
  try {
    const raw = storage?.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(storage: Storage | undefined, key: string, ids: string[]): void {
  try {
    storage?.setItem(key, JSON.stringify(ids))
  } catch {
    /* ignore quota / private mode */
  }
}

export interface VisitedArticles {
  /** All-time unique article ids, persisted across sessions. */
  visited: string[]
  /** Unique article ids opened in this tab session. */
  sessionVisited: string[]
  /** Record a visit. Idempotent — repeat ids are ignored. */
  markVisited: (id: string) => void
  hasVisited: (id: string) => boolean
}

export function useVisitedArticles(): VisitedArticles {
  const [visited, setVisited] = useState<string[]>(() => read(ls, STORE_KEY))
  const [sessionVisited, setSessionVisited] = useState<string[]>(() => read(ss, SESSION_KEY))

  const markVisited = useCallback((id: string) => {
    if (!id) return
    setVisited((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      write(ls, STORE_KEY, next)
      return next
    })
    setSessionVisited((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      write(ss, SESSION_KEY, next)
      return next
    })
  }, [])

  const hasVisited = useCallback((id: string) => visited.includes(id), [visited])

  return { visited, sessionVisited, markVisited, hasVisited }
}
