import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { ArrowRight, Compass, Sparkles, X } from 'lucide-react'
import { articles, getArticle, nextJourneyStep, relatedArticles } from '@/lib/content'
import { getClusterForCategory } from '@/data/categories'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useVisitedArticles } from '@/hooks/useVisitedArticles'
import { SageFigure, type SagePose } from '@/features/guide/SageFigure'

/**
 * SageGuide — a persistent rishi mascot in the bottom-left corner that reacts
 * to where the reader is and what they're doing. It mounts once in RootLayout
 * and lives across every route.
 *
 * Behaviour map:
 *   - greeting    : a bow on first load, then settles to idle
 *   - pointing    : staff gestures toward the Knowledge Map (on /graph or while
 *                   the nav link is hovered)
 *   - curious     : head tilts on `theory` articles
 *   - idle-long   : leans on the staff after 30s of no interaction
 *   - celebration : a glow pulse on the 5th unique article of the session
 *   - idle        : gentle breathing + robe sway
 *
 * Contextual one-liners surface above the figure, capped at one per 60s and
 * never repeating within a session. Clicking the figure opens a small panel
 * that points to an article the reader hasn't opened yet.
 */

const TIP_COOLDOWN_MS = 60_000
const TIP_VISIBLE_MS = 6_000
const TIP_DELAY_MS = 1_200
const IDLE_LONG_MS = 30_000
const GREETING_MS = 2_400
const CELEBRATION_MS = 2_600
const CELEBRATION_AT = 5

interface TipContext {
  onGraph: boolean
  isTheory: boolean
  cosmos: boolean
  beliefLinks: number
  nextRome: boolean
}

interface TipDef {
  id: string
  text: string
  test: (c: TipContext) => boolean
}

/** Ordered by priority — the first eligible, unseen tip wins. */
const TIPS: TipDef[] = [
  { id: 'rome', text: 'This path leads toward Rome.', test: (c) => c.nextRome },
  { id: 'cosmos', text: 'Few have wandered this far into the cosmos.', test: (c) => c.cosmos },
  { id: 'faiths', text: 'The threads of three faiths cross here.', test: (c) => c.beliefLinks >= 3 },
  { id: 'graph', text: 'Every idea is a star; every link, a path.', test: (c) => c.onGraph },
  { id: 'theory', text: 'Even the wise are still debating this one.', test: (c) => c.isTheory },
]

function articleIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/article\/([^/]+)/)
  return match?.[1]
}

export function SageGuide() {
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const { visited, sessionVisited, markVisited } = useVisitedArticles()

  const [expanded, setExpanded] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [override, setOverride] = useState<'greeting' | 'celebration' | null>('greeting')
  const [idleLong, setIdleLong] = useState(false)
  const [hoverGraph, setHoverGraph] = useState(false)
  const [surpriseId, setSurpriseId] = useState<string | null>(null)

  const shownTips = useRef<Set<string>>(new Set())
  const lastTipAt = useRef(0)
  const celebrated = useRef(false)
  const lastActivity = useRef(Date.now())
  const idleLongRef = useRef(false)
  const bubbleTimer = useRef<number>()
  const tipTimer = useRef<number>()
  const overrideTimer = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  /* ----- derived context ----------------------------------------------- */
  const article = (() => {
    const id = articleIdFromPath(pathname)
    return id ? getArticle(id) : undefined
  })()
  const onGraph = pathname === '/graph'
  const isTheory = article?.factStatus === 'theory'

  const basePose: SagePose =
    onGraph || hoverGraph ? 'pointing' : isTheory ? 'curious' : idleLong ? 'idleLong' : 'idle'
  const pose: SagePose = override ?? basePose

  /* ----- bubble helpers ------------------------------------------------ */
  const showBubble = useCallback((text: string) => {
    setBubble(text)
    window.clearTimeout(bubbleTimer.current)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), TIP_VISIBLE_MS)
  }, [])

  const dismissBubble = useCallback(() => {
    window.clearTimeout(bubbleTimer.current)
    setBubble(null)
  }, [])

  /* ----- mark the current article as visited --------------------------- */
  useEffect(() => {
    if (article) markVisited(article.id)
  }, [article, markVisited])

  /* ----- greeting: bow on first load, then settle ---------------------- */
  useEffect(() => {
    const t = window.setTimeout(
      () => setOverride((o) => (o === 'greeting' ? null : o)),
      reduced ? 400 : GREETING_MS,
    )
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ----- celebration on the 5th unique article of the session ---------- */
  useEffect(() => {
    if (celebrated.current || sessionVisited.length < CELEBRATION_AT) return
    celebrated.current = true
    setOverride('celebration')
    showBubble('Five worlds explored — you wander well.')
    lastTipAt.current = Date.now()
    window.clearTimeout(overrideTimer.current)
    overrideTimer.current = window.setTimeout(
      () => setOverride((o) => (o === 'celebration' ? null : o)),
      reduced ? 400 : CELEBRATION_MS,
    )
  }, [sessionVisited.length, reduced, showBubble])

  /* ----- idle-long: detect 30s of stillness ---------------------------- */
  useEffect(() => {
    const bump = () => {
      lastActivity.current = Date.now()
      if (idleLongRef.current) {
        idleLongRef.current = false
        setIdleLong(false)
      }
    }
    const events: (keyof WindowEventMap)[] = ['scroll', 'pointerdown', 'keydown', 'pointermove', 'touchstart']
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    const interval = window.setInterval(() => {
      if (!idleLongRef.current && Date.now() - lastActivity.current > IDLE_LONG_MS) {
        idleLongRef.current = true
        setIdleLong(true)
      }
    }, 5_000)
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump))
      window.clearInterval(interval)
    }
  }, [])

  /* ----- pointing: react to the Knowledge Map nav link being hovered --- */
  useEffect(() => {
    const isGraphLink = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('a[href$="/graph"]'))
    const onOver = (e: MouseEvent) => isGraphLink(e.target) && setHoverGraph(true)
    const onOut = (e: MouseEvent) => isGraphLink(e.target) && setHoverGraph(false)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  /* ----- contextual tips ----------------------------------------------- */
  useEffect(() => {
    if (override) return // don't talk over a bow or a celebration
    const id = articleIdFromPath(pathname)
    const current = id ? getArticle(id) : undefined
    const next = current ? nextJourneyStep(current) : undefined
    const ctx: TipContext = {
      onGraph: pathname === '/graph',
      isTheory: current?.factStatus === 'theory',
      cosmos: current?.category === 'universe' || current?.category === 'space',
      beliefLinks: current
        ? relatedArticles(current).filter(
            (r) => getClusterForCategory(r.category)?.id === 'belief-story',
          ).length
        : 0,
      nextRome: Boolean(next && /\brom/i.test(`${next.id} ${next.label}`)),
    }

    const tip = TIPS.find((t) => !shownTips.current.has(t.id) && t.test(ctx))
    if (!tip || Date.now() - lastTipAt.current < TIP_COOLDOWN_MS) return

    window.clearTimeout(tipTimer.current)
    tipTimer.current = window.setTimeout(() => {
      shownTips.current.add(tip.id)
      lastTipAt.current = Date.now()
      showBubble(tip.text)
    }, TIP_DELAY_MS)
    return () => window.clearTimeout(tipTimer.current)
  }, [pathname, override, showBubble])

  /* ----- expand panel: pick an unexplored article + outside-click close - */
  const pickSurprise = useCallback(() => {
    const currentId = articleIdFromPath(pathname)
    const pool = articles.filter((a) => !visited.includes(a.id) && a.id !== currentId)
    const list = pool.length ? pool : articles.filter((a) => a.id !== currentId)
    if (!list.length) return null
    return list[Math.floor(Math.random() * list.length)].id
  }, [pathname, visited])

  const toggleExpand = useCallback(() => {
    setExpanded((open) => {
      const next = !open
      if (next) {
        dismissBubble()
        setSurpriseId(pickSurprise())
      }
      return next
    })
  }, [dismissBubble, pickSurprise])

  useEffect(() => {
    if (!expanded) return
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [expanded])

  /* ----- clear all timers on unmount ----------------------------------- */
  useEffect(
    () => () => {
      window.clearTimeout(bubbleTimer.current)
      window.clearTimeout(tipTimer.current)
      window.clearTimeout(overrideTimer.current)
    },
    [],
  )

  const surprise = surpriseId ? getArticle(surpriseId) : undefined
  const ease: Transition = reduced
    ? { duration: 0.15 }
    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-4 left-4 z-40 flex-col items-start gap-2 sm:bottom-6 sm:left-6 ${
        // On /graph the Time-Travel scrubber's "13.8 BYA" label sits bottom-left;
        // hide the Sage below md so it doesn't cover it on narrow screens.
        onGraph ? 'hidden md:flex' : 'flex'
      }`}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.97 }}
            transition={ease}
            className="glass-strong w-64 rounded-2xl p-4 shadow-float"
            role="dialog"
            aria-label="Sage guide"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-base font-semibold leading-snug text-fg">
                Ask me to guide you somewhere
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:text-fg"
              >
                <X size={15} />
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              I'll point you to a corner of the atlas you haven't wandered yet.
            </p>

            {surprise && (
              <Link
                to={`/article/${surprise.id}`}
                onClick={() => setExpanded(false)}
                className="group mt-3 flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-gold/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-gold">
                  <Sparkles size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg group-hover:text-gold-soft">
                    {surprise.title}
                  </span>
                  <span className="label block text-faint">Wander somewhere new</span>
                </span>
                <ArrowRight
                  size={15}
                  className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                />
              </Link>
            )}

            <Link
              to="/graph"
              onClick={() => setExpanded(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-gold"
            >
              <Compass size={14} className="text-gold" />
              Open the Knowledge Map
            </Link>
          </motion.div>
        ) : (
          bubble && (
            <motion.button
              key="bubble"
              type="button"
              onClick={dismissBubble}
              initial={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : 6, scale: reduced ? 1 : 0.96 }}
              transition={ease}
              className="glass-strong relative max-w-[15rem] rounded-2xl px-3.5 py-2.5 text-left shadow-float"
              aria-label="Dismiss tip"
            >
              <p className="line-clamp-2 font-display text-sm font-medium leading-snug text-fg">
                {bubble}
              </p>
              {/* little pointer toward the figure */}
              <span
                className="glass-strong absolute -bottom-1 left-5 h-3 w-3 rotate-45 rounded-[2px]"
                aria-hidden
              />
            </motion.button>
          )
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleExpand}
        aria-label="KaalVeda guide"
        aria-expanded={expanded}
        className="rounded-full outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold"
      >
        <SageFigure pose={pose} reduced={reduced} />
      </button>
    </div>
  )
}
