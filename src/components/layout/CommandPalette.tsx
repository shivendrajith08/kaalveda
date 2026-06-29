import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, CornerDownLeft, FileText, LayoutGrid, ArrowRight } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { search, defaultSuggestions } from '@/lib/search'
import type { SearchResult } from '@/types'
import { getCategory } from '@/data/categories'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

export function CommandPalette() {
  const { open, closePalette } = useCommandPalette()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) {
      return defaultSuggestions(6).map((r) => ({ ...r, score: 0 }))
    }
    return search(query, 14)
  }, [query])

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Global ⌃G / ⌘G — jump straight to the Knowledge Map.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        closePalette()
        navigate('/graph')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, closePalette])

  const go = (result: SearchResult) => {
    closePalette()
    navigate(result.kind === 'category' ? `/category/${result.id}` : `/article/${result.id}`)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[active]
      if (r) go(r)
    }
  }

  // Keep the active item in view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const el = list.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={closePalette}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search KaalVeda"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: reduced ? 0 : -12, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-float"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Search size={18} className="shrink-0 text-gold" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the knowledge universe…"
                className="w-full bg-transparent text-base text-fg outline-none placeholder:text-faint"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="label hidden rounded border border-border px-1.5 py-0.5 text-faint sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-faint">
                  No results for “{query}”. Try a category like <em>religions</em> or a topic like{' '}
                  <em>pyramids</em>.
                </p>
              ) : (
                <>
                  {!query.trim() && (
                    <p className="label px-3 pb-1 pt-2 text-faint">Suggested journeys</p>
                  )}
                  {results.map((r, i) => {
                    const category = r.category ? getCategory(r.category) : undefined
                    const isActive = i === active
                    return (
                      <button
                        key={`${r.kind}-${r.id}`}
                        type="button"
                        data-index={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-gold/12' : 'hover:bg-gold/8'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            isActive ? 'border-border-strong text-gold' : 'border-border text-muted'
                          }`}
                        >
                          {r.kind === 'category' ? (
                            <CategoryIcon name={category?.icon ?? 'LayoutGrid'} size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-fg">{r.title}</span>
                          <span className="block truncate text-xs text-faint">{r.subtitle}</span>
                        </span>
                        <span className="label hidden items-center gap-1 text-faint sm:flex">
                          {r.kind === 'category' ? <LayoutGrid size={12} /> : <ArrowRight size={12} />}
                          {r.kind}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-faint">
              <span className="label flex items-center gap-1.5">
                <CornerDownLeft size={12} /> to open
              </span>
              <span className="label">↑↓ to navigate</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
