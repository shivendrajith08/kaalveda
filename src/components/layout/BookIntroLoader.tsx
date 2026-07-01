import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * BookIntroLoader — the premium "unsealing" splash.
 *
 * A sealed royal tome sits on a midnight-indigo field: a thick, bound book with
 * a real spine, stacked parchment page edges and an ornate gold-filigree cover
 * clasped shut by a jewelled lock whose central medallion bears the KaalVeda
 * seal (the Ⓐ mark). On first load of a session it plays a slow, cinematic
 * sequence — the tome arrives with weight, sits sealed for a beat, the clasp
 * unlatches with a savoured glint, it *clicks* open, the heavy cover swings back
 * on its spine casting a lengthening shadow, warm light and parchment pages are
 * revealed within, then the whole overlay dissolves to the site underneath.
 *
 * Design identity follows the app's "Illuminated Manuscript" tokens: midnight
 * indigo (#0d1117), warm gold (#d4af6e), parchment (#efe5cc). Pure SVG/CSS/
 * Framer Motion — no image assets, no 3D/three.js. Dimensionality is faked with
 * CSS 3D (perspective + preserve-3d + translateZ), stacked layers and gradient
 * lighting. Only transform / opacity / background-position are animated, so it
 * stays on the compositor. Shadows that must move are separate ELEMENTS that
 * scale/fade (box-shadow itself is never animated) to avoid paint jank.
 *
 * Behaviour:
 *   • SHOW ONCE PER SESSION — gated on sessionStorage. First load plays the full
 *     sequence; any reload/navigation within the same tab session skips straight
 *     to the site (the loader renders nothing).
 *   • prefers-reduced-motion — no motion. A static seal is shown briefly and
 *     fades once (a single opacity crossfade), then unmounts.
 *   • It is a fixed, top-most overlay while it plays, then unmounts cleanly so it
 *     never blocks interaction afterward. It is a visual overlay, NOT a load gate
 *     — the app renders and hydrates underneath the entire time.
 *
 * All tunable values live in the constants block below.
 */

/* ------------------------------------------------------------------ */
/* Tunables — durations (s), easings, colours, sizes, depth, shadow.   */
/* ------------------------------------------------------------------ */

/**
 * Per-stage durations, in seconds. Tuned slow + cinematic (total ~4.4s) so each
 * beat can breathe. Tweak these to re-time the sequence.
 */
const TIMING = {
  appear: 0.9, // the tome fades + scales in, slow and weighty — it arrives
  settle: 0.5, // a long held beat, sealed and mysterious, before anything moves
  unlock: 1.1, // clasp unlatches: medallion lifts + glint sweeps deliberately
  click: 0.35, // the satisfying "it's unlocked" pause before the cover moves
  open: 1.3, // the heavy cover swings open on its 3D hinge, like a real door
  flood: 0.85, // warm light blooms from within and the overlay dissolves away

  // Reduced-motion path: a brief static seal that fades once.
  rmHold: 0.6, // how long the static seal is held
  rmFade: 0.55, // the single opacity crossfade out
} as const

/**
 * Absolute phase-start times (ms from mount), derived from TIMING. The flood
 * intentionally begins while the cover is still mid-swing (at ~half of `open`)
 * so the light appears to spill out of the opening book rather than after it.
 */
const START = {
  unlock: (TIMING.appear + TIMING.settle) * 1000,
  open: (TIMING.appear + TIMING.settle + TIMING.unlock + TIMING.click) * 1000,
  flood: (TIMING.appear + TIMING.settle + TIMING.unlock + TIMING.click + TIMING.open * 0.5) * 1000,
} as const
/** Total run before the overlay unmounts (+90ms buffer so the fade fully lands). */
const DONE_AT = START.flood + TIMING.flood * 1000 + 90
/** Reduced-motion total before unmount. */
const RM_DONE_AT = (TIMING.rmHold + TIMING.rmFade) * 1000 + 80

/** Easings. Weighted, slow-in/slow-out with a mechanical latch + a heavy swing. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_LATCH = [0.2, 0.85, 0.25, 1.12] as const // slight overshoot = a mechanical "snap"
const EASE_SWING = [0.56, 0.02, 0.24, 1] as const // slow-start gravity, soft-settle door swing

/** Colours — brand tokens via CSS vars (defined in globals.css before paint). */
const COLORS = {
  indigo: 'var(--c-bg)',
  gold: 'var(--c-gold)',
  goldSoft: 'var(--c-gold-soft)',
  goldDeep: 'var(--c-gold-deep)',
  parchment: 'var(--c-parchment)',
  lightCore: '#fff6e2', // brightest heart of the flood / interior light
} as const

/** Parchment tones for the page block / interior leaves. */
const PAPER = {
  face: 'color-mix(in srgb, var(--c-parchment) 90%, #cdb488)', // a page surface
  line: 'color-mix(in srgb, var(--c-parchment) 56%, #6f5a34)', // the gap between leaves
  warm: 'color-mix(in srgb, var(--c-parchment) 78%, #e7b46a)', // warm centre of the spread
} as const

/** Layout. Cover is portrait; height derives from the aspect ratio. */
const SIZES = {
  coverWidth: 'min(72vw, 280px)',
  coverAspect: '280 / 392', // matches the SVG viewBox below
} as const

/**
 * Depth / 3D tunables (px unless noted). Lower `perspective` = stronger
 * foreshortening as the far cover edge swings away.
 */
const DEPTH = {
  perspective: '1300px', // scene perspective — strong enough to sell the hinge
  perspectiveOriginY: '44%',
  pageZ: -7, // the parchment spread sits just behind the front cover
  backZ: -16, // the back board, furthest from the viewer
  edgeZ: -4, // page-stack edges float between cover and spread
  foreEdge: 16, // thickness of the right (fore-edge) page stack
  tailEdge: 13, // thickness of the bottom (tail-edge) page stack
  spineWidth: 16, // width of the bound spine on the left
  spinePeek: 0.55, // fraction of the spine that shows to the left of the cover
} as const

/**
 * Ground-shadow tunables. The shadow is an element that scales/fades (never an
 * animated box-shadow) so it stays cheap; it lengthens + shifts as the cover
 * swings open, selling the weight of the moving cover.
 */
const SHADOW = {
  restScaleX: 0.82,
  openScaleX: 1.24,
  restOpacity: 0.5,
  openOpacity: 0.64,
  shiftX: '-9%', // drifts toward the opening (left) side
} as const

const STORAGE_KEY = 'kaalveda:intro-shown'

type Phase = 'sealed' | 'unlocking' | 'opening' | 'flooding'

/* ------------------------------------------------------------------ */
/* Variants — every animated element keys off the shared `phase`.      */
/* ------------------------------------------------------------------ */

const rootV: Variants = {
  sealed: { opacity: 1 },
  unlocking: { opacity: 1 },
  opening: { opacity: 1 },
  // Hold the bright flood briefly, then dissolve the whole overlay to reveal
  // the site: a crossfade, never a hard cut.
  flooding: {
    opacity: [1, 1, 0],
    transition: { duration: TIMING.flood, times: [0, 0.32, 1], ease: 'easeInOut' },
  },
}

const coverV: Variants = {
  sealed: { rotateY: 0 },
  unlocking: { rotateY: 0 },
  // Swings open on the left spine. `backfaceVisibility: hidden` makes the cover
  // vanish naturally once it passes 90°, revealing the interior — no opacity
  // keyframes needed. EASE_SWING gives it slow-start gravity + a soft settle.
  opening: { rotateY: -118, transition: { duration: TIMING.open, ease: EASE_SWING } },
  flooding: { rotateY: -118 },
}

// A darkening wash over the cover's front face: as it rotates away from the
// top-left light it should fall into shadow (heavier toward the fore-edge).
const coverShadeV: Variants = {
  sealed: { opacity: 0 },
  unlocking: { opacity: 0 },
  opening: { opacity: 0.62, transition: { duration: TIMING.open, ease: EASE_SWING } },
  flooding: { opacity: 0.62 },
}

// The warm interior light within the pages — blooms as the cover opens.
const glowV: Variants = {
  sealed: { opacity: 0, scale: 0.85 },
  unlocking: { opacity: 0.16, scale: 0.9, transition: { duration: TIMING.unlock, ease: EASE_OUT } },
  opening: { opacity: 1, scale: 1.06, transition: { duration: TIMING.open, ease: EASE_OUT } },
  flooding: { opacity: 1, scale: 1.12 },
}

// The moving ground shadow beneath the tome.
const groundShadowV: Variants = {
  sealed: { scaleX: SHADOW.restScaleX, opacity: SHADOW.restOpacity, x: 0 },
  unlocking: { scaleX: SHADOW.restScaleX, opacity: SHADOW.restOpacity, x: 0 },
  opening: {
    scaleX: SHADOW.openScaleX,
    opacity: SHADOW.openOpacity,
    x: SHADOW.shiftX,
    transition: { duration: TIMING.open, ease: EASE_SWING },
  },
  flooding: {
    scaleX: SHADOW.openScaleX,
    opacity: 0,
    transition: { duration: TIMING.flood * 0.7, ease: 'easeOut' },
  },
}

const plateLeftV: Variants = {
  sealed: { x: 0 },
  unlocking: { x: -12, transition: { duration: TIMING.unlock, ease: EASE_LATCH } },
  opening: { x: -12 },
  flooding: { x: -12 },
}
const plateRightV: Variants = {
  sealed: { x: 0 },
  unlocking: { x: 12, transition: { duration: TIMING.unlock, ease: EASE_LATCH } },
  opening: { x: 12 },
  flooding: { x: 12 },
}

// The medallion is the hasp: it hinges up from its top edge (rotateX in 3D) and
// lifts as it releases — slow, then a small overshoot "snap".
const medallionV: Variants = {
  sealed: { y: 0, rotateX: 0, scale: 1 },
  unlocking: {
    y: -15,
    rotateX: -46,
    scale: 1.03,
    transition: { duration: TIMING.unlock * 0.82, ease: EASE_LATCH },
  },
  opening: { y: -15, rotateX: -46, scale: 1.03 },
  flooding: { y: -15, rotateX: -46, scale: 1.03 },
}

// A bright highlight that sweeps deliberately across the metal as it unlatches
// (GPU-friendly: only background-position moves).
const glintV: Variants = {
  sealed: { backgroundPosition: '160% 0' },
  unlocking: {
    backgroundPosition: '-60% 0',
    transition: { duration: TIMING.unlock * 0.95, ease: 'easeInOut' },
  },
  opening: { backgroundPosition: '-60% 0' },
  flooding: { backgroundPosition: '-60% 0' },
}

// The soft gold "click" pulse — held invisible while the latch lifts, then it
// flashes at the moment of the snap and fades through the "it's unlocked" beat,
// all BEFORE the cover starts to move.
const pulseV: Variants = {
  sealed: { opacity: 0, scale: 0.5 },
  unlocking: {
    opacity: [0, 0, 0.85, 0],
    scale: [0.5, 0.9, 1.85, 2.5],
    transition: {
      duration: TIMING.unlock + TIMING.click,
      times: [0, 0.5, 0.62, 1],
      ease: EASE_OUT,
    },
  },
  opening: { opacity: 0 },
  flooding: { opacity: 0 },
}

// The gold light-bloom that expands to fill the screen.
const floodV: Variants = {
  sealed: { opacity: 0, scale: 0.4 },
  unlocking: { opacity: 0, scale: 0.4 },
  opening: { opacity: 0, scale: 0.4 },
  flooding: {
    opacity: [0, 0.95, 1],
    scale: [0.45, 1.8, 3],
    transition: { duration: TIMING.flood, times: [0, 0.5, 1], ease: EASE_OUT },
  },
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** The KaalVeda seal mark (from the Logo), tinted for embossing on gold metal. */
function SealMark({ color = COLORS.indigo }: { color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-[58%] w-[58%]" aria-hidden>
      <circle cx="32" cy="32" r="20" fill="none" stroke={color} strokeWidth="1.6" opacity="0.7" />
      <circle cx="32" cy="32" r="13" fill="none" stroke={color} strokeWidth="1.1" opacity="0.45" />
      <path d="M32 20 L40 44 L32 38 L24 44 Z" fill={color} opacity="0.9" />
      <circle cx="32" cy="32" r="2.4" fill={COLORS.goldSoft} stroke={color} strokeWidth="1" />
    </svg>
  )
}

/** One inward-facing corner scroll, anchored at its outer corner (0,0). */
const cornerPaths = (
  <g stroke={COLORS.gold} fill="none" strokeLinecap="round">
    <path d="M0 52 C0 23 23 0 52 0" strokeWidth="1.4" opacity="0.75" />
    <path d="M11 52 C11 34 34 11 52 11" strokeWidth="1" opacity="0.45" />
    <path d="M0 34 q10 -3 14 -14" strokeWidth="1" opacity="0.5" />
    <circle cx="7" cy="45" r="2" fill={COLORS.gold} stroke="none" opacity="0.8" />
  </g>
)

/** Static SVG cover art: filigree frame, four corner scrolls, a top flourish. */
function CoverArt() {
  return (
    <svg
      viewBox="0 0 280 392"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Double filigree frame */}
      <rect
        x="9"
        y="9"
        width="262"
        height="374"
        rx="10"
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="1.4"
        opacity="0.55"
      />
      <rect
        x="17"
        y="17"
        width="246"
        height="358"
        rx="6"
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="0.8"
        opacity="0.3"
      />

      {/* Corner scrolls — the base group is designed for the top-left corner;
          the other three are flips of it so each faces inward. */}
      <g transform="translate(14,14)">{cornerPaths}</g>
      <g transform="translate(266,14) scale(-1,1)">{cornerPaths}</g>
      <g transform="translate(14,378) scale(1,-1)">{cornerPaths}</g>
      <g transform="translate(266,378) scale(-1,-1)">{cornerPaths}</g>

      {/* Top flourish — a small centred filigree accent above the lock */}
      <g
        stroke={COLORS.gold}
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
        transform="translate(140,74)"
      >
        <path d="M-34 0 Q-17 -12 0 0 Q17 -12 34 0" strokeWidth="1.2" />
        <circle cx="0" cy="-3" r="2.2" fill={COLORS.gold} stroke="none" />
      </g>

      {/* Bottom wordmark label */}
      <text
        x="140"
        y="352"
        textAnchor="middle"
        fill={COLORS.gold}
        opacity="0.5"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '10px',
          letterSpacing: '0.34em',
        }}
      >
        · KAALVEDA ·
      </text>
    </svg>
  )
}

/**
 * The body of the tome behind the cover — the part that gives it real depth.
 * Furthest-to-nearest: back board, the bound spine (left), the stacked page
 * edges (right fore-edge + bottom tail-edge), and the parchment spread with its
 * warm interior glow that is revealed as the cover swings away.
 */
function BookBody({ phase }: { phase: Phase }) {
  return (
    <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }} aria-hidden>
      {/* Back board — the rear cover, deepest in Z */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          transform: `translateZ(${DEPTH.backZ}px)`,
          background: 'linear-gradient(150deg, #141d29, #0a0e14)',
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${COLORS.gold} 14%, transparent)`,
        }}
      />

      {/* Bound spine on the left — a darker strip with two gilt binding bands.
          The cover hinges over it, so it reads as the seam it swings from. */}
      <div
        className="absolute rounded-l-[6px]"
        style={{
          top: '-1%',
          bottom: '-1%',
          left: `-${DEPTH.spineWidth * DEPTH.spinePeek}px`,
          width: DEPTH.spineWidth,
          transform: `translateZ(${DEPTH.pageZ}px)`,
          background: 'linear-gradient(90deg, #090d13, #16202e 55%, #0b1017)',
          boxShadow: `inset 1px 0 0 color-mix(in srgb, ${COLORS.gold} 30%, transparent), inset -2px 0 5px rgba(0,0,0,0.55), -6px 0 15px -6px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="absolute inset-x-0 top-[24%] h-[2px]"
          style={{ background: `color-mix(in srgb, ${COLORS.gold} 45%, transparent)` }}
        />
        <div
          className="absolute inset-x-0 top-[70%] h-[2px]"
          style={{ background: `color-mix(in srgb, ${COLORS.gold} 45%, transparent)` }}
        />
      </div>

      {/* Right fore-edge — stacked page ends give the book its thickness. The
          repeating gradient reads as many leaves; the overlaid shading rounds
          the block; it peeks a hair beyond the cover so it's seen when closed. */}
      <div
        className="absolute rounded-r-[4px]"
        style={{
          top: '3%',
          bottom: '3%',
          right: `-${DEPTH.foreEdge - 2}px`,
          width: DEPTH.foreEdge,
          transform: `translateZ(${DEPTH.edgeZ}px)`,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.30), rgba(255,255,255,0.20) 46%, rgba(0,0,0,0.34)), repeating-linear-gradient(90deg, ${PAPER.line} 0 0.6px, ${PAPER.face} 0.6px 2.4px)`,
          boxShadow: '0 6px 12px -6px rgba(0,0,0,0.55)',
        }}
      />

      {/* Bottom tail-edge — the same stacked leaves seen from below */}
      <div
        className="absolute rounded-b-[4px]"
        style={{
          left: '3%',
          right: '3%',
          bottom: `-${DEPTH.tailEdge - 2}px`,
          height: DEPTH.tailEdge,
          transform: `translateZ(${DEPTH.edgeZ}px)`,
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.32), rgba(255,255,255,0.18) 46%, rgba(0,0,0,0.32)), repeating-linear-gradient(0deg, ${PAPER.line} 0 0.6px, ${PAPER.face} 0.6px 2.4px)`,
          boxShadow: '0 8px 14px -8px rgba(0,0,0,0.55)',
        }}
      />

      {/* The parchment spread — the open interior. Sits just behind the cover
          and is revealed as it swings away: two warm pages, a shadowed centre
          gutter, and the glow that blooms out of the book. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-lg"
        style={{
          transform: `translateZ(${DEPTH.pageZ}px)`,
          background: `linear-gradient(90deg, ${PAPER.face}, ${PAPER.warm} 50%, ${PAPER.face})`,
          boxShadow: `inset 0 0 40px rgba(90,60,20,0.28), inset 0 0 0 1px color-mix(in srgb, ${COLORS.gold} 20%, transparent)`,
        }}
      >
        {/* Centre gutter shadow — where the two leaves meet at the spine */}
        <div
          className="absolute inset-y-0 left-1/2 w-[12%] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(58% 100% at 50% 50%, rgba(60,40,15,0.42), transparent 72%)',
          }}
        />
        {/* Warm interior glow — blooms from within as the tome opens */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 46%, ${COLORS.lightCore}, ${COLORS.goldSoft} 30%, transparent 74%)`,
            mixBlendMode: 'screen',
          }}
          variants={glowV}
          animate={phase}
        />
      </div>
    </div>
  )
}

/** The clasp / lock: two beveled metal plates and the seal medallion (the hasp). */
function Clasp({ phase }: { phase: Phase }) {
  const plate =
    'absolute top-1/2 h-10 w-[26%] -translate-y-1/2 overflow-hidden rounded-md will-change-transform'
  const plateStyle = {
    background: `linear-gradient(180deg, ${COLORS.goldSoft}, ${COLORS.gold} 46%, ${COLORS.goldDeep})`,
    // Beveled metal: bright top edge, dark undercut, a cast drop below.
    boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.32), inset 1px 0 2px rgba(255,255,255,0.25), 0 6px 14px -6px rgba(0,0,0,0.6)`,
  } as const

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
      style={{ height: 108, perspective: '620px' }}
    >
      {/* Metal plates that part on unlatch. A soft specular band across the top
          third of each plate makes the metal read as convex, not flat. */}
      <motion.div className={plate} style={{ ...plateStyle, left: '13%' }} variants={plateLeftV} animate={phase}>
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }}
        />
      </motion.div>
      <motion.div className={plate} style={{ ...plateStyle, right: '13%' }} variants={plateRightV} animate={phase}>
        <div
          className="absolute inset-x-0 top-0 h-1/3"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }}
        />
      </motion.div>

      {/* Glint sweeping across the metal band (behind the medallion) */}
      <motion.div
        className="absolute left-[13%] right-[13%] top-1/2 h-10 -translate-y-1/2 overflow-hidden rounded-md"
        style={{
          backgroundImage:
            'linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.55) 50%, transparent 58%)',
          backgroundSize: '260% 100%',
          mixBlendMode: 'screen',
        }}
        variants={glintV}
        animate={phase}
      />

      {/* The seal medallion — the hasp. Hinges up from its top edge and reads as
          a domed, embossed disc: radial body, a beveled bezel ring and a small
          specular catch-light. */}
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full will-change-transform"
        style={{
          transformOrigin: 'center top',
          transformStyle: 'preserve-3d',
          background: `radial-gradient(circle at 36% 30%, ${COLORS.goldSoft}, ${COLORS.gold} 52%, ${COLORS.goldDeep})`,
          border: `1px solid ${COLORS.goldDeep}`,
          boxShadow: `inset 0 3px 4px rgba(255,255,255,0.5), inset 0 -4px 7px rgba(0,0,0,0.34), 0 0 0 5px color-mix(in srgb, ${COLORS.gold} 16%, transparent), 0 12px 28px -8px rgba(0,0,0,0.72)`,
        }}
        variants={medallionV}
        animate={phase}
      >
        {/* Beveled inner bezel ring — makes the disc read as raised metal */}
        <div
          className="pointer-events-none absolute inset-[7px] rounded-full"
          style={{
            border: `1px solid color-mix(in srgb, ${COLORS.goldDeep} 70%, #000 12%)`,
            boxShadow:
              'inset 0 1.5px 2px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.4)',
          }}
        />
        {/* Specular catch-light, upper-left */}
        <div
          className="pointer-events-none absolute left-[22%] top-[18%] h-3.5 w-5 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.75), transparent 68%)' }}
        />
        <SealMark />
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/** Decide once, synchronously, whether this is the first load of the session. */
function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) == null
  } catch {
    return false
  }
}

export function BookIntroLoader() {
  const reduced = useReducedMotion()
  const [show] = useState(shouldShowIntro)
  const [phase, setPhase] = useState<Phase>('sealed')
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!show) return
    // Mark the session immediately so a reload/navigation won't replay it.
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* private mode / storage disabled — the loader simply plays this once */
    }

    const timers: number[] = []
    if (reduced) {
      // No motion: hold the static seal, then unmount after the single fade.
      timers.push(window.setTimeout(() => setGone(true), RM_DONE_AT))
    } else {
      timers.push(window.setTimeout(() => setPhase('unlocking'), START.unlock))
      timers.push(window.setTimeout(() => setPhase('opening'), START.open))
      timers.push(window.setTimeout(() => setPhase('flooding'), START.flood))
      timers.push(window.setTimeout(() => setGone(true), DONE_AT))
    }
    return () => timers.forEach(clearTimeout)
  }, [show, reduced])

  if (!show || gone) return null

  /* ---- Reduced motion: a static, dimensional seal that fades once. ---- */
  if (reduced) {
    return (
      <motion.div
        className="fixed inset-0 z-[200] grid place-items-center overflow-hidden"
        style={{ background: COLORS.indigo }}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0] }}
        transition={{
          duration: TIMING.rmHold + TIMING.rmFade,
          times: [0, TIMING.rmHold / (TIMING.rmHold + TIMING.rmFade), 1],
          ease: 'easeInOut',
        }}
        aria-hidden
      >
        <div
          className="grid h-24 w-24 place-items-center rounded-full"
          style={{
            background: `radial-gradient(circle at 36% 30%, ${COLORS.goldSoft}, ${COLORS.gold} 52%, ${COLORS.goldDeep})`,
            border: `1px solid ${COLORS.goldDeep}`,
            boxShadow: `inset 0 3px 4px rgba(255,255,255,0.5), inset 0 -4px 7px rgba(0,0,0,0.34), 0 0 0 6px color-mix(in srgb, ${COLORS.gold} 14%, transparent), 0 12px 28px -8px rgba(0,0,0,0.7)`,
          }}
        >
          <SealMark />
        </div>
      </motion.div>
    )
  }

  /* ---- Full cinematic sequence. ---- */
  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: COLORS.indigo }}
      variants={rootV}
      initial="sealed"
      animate={phase}
      aria-hidden
    >
      {/* Atmosphere behind the tome */}
      <div className="starfield absolute inset-0 opacity-[0.3]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 45%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Perspective scene — holds the book */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ perspective: DEPTH.perspective, perspectiveOrigin: `50% ${DEPTH.perspectiveOriginY}` }}
      >
        <motion.div
          className="relative"
          style={{
            width: SIZES.coverWidth,
            aspectRatio: SIZES.coverAspect,
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: TIMING.appear, ease: EASE_OUT }}
        >
          {/* Ground shadow — an element (not an animated box-shadow) that
              lengthens + drifts as the cover swings, selling its weight. */}
          <motion.div
            className="absolute left-0 right-0"
            style={{
              top: '99%',
              height: '17%',
              background:
                'radial-gradient(60% 100% at 50% 0%, rgba(0,0,0,0.55), rgba(0,0,0,0.26) 46%, transparent 78%)',
              transformOrigin: '50% 0%',
            }}
            variants={groundShadowV}
            animate={phase}
          />

          {/* The tome body — spine, page-block thickness and interior pages */}
          <BookBody phase={phase} />

          {/* The cover — swings open on the left spine */}
          <motion.div
            className="absolute inset-0 rounded-xl will-change-transform"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              background: `linear-gradient(152deg, #16202e, #0c1119 58%, #0a0e14)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${COLORS.gold} 22%, transparent), 0 40px 90px -30px rgba(0,0,0,0.85), 0 0 60px -18px color-mix(in srgb, ${COLORS.gold} 30%, transparent)`,
            }}
            variants={coverV}
            animate={phase}
          >
            <CoverArt />

            {/* Directional sheen — warm light from the top-left, shadow toward
                the bottom-right, so the cover reads as a lit surface. */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background:
                  'linear-gradient(125deg, rgba(255,246,226,0.14), transparent 34%, transparent 66%, rgba(0,0,0,0.22))',
              }}
            />

            <Clasp phase={phase} />

            {/* Shade wash — deepens as the face turns away from the light while
                the cover swings open (heavier toward the fore-edge). */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.46) 100%)',
              }}
              variants={coverShadeV}
              animate={phase}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* The "click" pulse, centred on the lock */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          className="h-40 w-40 rounded-full"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${COLORS.goldSoft} 85%, transparent), transparent 68%)`,
            mixBlendMode: 'screen',
          }}
          variants={pulseV}
          animate={phase}
        />
      </div>

      {/* Gold flood — expands to fill the screen as the book opens, then the
          whole overlay dissolves (via rootV) to reveal the site. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 47%, ${COLORS.lightCore}, ${COLORS.goldSoft} 30%, ${COLORS.gold} 56%, transparent 76%)`,
          transformOrigin: '50% 47%',
          mixBlendMode: 'screen',
        }}
        variants={floodV}
        animate={phase}
      />
    </motion.div>
  )
}
