import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Cosmic veil — a brief, GPU-cheap "warp" painted over the viewport on every
 * client-side route change: a soft gold/cream light-bloom over midnight indigo
 * plus a handful of streaking stars. Each sweep mounts on navigation, plays once
 * (< ~520ms) and then removes itself entirely — nothing lingers in the DOM
 * between navigations.
 *
 * The whole layer is `pointer-events: none` and sits above the page content but
 * below modals (the command palette, z-100). It is pure atmosphere on top of the
 * page cross-fade handled by <PageTransition/>; it never gates interaction or
 * content.
 *
 * Honours `prefers-reduced-motion` by rendering nothing at all — in that mode
 * <PageTransition/> degrades to a plain opacity cross-fade with no streaks,
 * scale or drift.
 */

const EASE = [0.16, 1, 0.3, 1] as const
const STREAK_COUNT = 7
/** The bloom is the longest-lived element; its completion tears down the sweep. */
const BLOOM_MS = 0.52

interface Streak {
  /** vertical position, vh */
  top: number
  /** start position, vw (just off the left edge) */
  left: number
  /** horizontal travel, vw */
  travel: number
  /** length, px */
  width: number
  /** thickness, px */
  thickness: number
  /** stagger, s */
  delay: number
}

/**
 * Scatter a fresh set of rightward star-streaks. Positions are viewport-relative
 * (vw/vh) so the effect never reads or depends on layout — no reflow, no jank.
 */
function makeStreaks(): Streak[] {
  return Array.from({ length: STREAK_COUNT }, (_, i) => ({
    top: 6 + Math.random() * 88,
    left: -10 + Math.random() * 28,
    travel: 16 + Math.random() * 30,
    width: 50 + Math.random() * 130,
    thickness: 1 + Math.random() * 1.4,
    delay: (i / STREAK_COUNT) * 0.05 + Math.random() * 0.03,
  }))
}

/** One self-contained sweep. Calls `onDone` once its longest element settles. */
function Sweep({ onDone }: { onDone: () => void }) {
  const streaks = useMemo(makeStreaks, [])

  return (
    <>
      {/* Warm light-bloom — gold/cream core fading to nothing, screened over the
          page so it reads as light rather than paint. Drives teardown. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 48% at 50% 46%, color-mix(in srgb, var(--c-gold-soft) 60%, transparent), color-mix(in srgb, var(--c-gold) 16%, transparent) 38%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.7, 1.12, 1.2] }}
        transition={{ duration: BLOOM_MS, ease: EASE, times: [0, 0.35, 1] }}
        onAnimationComplete={onDone}
      />

      {/* A short-lived deepening of the midnight-indigo field as the bloom passes. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 50%, transparent 38%, color-mix(in srgb, var(--amb-cool-col) 62%, transparent))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.32, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut', times: [0, 0.3, 1] }}
      />

      {/* Streaking stars — gold heads with a cream tip, stretched as they fly. */}
      {streaks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${s.top}vh`,
            left: `${s.left}vw`,
            width: s.width,
            height: s.thickness,
            transformOrigin: 'left center',
            background:
              'linear-gradient(90deg, transparent, var(--c-gold-soft) 68%, var(--c-parchment))',
          }}
          initial={{ opacity: 0, x: 0, scaleX: 0.3 }}
          animate={{ opacity: [0, 0.85, 0], x: `${s.travel}vw`, scaleX: [0.3, 1, 0.55] }}
          transition={{ duration: 0.42, delay: s.delay, ease: 'easeOut', times: [0, 0.4, 1] }}
        />
      ))}
    </>
  )
}

export function CosmicVeil() {
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  // Track the last path we swept on. Initialised to the first path so the very
  // first paint never sweeps; comparing paths (rather than a "first" flag) keeps
  // this correct under React 18 StrictMode's double-invoked effects.
  const prevPath = useRef(pathname)
  const idRef = useRef(0)
  const [sweeps, setSweeps] = useState<number[]>([])

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    if (reduced) return
    const id = ++idRef.current
    setSweeps((s) => [...s, id])
  }, [pathname, reduced])

  if (reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {sweeps.map((id) => (
        <Sweep key={id} onDone={() => setSweeps((s) => s.filter((x) => x !== id))} />
      ))}
    </div>
  )
}
