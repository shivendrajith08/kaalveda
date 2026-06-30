import { motion } from 'framer-motion'

/**
 * SageFigure — an illustrated robed rishi, drawn entirely in SVG.
 *
 * Palette is pinned to KaalVeda's two-colour system: midnight indigo for the
 * robe, warm gold for every line and trim. The "skin" and "wood" tones are not
 * a third hue — they are the gold family pushed toward brown (gold-deep is
 * already a warm `#a9824a`), so the whole figure reads as indigo-and-gold.
 * The palette is fixed (not theme-reactive) for the same reason the Big Bang
 * scene is: a robed sage should look the same under parchment or midnight.
 *
 * Every moving part is its own `<motion.g>` so it can animate independently.
 * Pivots use `transform-box: view-box`, which resolves `transform-origin`
 * against the SVG's own coordinate space — letting the head and topknot share
 * one neck pivot and tilt together while staying distinct groups.
 */

const INDIGO = '#1f2c42'
const GOLD = '#d4af6e'
const GOLD_SOFT = '#e7c98c'
const GOLD_DEEP = '#a9824a'
const glow = (a: number) => `rgba(212, 175, 110, ${a})`

export type SagePose = 'idle' | 'greeting' | 'pointing' | 'curious' | 'idleLong' | 'celebration'

/** A `transform-origin` in viewBox units — shared so grouped parts pivot as one. */
const pivot = (x: number, y: number) =>
  ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` }) as const

export function SageFigure({ pose, reduced }: { pose: SagePose; reduced: boolean }) {
  const still = reduced
  const instant = { duration: 0 } as const
  const spring = { type: 'spring', stiffness: 140, damping: 17 } as const

  const greeting = pose === 'greeting' && !still

  // Head + topknot: tilt as a state, nod once on greeting. They share a pivot.
  const headSteady = pose === 'curious' ? 8 : pose === 'idleLong' ? 5 : 0
  const headAnim = greeting ? { rotate: [0, 7, 0] } : { rotate: headSteady }
  const headTrans = greeting ? { duration: 1.2, ease: 'easeInOut' } : still ? instant : spring

  // Staff: tilt up to gesture (pointing), raise high on celebration, lean when idle-long.
  const staffRotate =
    pose === 'pointing' ? -15 : pose === 'celebration' ? -26 : pose === 'idleLong' ? 7 : 0

  // Robe: a slow ambient sway — the only continuous body motion at rest.
  const robeAnim = still || pose === 'celebration' ? { rotate: 0 } : { rotate: [-1.2, 1.2, -1.2] }
  const robeTrans = still ? instant : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }

  // Sleeves: a fainter counter-sway for cloth depth.
  const sleeveAnim = still || pose === 'celebration' ? { rotate: 0 } : { rotate: [1.4, -1.4, 1.4] }
  const sleeveTrans = still ? instant : { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }

  // Halo: a soft pulse, blooming bright on celebration.
  const haloAnim =
    pose === 'celebration' && !still
      ? { scale: [1, 1.32, 1.08, 1.3, 1], opacity: [0.7, 1, 0.85, 1, 0.7] }
      : still
        ? { scale: 1, opacity: 0.7 }
        : { opacity: [0.55, 0.85, 0.55] }
  const haloTrans =
    pose === 'celebration' && !still
      ? { duration: 2.4, ease: 'easeInOut' }
      : still
        ? instant
        : { duration: 5, repeat: Infinity, ease: 'easeInOut' }

  // Whole-figure breathing — gentle scale loop, paused under reduced motion.
  const breathe = still ? { scale: 1 } : { scale: [1, 1.02, 1] }
  const breatheTrans = still ? instant : { duration: 4, repeat: Infinity, ease: 'easeInOut' }

  return (
    <motion.div
      initial={{ opacity: 0, y: still ? 0 : 10 }}
      animate={{ opacity: 1, y: pose === 'idleLong' ? 5 : 0 }}
      transition={{ duration: still ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={breathe}
        transition={breatheTrans}
        style={{ willChange: 'transform' }}
      >
        <svg
          width={70}
          height={88}
          viewBox="0 0 140 176"
          fill="none"
          className="block overflow-visible"
          role="img"
          aria-label="Sage guide"
        >
          <defs>
            <linearGradient id="sg-robe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INDIGO} />
              <stop offset="45%" stopColor="#162032" />
              <stop offset="100%" stopColor="#0d1117" />
            </linearGradient>
            <linearGradient id="sg-skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c79a5e" />
              <stop offset="55%" stopColor="#a9824a" />
              <stop offset="100%" stopColor="#7a5d33" />
            </linearGradient>
            <linearGradient id="sg-knot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27344c" />
              <stop offset="100%" stopColor="#0d1117" />
            </linearGradient>
            <linearGradient id="sg-beard" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d7cbac" />
              <stop offset="100%" stopColor="#9a8a64" />
            </linearGradient>
            <linearGradient id="sg-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b9925a" />
              <stop offset="100%" stopColor="#5e4626" />
            </linearGradient>
            <radialGradient id="sg-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={glow(0.55)} />
              <stop offset="45%" stopColor={glow(0.22)} />
              <stop offset="100%" stopColor={glow(0)} />
            </radialGradient>
            <radialGradient id="sg-orb" cx="38%" cy="34%" r="70%">
              <stop offset="0%" stopColor={GOLD_SOFT} />
              <stop offset="60%" stopColor={GOLD} />
              <stop offset="100%" stopColor={GOLD_DEEP} />
            </radialGradient>
            <radialGradient id="sg-orb-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={glow(0.6)} />
              <stop offset="100%" stopColor={glow(0)} />
            </radialGradient>
          </defs>

          {/* Grounding shadow */}
          <ellipse cx="70" cy="170" rx="33" ry="5" fill="rgba(0,0,0,0.32)" />

          {/* Halo — soft gold bloom behind the head */}
          <motion.g data-part="halo" style={pivot(70, 44)} animate={haloAnim} transition={haloTrans}>
            <circle cx="70" cy="44" r="40" fill="url(#sg-halo)" />
          </motion.g>

          {/* Robe — layered body with gradient depth, folds, sash and hem */}
          <motion.g data-part="robe" style={pivot(70, 62)} animate={robeAnim} transition={robeTrans}>
            <path
              d="M70 60 C 54 62, 47 70, 45 86 C 41 110, 37 140, 34 162 L 106 162 C 103 140, 99 110, 95 86 C 93 70, 86 62, 70 60 Z"
              fill="url(#sg-robe)"
              stroke={GOLD_DEEP}
              strokeWidth="0.9"
            />
            {/* fold lines, fanning from the collar with varied weight + opacity */}
            <path d="M70 66 L66 160" stroke={GOLD} strokeWidth="0.8" opacity="0.5" />
            <path d="M70 66 L51 158" stroke={GOLD} strokeWidth="0.7" opacity="0.3" />
            <path d="M70 66 L89 158" stroke={GOLD} strokeWidth="0.7" opacity="0.3" />
            <path d="M70 66 L75 160" stroke={GOLD} strokeWidth="0.6" opacity="0.22" />
            <path d="M70 66 L42 150" stroke={GOLD} strokeWidth="0.5" opacity="0.18" />
            {/* lit edge for depth */}
            <path d="M58 70 C 50 92, 46 124, 44 158" stroke={GOLD_SOFT} strokeWidth="0.6" opacity="0.28" />
            {/* collar V */}
            <path d="M60 62 L70 80 L80 62" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
            {/* sash / belt with a knot and hanging ties */}
            <path
              d="M45 104 Q70 113 95 104 L95 113 Q70 122 45 113 Z"
              fill={GOLD_DEEP}
              opacity="0.92"
            />
            <path d="M45 104 Q70 113 95 104" stroke={GOLD_SOFT} strokeWidth="1" opacity="0.7" fill="none" />
            <circle cx="70" cy="112" r="3.1" fill={GOLD} />
            <path d="M70 115 L66 127 M70 115 L74 127" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" />
            {/* hem trim */}
            <path d="M34 162 L106 162" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
          </motion.g>

          {/* Left sleeve — draping cloth, hand resting */}
          <motion.g data-part="leftSleeve" style={pivot(54, 66)} animate={sleeveAnim} transition={sleeveTrans}>
            <path
              d="M58 66 C 46 70, 40 88, 43 104 C 47 102, 52 100, 56 100 C 54 88, 55 74, 60 67 Z"
              fill="url(#sg-robe)"
              stroke={GOLD_DEEP}
              strokeWidth="0.7"
            />
            <path d="M46 82 Q49 94 52 102" stroke={GOLD} strokeWidth="0.6" opacity="0.4" fill="none" />
            <ellipse cx="49" cy="104" rx="4.6" ry="3.6" fill="url(#sg-skin)" stroke={GOLD_DEEP} strokeWidth="0.4" />
          </motion.g>

          {/* Right sleeve — the arm that holds the staff */}
          <motion.g data-part="rightSleeve" style={pivot(90, 66)}>
            <path
              d="M82 66 C 94 70, 100 86, 98 100 C 94 98, 90 97, 87 97 C 86 86, 80 74, 80 67 Z"
              fill="url(#sg-robe)"
              stroke={GOLD_DEEP}
              strokeWidth="0.7"
            />
            <path d="M92 82 Q93 92 92 98" stroke={GOLD} strokeWidth="0.6" opacity="0.4" fill="none" />
            <ellipse cx="96" cy="98" rx="4.6" ry="3.7" fill="url(#sg-skin)" stroke={GOLD_DEEP} strokeWidth="0.4" />
          </motion.g>

          {/* Head — neck, gradient face, brow shadow, serene almond eyes, beard, tilak */}
          <motion.g data-part="head" style={pivot(70, 60)} animate={headAnim} transition={headTrans}>
            <rect x="64.5" y="55" width="11" height="9" rx="3" fill="url(#sg-skin)" />
            <ellipse cx="70" cy="44" rx="15.5" ry="17.5" fill="url(#sg-skin)" stroke={GOLD_DEEP} strokeWidth="0.5" />
            {/* beard framing the jaw, drawn over the lower face + neck */}
            <path
              d="M55 48 C 55 61, 60 72, 70 75 C 80 72, 85 61, 85 48 C 80 53, 76 55, 70 56 C 64 55, 60 53, 55 48 Z"
              fill="url(#sg-beard)"
              stroke="#9a8a64"
              strokeWidth="0.5"
            />
            <path d="M62 58 Q65 66 67 72" stroke="#9a8a64" strokeWidth="0.5" opacity="0.6" fill="none" />
            <path d="M78 58 Q75 66 73 72" stroke="#9a8a64" strokeWidth="0.5" opacity="0.6" fill="none" />
            {/* brow shadow */}
            <path d="M58 39 Q70 34 82 39" stroke="#7a5d33" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
            {/* serene, closed almond eyes */}
            <path d="M60 45.5 Q64 48.5 68 45.5" stroke="#3a2c18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M72 45.5 Q76 48.5 80 45.5" stroke="#3a2c18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M60 44 Q64 46 68 44" stroke={GOLD_SOFT} strokeWidth="0.5" opacity="0.5" fill="none" />
            <path d="M72 44 Q76 46 80 44" stroke={GOLD_SOFT} strokeWidth="0.5" opacity="0.5" fill="none" />
            {/* nose */}
            <path d="M70 47 L68 52.5 Q70 53.5 72 52.5" stroke="#7a5d33" strokeWidth="1" opacity="0.6" fill="none" strokeLinecap="round" />
            {/* mustache, sitting on the beard */}
            <path d="M63 54.5 Q67 57.5 70 56 Q73 57.5 77 54.5" stroke="#8a7a54" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* forehead tilak — a single gold mark */}
            <path d="M70 30 L70 36" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
          </motion.g>

          {/* Topknot — small dark bun with a gold tie; shares the head pivot */}
          <motion.g data-part="topknot" style={pivot(70, 60)} animate={headAnim} transition={headTrans}>
            <ellipse cx="70" cy="22" rx="9" ry="8" fill="url(#sg-knot)" stroke={GOLD_DEEP} strokeWidth="0.6" />
            <ellipse cx="70" cy="13" rx="3" ry="3.4" fill="url(#sg-knot)" stroke={GOLD_DEEP} strokeWidth="0.4" />
            <path d="M61 27 Q70 31 79 27" stroke={GOLD} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </motion.g>

          {/* Staff — wooden shaft with a glowing ring-and-orb finial */}
          <motion.g
            data-part="staff"
            style={pivot(101, 150)}
            animate={{ rotate: staffRotate }}
            transition={still ? instant : spring}
          >
            <line x1="101" y1="152" x2="97" y2="20" stroke="url(#sg-wood)" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="150" x2="96.2" y2="22" stroke={GOLD_SOFT} strokeWidth="0.6" opacity="0.4" strokeLinecap="round" />
            <circle cx="96" cy="16" r="11" fill="url(#sg-orb-glow)" />
            <circle cx="96" cy="16" r="6" fill="none" stroke={GOLD} strokeWidth="2" />
            <circle cx="96" cy="16" r="2.7" fill="url(#sg-orb)" />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  )
}
