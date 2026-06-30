import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { palette } from '@/styles/tokens'
import { cn } from '@/lib/utils'

type RGB = [number, number, number]

interface Star {
  /** Normalised position (0..1) — multiplied by canvas size at draw time. */
  x: number
  y: number
  /** Radius in CSS px. */
  r: number
  /** Parallax factor (0..1) — nearer stars drift more. */
  depth: number
  /** Base alpha before twinkle. */
  base: number
  twSpeed: number
  twPhase: number
  bright: boolean
}

interface Anchor {
  x: number
  y: number
  /** Drift amplitude (normalised). */
  ax: number
  ay: number
  /** Drift speed (radians/ms). */
  sx: number
  sy: number
  px: number
  py: number
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Tiny deterministic PRNG so the field is identical every render — no jumps. */
function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Cinematic hero backdrop on a single <canvas>: a living starfield (gentle
 * twinkle + slow parallax drift) threaded with a few faint, slowly-morphing
 * constellation lines — a quiet nod to the Knowledge Graph.
 *
 * Cheap by design: ~120 points, a handful of line segments, one rAF loop that
 * pauses when off-screen or the tab is hidden. Honours prefers-reduced-motion
 * by painting a single static frame and never starting the loop.
 */
export function HeroBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const context = canvasEl.getContext('2d')
    if (!context) return
    // Non-null declared types so the rAF/resize closures keep their narrowing.
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = context

    const p = palette[theme]
    const cBright = hexToRgb(p['gold-soft'])
    const cDim = hexToRgb(p.muted)
    const cLine = hexToRgb(p.gold)
    const cNode = hexToRgb(p.gold)

    const rng = mulberry32(0x6b8e23)
    const isSmall = window.innerWidth < 640
    const STAR_COUNT = isSmall ? 64 : 120
    const ANCHOR_COUNT = isSmall ? 7 : 10
    const LINK_DIST = isSmall ? 150 : 210

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const size = rng()
      const bright = rng() > 0.86
      return {
        x: rng(),
        y: rng(),
        r: 0.4 + size * (bright ? 1.5 : 1),
        depth: 0.2 + rng() * 0.8,
        base: bright ? 0.7 + rng() * 0.3 : 0.16 + rng() * 0.4,
        twSpeed: 0.0008 + rng() * 0.0016,
        twPhase: rng() * Math.PI * 2,
        bright,
      }
    })

    const anchors: Anchor[] = Array.from({ length: ANCHOR_COUNT }, () => ({
      x: 0.08 + rng() * 0.84,
      y: 0.08 + rng() * 0.84,
      ax: 0.02 + rng() * 0.03,
      ay: 0.02 + rng() * 0.03,
      sx: 0.00004 + rng() * 0.00006,
      sy: 0.00004 + rng() * 0.00006,
      px: rng() * Math.PI * 2,
      py: rng() * Math.PI * 2,
    }))

    let width = 0
    let height = 0

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      if (width === 0 || height === 0) return
      const t = reduced ? 6200 : now
      ctx.clearRect(0, 0, width, height)

      // Slowly-drifting constellation anchors.
      const pts = anchors.map((a) => ({
        x: (a.x + Math.sin(t * a.sx + a.px) * a.ax) * width,
        y: (a.y + Math.cos(t * a.sy + a.py) * a.ay) * height,
      }))

      // Faint lines between nearby anchors — opacity fades with distance.
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d >= LINK_DIST) continue
          const a = (1 - d / LINK_DIST) * 0.16
          ctx.strokeStyle = `rgba(${cLine[0]},${cLine[1]},${cLine[2]},${a})`
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.stroke()
        }
      }

      // Anchor nodes — small, gold, restrained.
      ctx.fillStyle = `rgba(${cNode[0]},${cNode[1]},${cNode[2]},0.5)`
      for (const pt of pts) {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Global parallax drift for the starfield.
      const driftX = Math.sin(t * 0.00002) * 14
      const driftY = Math.cos(t * 0.000016) * 10

      for (const s of stars) {
        const x = s.x * width + driftX * s.depth
        const y = s.y * height + driftY * s.depth
        const twinkle = reduced ? 1 : 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * s.twSpeed + s.twPhase))
        const alpha = s.base * twinkle
        const col = s.bright ? cBright : cDim
        if (s.bright) {
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha * 0.18})`
          ctx.beginPath()
          ctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let raf = 0
    let running = false
    let onScreen = true

    function loop(now: number) {
      draw(now)
      raf = requestAnimationFrame(loop)
    }
    function start() {
      if (running || reduced) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    function stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    function sync() {
      if (onScreen && !document.hidden) start()
      else stop()
    }

    resize()
    draw(reduced ? 6200 : performance.now())

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced || !running) draw(reduced ? 6200 : performance.now())
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true
        sync()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    const onVisibility = () => sync()
    document.addEventListener('visibilitychange', onVisibility)

    sync()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme, reduced])

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden
    />
  )
}
