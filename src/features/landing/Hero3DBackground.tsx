import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { lazyWithRetry } from '@/app/lazyWithRetry'
import { HeroBackground } from '@/features/landing/HeroBackground'
import type { HeroTier } from '@/features/landing/hero3d/heroCapability'

/**
 * The three.js scene lives behind a lazy boundary, so importing this wrapper
 * pulls in NONE of the 3D stack — three + postprocessing land in their own
 * async chunk, fetched only when a capable device actually mounts the scene.
 * lazyWithRetry gives the same transient-failure + stale-deploy recovery the
 * routes use.
 */
const Hero3DScene = lazyWithRetry(() => import('@/features/landing/hero3d/Hero3DScene'))

/**
 * Hero3DBackground — the landing hero backdrop. Renders the existing 2D
 * <HeroBackground/> as the instant base layer (and the loading state), then, on
 * a capable device with motion allowed, cross-fades the lazy 3D cosmos in over
 * it. Any failure — a chunk that won't load, a thrown render, a lost WebGL
 * context — silently leaves the 2D hero in place. It never blanks.
 *
 * Gating is decided by the caller (LandingPage) and passed in, so the WebGL
 * capability probe runs exactly once and both the reveal timing and the scene
 * agree on whether 3D is active.
 */
export function Hero3DBackground({
  tier,
  reduced,
}: {
  tier: HeroTier
  reduced: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const use3D = !reduced && tier !== 'off' && !failed
  const sceneTier = tier === 'high' ? 'high' : 'medium'

  // Pause the render loop while the hero is scrolled off-screen or the tab is
  // hidden — no wasted GPU when the cosmos isn't visible (mirrors the 2D hero).
  useEffect(() => {
    if (!use3D) return
    const el = containerRef.current
    if (!el) return
    let onScreen = true
    const sync = () => setActive(onScreen && !document.hidden)
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true
        sync()
      },
      { threshold: 0 },
    )
    io.observe(el)
    const onVisibility = () => sync()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [use3D])

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden>
      {/* Instant base layer: also the reduced-motion / low-perf / loading state. */}
      <HeroBackground />

      {use3D && (
        <Hero3DErrorBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <div
              className="absolute inset-0 transition-opacity ease-out"
              style={{ opacity: ready ? 1 : 0, transitionDuration: '1200ms' }}
            >
              <Hero3DScene
                tier={sceneTier}
                motion={!reduced}
                active={active}
                onReady={() => setReady(true)}
                onError={() => setFailed(true)}
              />
            </div>
          </Suspense>
        </Hero3DErrorBoundary>
      )}
    </div>
  )
}

/**
 * Local boundary for the 3D layer. Unlike the route-level RouteErrorBoundary
 * (which shows a full recover card), a decorative background must fail quietly:
 * its fallback is nothing at all, leaving the 2D <HeroBackground/> underneath
 * visible. It also signals the parent to stop re-attempting the 3D mount.
 */
class Hero3DErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('[Hero3DBackground] 3D intro failed; using 2D hero.', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
