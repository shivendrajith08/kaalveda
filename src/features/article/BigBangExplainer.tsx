import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { clamp, hashUnit } from '@/lib/utils'

/**
 * BigBangExplainer — a self-contained, code-driven "video" for the
 * `the-big-bang` article. Six cosmic phases auto-advance on a play/pause
 * timeline, each narrated with on-screen text. Everything is CSS / SVG /
 * Framer Motion — no video files, no canvas, no external assets.
 *
 * The frame keeps its own fixed midnight palette regardless of the app theme,
 * because it depicts deep space; a parchment cosmos would be wrong.
 */

/* Fixed cosmic palette — mirrors the dark tokens, but pinned so the scene
 * stays midnight even under the light theme. */
const SKY = '#0d1117'
const GOLD = '#d4af6e'
const GOLD_SOFT = '#e7c98c'
const GOLD_DEEP = '#a9824a'
const CREAM = '#ece3cf'
const glow = (a: number) => `rgba(212, 175, 110, ${a})`

const PHASE_MS = 6000

interface Phase {
  id: string
  title: string
  text: string
}

const PHASES: Phase[] = [
  {
    id: 'singularity',
    title: 'Singularity',
    text: '13.8 billion years ago, everything was smaller than an atom.',
  },
  {
    id: 'inflation',
    title: 'Inflation',
    text: 'In a fraction of a second, space itself exploded outward.',
  },
  {
    id: 'first-light',
    title: 'First Light',
    text: '380,000 years later, light could finally travel freely. The universe became transparent.',
  },
  {
    id: 'first-stars',
    title: 'First Stars',
    text: 'The first stars ignited, forging the elements that would become everything else.',
  },
  {
    id: 'galaxies',
    title: 'Galaxies',
    text: 'Gravity pulled stars into galaxies — vast islands of light across the dark.',
  },
  {
    id: 'today',
    title: 'Today',
    text: '13.8 billion years later, on a small planet around an ordinary star, someone is reading this.',
  },
]

const LAST = PHASES.length - 1

/** Deterministic 0..1 for stable, SSR-safe particle layouts. */
const rnd = (key: string) => hashUnit(`bigbang-${key}`)

export function BigBangExplainer() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)

  /** Elapsed ms inside the current phase (ref so the rAF loop never leaks state). */
  const elapsed = useRef(0)
  /** 0..1 progress within the current phase — a motion value, so the scrub bar
   *  updates every frame without re-rendering the whole component. */
  const progress = useMotionValue(0)

  /* Auto-advance ticker. Re-created on every phase/play change, and torn down
   * on unmount or pause — requestAnimationFrame is always cancelled. */
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      elapsed.current = Math.min(PHASE_MS, elapsed.current + (now - last))
      last = now
      progress.set(elapsed.current / PHASE_MS)

      if (elapsed.current >= PHASE_MS) {
        if (phase >= LAST) {
          setPlaying(false)
          setEnded(true)
          return
        }
        elapsed.current = 0
        progress.set(0)
        setPhase(phase + 1)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, phase, progress])

  const goTo = (target: number) => {
    elapsed.current = 0
    progress.set(0)
    setEnded(false)
    setPhase(clamp(target, 0, LAST))
  }

  const play = () => {
    if (ended) {
      elapsed.current = 0
      progress.set(0)
      setEnded(false)
      setPhase(0)
    }
    setStarted(true)
    setPlaying(true)
  }

  const toggle = () => (playing ? setPlaying(false) : play())

  const current = PHASES[phase]

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      <div
        role="group"
        aria-label="The Big Bang — animated explainer"
        className="relative aspect-[16/9] w-full select-none overflow-hidden"
        style={{ backgroundColor: SKY }}
      >
        {/* Persistent depth: a faint central nebula glow + vignette. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(120% 90% at 50% 48%, ${glow(0.06)}, transparent 60%)` }}
          aria-hidden
        />

        {/* The cosmic scene for the current phase. */}
        <AnimatePresence>
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 0.7, ease: 'easeInOut' }}
          >
            <Scene phase={phase} reduced={reduced} />
          </motion.div>
        </AnimatePresence>

        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(130% 100% at 50% 0%, transparent 52%, rgba(0,0,0,0.45) 100%)' }}
          aria-hidden
        />

        {/* Narration — large Fraunces, centred in the lower third. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] flex justify-center px-6 sm:bottom-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="max-w-xl text-center"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0.25 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="label mb-2"
                style={{ color: GOLD, letterSpacing: '0.22em' }}
              >
                {current.title}
              </p>
              <p
                className="text-balance font-display text-xl font-medium leading-snug sm:text-2xl"
                style={{ color: CREAM, textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
              >
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Poster CTA — a single big play button before the first run. */}
        {!started && (
          <div className="absolute inset-0 grid place-items-center">
            <button
              type="button"
              onClick={play}
              aria-label="Play the Big Bang explainer"
              className="grid h-16 w-16 place-items-center rounded-full backdrop-blur transition-transform hover:scale-105"
              style={{ background: glow(0.16), border: `1px solid ${GOLD_DEEP}`, color: GOLD_SOFT }}
            >
              <Play size={26} className="ml-1" />
            </button>
          </div>
        )}

        {/* Controls — overlaid at the bottom with a legibility scrim. */}
        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
        >
          {/* Phase dots double as a chapter scrubber. */}
          <div className="mb-3 flex items-center justify-center gap-2">
            {PHASES.map((p, i) => {
              const state = i < phase ? 'past' : i === phase ? 'current' : 'future'
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to phase ${i + 1}: ${p.title}`}
                  aria-current={state === 'current'}
                  className="rounded-full transition-all"
                  style={{
                    width: state === 'current' ? 22 : 8,
                    height: 8,
                    background:
                      state === 'future' ? 'rgba(236,227,207,0.22)' : state === 'past' ? glow(0.55) : GOLD,
                    boxShadow: state === 'current' ? `0 0 10px ${glow(0.7)}` : 'none',
                  }}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-5">
            <ControlButton
              label="Previous phase"
              onClick={() => goTo(phase - 1)}
              disabled={phase === 0}
            >
              <SkipBack size={18} />
            </ControlButton>

            <button
              type="button"
              onClick={toggle}
              aria-label={ended ? 'Replay' : playing ? 'Pause' : 'Play'}
              className="grid h-12 w-12 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
                color: '#1b150a',
                border: `1px solid ${GOLD_DEEP}`,
                boxShadow: `0 8px 24px -10px ${glow(0.6)}`,
              }}
            >
              {ended ? <RotateCcw size={20} /> : playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <ControlButton
              label="Next phase"
              onClick={() => goTo(phase + 1)}
              disabled={phase === LAST}
            >
              <SkipForward size={18} />
            </ControlButton>
          </div>
        </div>

        {/* Continuous within-phase progress, pinned to the bottom edge. */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] w-full origin-left"
          style={{ scaleX: progress, background: `linear-gradient(90deg, ${GOLD_DEEP}, ${GOLD_SOFT})` }}
          aria-hidden
        />

        {/* Screen-reader status — announces the active phase. */}
        <p className="sr-only" aria-live="polite">
          Phase {phase + 1} of {PHASES.length}: {current.title}. {current.text}
        </p>
      </div>

      <figcaption className="space-y-1.5 p-4">
        <p className="label text-faint">Watch · Animated sequence</p>
        <p className="font-display text-base font-semibold text-fg">
          From a single point to you — 13.8 billion years
        </p>
        <p className="text-sm leading-relaxed text-muted">
          A code-drawn journey through the eras of the cosmos: singularity, inflation, first light, first
          stars, galaxies, and the small blue world reading this.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-faint">
          <span className="label">~0:36</span>
          <span className="label">KaalVeda Atlas</span>
        </div>
      </figcaption>
    </figure>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      style={{ color: CREAM, border: '1px solid rgba(236,227,207,0.25)' }}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Scenes — one per phase. Each fills the frame and honours reduced     */
/* motion (static composition, no continuous animation).               */
/* ------------------------------------------------------------------ */

function Scene({ phase, reduced }: { phase: number; reduced: boolean }) {
  switch (phase) {
    case 0:
      return <Singularity reduced={reduced} />
    case 1:
      return <Inflation reduced={reduced} />
    case 2:
      return <FirstLight reduced={reduced} />
    case 3:
      return <FirstStars reduced={reduced} />
    case 4:
      return <Galaxies reduced={reduced} />
    default:
      return <Today reduced={reduced} />
  }
}

function Singularity({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {!reduced && (
        <motion.span
          className="absolute rounded-full"
          style={{ width: 120, height: 120, border: `1px solid ${glow(0.3)}` }}
          animate={{ scale: [0.5, 1.4, 0.5], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.span
        className="block rounded-full"
        style={{
          width: 18,
          height: 18,
          background: `radial-gradient(circle at 45% 40%, ${GOLD_SOFT}, ${GOLD} 55%, ${GOLD_DEEP})`,
          boxShadow: `0 0 26px 8px ${glow(0.7)}, 0 0 60px 18px ${glow(0.25)}`,
        }}
        animate={reduced ? { opacity: 1 } : { scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
        transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function Inflation({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 50%, ${glow(0.55)} 0%, ${glow(0.12)} 30%, transparent 62%)` }}
      />
    )
  }
  const rings = [0, 0.6, 1.2, 1.8]
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <motion.span
        className="absolute rounded-full"
        style={{ width: 60, height: 60, background: `radial-gradient(circle, ${GOLD_SOFT}, ${glow(0.4)} 60%, transparent 72%)` }}
        animate={{ scale: [0, 9], opacity: [1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />
      {rings.map((delay) => (
        <motion.span
          key={delay}
          className="absolute rounded-full"
          style={{ width: 50, height: 50, border: `1.5px solid ${glow(0.6)}` }}
          animate={{ scale: [0, 16], opacity: [0.85, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay }}
        />
      ))}
    </div>
  )
}

function FirstLight({ reduced }: { reduced: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => {
        const ang = rnd(`fl-a-${i}`) * Math.PI * 2
        const r0 = 4 + rnd(`fl-r0-${i}`) * 26
        const r1 = 50 + rnd(`fl-r1-${i}`) * 200
        const size = 1.5 + rnd(`fl-s-${i}`) * 2.6
        return {
          i,
          size,
          x0: Math.cos(ang) * r0,
          y0: Math.sin(ang) * r0,
          x1: Math.cos(ang) * r1,
          y1: Math.sin(ang) * r1,
          delay: rnd(`fl-d-${i}`) * 1.6,
          dur: 4 + rnd(`fl-du-${i}`) * 4,
        }
      }),
    [],
  )

  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <div
        className="absolute h-2/3 w-2/3 rounded-full"
        style={{ background: `radial-gradient(circle, ${glow(0.12)}, transparent 70%)` }}
        aria-hidden
      />
      {particles.map((p) => (
        <motion.span
          key={p.i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            backgroundColor: GOLD_SOFT,
            boxShadow: `0 0 6px ${glow(0.6)}`,
          }}
          initial={reduced ? false : { x: p.x0, y: p.y0, opacity: 0 }}
          animate={
            reduced
              ? { x: p.x1, y: p.y1, opacity: 0.55 }
              : { x: [p.x0, p.x1], y: [p.y0, p.y1], opacity: [0, 0.9, 0.45] }
          }
          transition={reduced ? { duration: 0 } : { duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function FirstStars({ reduced }: { reduced: boolean }) {
  const clusters = useMemo(() => {
    const centers = [
      { x: -150, y: -34 },
      { x: -44, y: 58 },
      { x: 70, y: -64 },
      { x: 158, y: 26 },
      { x: 12, y: -8 },
    ]
    return centers.map((c, ci) => ({
      ...c,
      dots: Array.from({ length: 7 }, (_, i) => {
        const ang = rnd(`fs-${ci}-a-${i}`) * Math.PI * 2
        const rad = 5 + rnd(`fs-${ci}-r-${i}`) * 20
        return {
          i,
          ex: c.x + Math.cos(ang) * rad,
          ey: c.y + Math.sin(ang) * rad,
          sx: rnd(`fs-${ci}-sx-${i}`) * 260 - 130,
          sy: rnd(`fs-${ci}-sy-${i}`) * 200 - 100,
          size: 1.6 + rnd(`fs-${ci}-s-${i}`) * 2,
          delay: rnd(`fs-${ci}-d-${i}`) * 0.6,
        }
      }),
    }))
  }, [])

  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      {clusters.map((cl, ci) => (
        <div key={ci} className="absolute" style={{ left: '50%', top: '50%' }}>
          {/* glowing cluster core */}
          <motion.span
            className="absolute rounded-full"
            style={{
              width: 10,
              height: 10,
              left: cl.x - 5,
              top: cl.y - 5,
              background: `radial-gradient(circle, ${GOLD_SOFT}, ${GOLD} 60%, transparent 75%)`,
              boxShadow: `0 0 16px 4px ${glow(0.5)}`,
            }}
            animate={reduced ? { opacity: 1 } : { scale: [0.9, 1.25, 0.9], opacity: [0.8, 1, 0.8] }}
            transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: ci * 0.3 }}
          />
          {cl.dots.map((d) => (
            <motion.span
              key={d.i}
              className="absolute rounded-full"
              style={{
                width: d.size,
                height: d.size,
                marginLeft: -d.size / 2,
                marginTop: -d.size / 2,
                backgroundColor: GOLD_SOFT,
                boxShadow: `0 0 5px ${glow(0.5)}`,
              }}
              initial={reduced ? false : { x: d.sx, y: d.sy, opacity: 0 }}
              animate={{ x: d.ex, y: d.ey, opacity: reduced ? 0.85 : [0, 0.9] }}
              transition={reduced ? { duration: 0 } : { duration: 2.4, delay: d.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Galaxies({ reduced }: { reduced: boolean }) {
  const points = useMemo(() => {
    const arms = 2
    const perArm = 64
    const pts: { x: number; y: number; size: number; op: number }[] = []
    for (let a = 0; a < arms; a++) {
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm
        const theta = a * Math.PI + t * Math.PI * 3.1
        const r = 12 + t * 150
        const jitter = (rnd(`g-${a}-${i}`) - 0.5) * 14
        pts.push({
          x: Math.cos(theta) * r + Math.cos(theta + 1.3) * jitter,
          y: Math.sin(theta) * r + Math.sin(theta + 1.3) * jitter,
          size: 1.2 + (1 - t) * 2.4,
          op: 0.3 + (1 - t) * 0.55,
        })
      }
    }
    return pts
  }, [])

  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <motion.div
        className="absolute"
        style={{ left: '50%', top: '50%' }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={reduced ? undefined : { duration: 80, repeat: Infinity, ease: 'linear' }}
      >
        {/* bright galactic core */}
        <span
          className="absolute rounded-full"
          style={{
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            background: `radial-gradient(circle, ${GOLD_SOFT}, ${GOLD} 55%, transparent 78%)`,
            boxShadow: `0 0 28px 8px ${glow(0.55)}`,
          }}
        />
        {points.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              transform: `translate(${p.x}px, ${p.y}px)`,
              backgroundColor: GOLD_SOFT,
              opacity: p.op,
              boxShadow: `0 0 4px ${glow(0.4)}`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function Today({ reduced }: { reduced: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        i,
        x: rnd(`t-x-${i}`) * 100,
        y: rnd(`t-y-${i}`) * 100,
        size: 0.6 + rnd(`t-s-${i}`) * 1.6,
        bright: rnd(`t-b-${i}`) > 0.85,
        delay: rnd(`t-d-${i}`) * 5,
      })),
    [],
  )

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={reduced ? false : { scale: 1.25, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {stars.map((s) => (
        <motion.span
          key={s.i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.bright ? GOLD_SOFT : CREAM,
            opacity: s.bright ? 0.8 : 0.32,
            boxShadow: s.bright ? `0 0 6px ${glow(0.5)}` : 'none',
          }}
          animate={reduced || !s.bright ? undefined : { opacity: [0.5, 0.9, 0.5] }}
          transition={reduced ? undefined : { duration: 3 + s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* The pale blue dot — one highlighted world. */}
      <div className="absolute" style={{ left: '57%', top: '47%' }}>
        {!reduced && (
          <motion.span
            className="absolute rounded-full"
            style={{ width: 30, height: 30, marginLeft: -15, marginTop: -15, border: `1px solid ${glow(0.5)}` }}
            animate={{ scale: [1, 2.1], opacity: [0.7, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span
          className="absolute rounded-full"
          style={{
            width: 7,
            height: 7,
            marginLeft: -3.5,
            marginTop: -3.5,
            background: `radial-gradient(circle, ${GOLD_SOFT}, ${GOLD})`,
            boxShadow: `0 0 12px 3px ${glow(0.8)}`,
          }}
        />
      </div>
    </motion.div>
  )
}
