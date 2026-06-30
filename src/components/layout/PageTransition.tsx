import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PageLoader } from '@/components/ui/PageLoader'
import { CosmicVeil } from '@/components/layout/CosmicVeil'

/**
 * Sitewide cinematic page transitions. Every route change (home, /explore,
 * /article/*, /graph, …) animates: the outgoing page fades and drifts up while a
 * brief cosmic veil (<CosmicVeil/>) sweeps over the viewport, then the incoming
 * page fades + settles up from a hair under full scale. The whole exchange runs
 * in well under ~600ms so it reads as a quick "warp", never a cutscene.
 *
 * How it hooks into routing: we read the routed element with `useOutlet()` and
 * key a single <motion.div> by `location.pathname`. <AnimatePresence mode="wait">
 * holds the *previous* element instance mounted for its exit animation, then
 * mounts the next — so only one page is ever in layout flow (no stacked pages,
 * no absolute positioning, no scroll jank). Because the layout shell (Nav,
 * Footer, command palette, Sage) lives *outside* this wrapper in RootLayout, it
 * persists across navigations and is never re-mounted or re-animated.
 *
 * Lazy routes: the per-page <Suspense> lives *inside* the keyed wrapper, so a
 * not-yet-loaded chunk shows the PageLoader within the entering page rather than
 * tearing down the transition. The veil/overlay is always `pointer-events: none`
 * and never gates content — if the route is ready, it shows.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/** The full cosmic transition. */
const cosmic: Variants = {
  initial: { opacity: 0, scale: 0.985, y: 10 },
  enter: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.34, ease: EASE } },
  exit: { opacity: 0, scale: 0.992, y: -8, transition: { duration: 0.24, ease: EASE } },
}

/** prefers-reduced-motion: a plain, quick opacity cross-fade — no scale, drift
 *  or streaks (the <CosmicVeil/> also renders nothing in this mode). */
const plain: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.15, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'linear' } },
}

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduced = useReducedMotion()

  return (
    <>
      {/* `initial={false}` suppresses the enter animation on the very first paint
          (cold load), so first content — and the hero's own reveal — is never
          delayed. Subsequent client navigations animate normally. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={reduced ? plain : cosmic}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.div>
      </AnimatePresence>
      <CosmicVeil />
    </>
  )
}
