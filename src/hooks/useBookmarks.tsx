import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  addRemoteBookmark,
  fetchRemoteBookmarks,
  removeRemoteBookmark,
  isSupabaseEnabled,
} from '@/lib/supabase'

const STORAGE_KEY = 'kaalveda-bookmarks'

interface BookmarksContextValue {
  bookmarks: string[]
  isBookmarked: (id: string) => boolean
  toggleBookmark: (id: string) => void
  count: number
  /** True when bookmarks are syncing to a cloud account rather than this device only. */
  synced: boolean
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeLocal(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota / private mode */
  }
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<string[]>(() => readLocal())

  // Always persist locally — this is the zero-backend fallback.
  useEffect(() => {
    writeLocal(bookmarks)
  }, [bookmarks])

  // When a cloud user signs in, merge their remote bookmarks with local ones.
  useEffect(() => {
    if (!isSupabaseEnabled || !user) return
    let active = true
    fetchRemoteBookmarks(user.id).then((remote) => {
      if (!active) return
      setBookmarks((local) => {
        const merged = Array.from(new Set([...local, ...remote]))
        // Push any local-only bookmarks up to the cloud.
        for (const id of local) {
          if (!remote.includes(id)) void addRemoteBookmark(user.id, id)
        }
        return merged
      })
    })
    return () => {
      active = false
    }
  }, [user])

  const toggleBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const exists = prev.includes(id)
        const next = exists ? prev.filter((x) => x !== id) : [...prev, id]
        if (user && isSupabaseEnabled) {
          if (exists) void removeRemoteBookmark(user.id, id)
          else void addRemoteBookmark(user.id, id)
        }
        return next
      })
    },
    [user],
  )

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
      count: bookmarks.length,
      synced: Boolean(user && isSupabaseEnabled),
    }),
    [bookmarks, isBookmarked, toggleBookmark, user],
  )

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider')
  return ctx
}
