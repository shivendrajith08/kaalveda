import { useState } from 'react'

/**
 * Device capability tier for the 3D landing hero.
 *
 *  - `off`    — no WebGL, an explicitly weak device, or a Save-Data hint. The
 *               landing page renders the existing 2D <HeroBackground/> instead
 *               and the three.js chunk is never fetched.
 *  - `medium` — capable but modest (mobile / low-core / low-DPR budget). Fewer
 *               particles, bloom + vignette only, tighter pixel-ratio cap.
 *  - `high`   — desktop-class. Full particle counts and the complete
 *               bloom + vignette + subtle chromatic-aberration pass.
 *
 * Note: this is *device capability only*. `prefers-reduced-motion` is handled
 * separately at the call site (it forces the 2D fallback), so this value stays
 * a stable per-device fact rather than a motion preference.
 */
export type HeroTier = 'off' | 'medium' | 'high'

interface NavigatorLike extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

/** Cheap one-off WebGL probe. Creates a throwaway context and lets it drop. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return false
    // A software rasteriser (SwiftShader / llvmpipe) reports as WebGL but will
    // stutter under bloom — treat it as no-GL so we fall back cleanly.
    const ctx = gl as WebGLRenderingContext
    const debug = ctx.getExtension('WEBGL_debug_renderer_info')
    let software = false
    if (debug) {
      const renderer = String(ctx.getParameter(debug.UNMASKED_RENDERER_WEBGL) || '').toLowerCase()
      software =
        renderer.includes('swiftshader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('software')
    }
    // Release the throwaway context right away — LandingPage re-probes on every
    // navigation home, and browsers cap the number of live WebGL contexts.
    ctx.getExtension('WEBGL_lose_context')?.loseContext()
    return !software
  } catch {
    return false
  }
}

/**
 * Classify the current device. Runs synchronously; safe to call once on mount.
 * Conservative on purpose — a weak phone gets the fast 2D hero, never a janky
 * 3D scene. Absent hints (Safari/Firefox lack `deviceMemory`) default to
 * capable so we don't needlessly downgrade good hardware.
 */
export function detectHeroTier(): HeroTier {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'off'
  const nav = navigator as NavigatorLike

  // Respect an explicit data-saver request outright.
  if (nav.connection?.saveData) return 'off'

  if (!hasWebGL()) return 'off'

  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8 // GiB; undefined on many browsers
  const minEdge = Math.min(window.innerWidth, window.innerHeight)
  const dpr = window.devicePixelRatio || 1

  // Clearly under-powered — hand off to the 2D hero.
  if (cores <= 2 || memory <= 2) return 'off'

  // Capable-but-modest: small screens, low core counts, low memory, or a
  // low-DPR panel (often an older/low-end display). Lighter scene, no CA.
  if (cores <= 4 || memory <= 4 || minEdge < 480 || dpr < 1) return 'medium'

  return 'high'
}

/**
 * Memoised tier for the lifetime of the mount. Computed in a lazy initialiser
 * so the probe runs exactly once, client-side, with no re-render churn.
 */
export function useHeroTier(): HeroTier {
  const [tier] = useState<HeroTier>(() => detectHeroTier())
  return tier
}
