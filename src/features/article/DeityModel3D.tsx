import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * DeityModel3D — a low-poly, code-built 3D figure of Shiva for the
 * `hindu-gods` article. A respectful, iconographic interpretation: seated in
 * meditation on a lotus, with the third eye, crescent moon, matted hair and
 * the trident (trishul) standing beside him.
 *
 * Everything is built from primitive geometry (no model files, no textures,
 * no API keys) so it stays tiny and ships only when this tab is opened — the
 * whole module is lazy-loaded by ArticlePage, putting three.js in its own
 * async chunk that never touches first paint.
 *
 * It deliberately avoids a literal face. The only features are the third eye
 * and a soft suggestion of closed, downcast eyes, keeping the piece abstract
 * and dignified in the same low-poly idiom as the rest of KaalVeda.
 */

/* Palette — drawn from KaalVeda's tokens. The body is a muted stone-blue-gray,
 * a quiet nod to Shiva's traditional blue/ash depictions (not a cartoon blue);
 * gold is reserved for the sacred marks — trident, crescent and third eye. */
const BODY = '#6e8499'
const BODY_LIGHT = '#8a9eb0'
const HAIR = '#3b4753'
const GOLD = '#d4af6e'
const GOLD_SOFT = '#e7c98c'
const GOLD_DEEP = '#a9824a'
const EYE = '#2a323c'

/** Seconds per full auto-rotation — very slow, contemplative. */
const ROTATION_PERIOD = 30
/** How long after the user stops dragging before auto-rotation resumes. */
const RESUME_DELAY_MS = 3500

function StoneMaterial({ color = BODY }: { color?: string }) {
  return <meshStandardMaterial color={color} flatShading roughness={0.85} metalness={0.05} />
}

function GoldMaterial({
  color = GOLD,
  emissive = 0,
}: {
  color?: string
  emissive?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      flatShading
      roughness={0.35}
      metalness={0.65}
      emissive={GOLD_SOFT}
      emissiveIntensity={emissive}
    />
  )
}

/* ------------------------------------------------------------------ */
/* The figure — a single group, centred near the origin.               */
/* ------------------------------------------------------------------ */

function ShivaFigure() {
  return (
    <group>
      {/* Lotus / dais base ------------------------------------------ */}
      <LotusBase />

      {/* Crossed legs (a low, wide lap) + knees --------------------- */}
      <mesh position={[0, -0.58, 0]} castShadow>
        <cylinderGeometry args={[0.86, 0.96, 0.46, 10]} />
        <StoneMaterial />
      </mesh>
      <mesh position={[-0.6, -0.6, 0.46]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <StoneMaterial color={BODY_LIGHT} />
      </mesh>
      <mesh position={[0.6, -0.6, 0.46]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <StoneMaterial color={BODY_LIGHT} />
      </mesh>

      {/* Torso ------------------------------------------------------ */}
      <mesh position={[0, 0.14, 0]}>
        <capsuleGeometry args={[0.4, 0.54, 4, 10]} />
        <StoneMaterial />
      </mesh>
      {/* Shoulders — a soft horizontal bar so the body isn't a pillar. */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, 0.44, 4, 10]} />
        <StoneMaterial />
      </mesh>

      {/* Arms folding from the shoulders into the lap (dhyana mudra). */}
      <mesh position={[-0.28, 0.04, 0.32]} rotation={[0.5, 0, 0.46]}>
        <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
        <StoneMaterial />
      </mesh>
      <mesh position={[0.28, 0.04, 0.32]} rotation={[0.5, 0, -0.46]}>
        <capsuleGeometry args={[0.12, 0.7, 4, 8]} />
        <StoneMaterial />
      </mesh>
      {/* Hands cupped together in the lap. */}
      <mesh position={[0, -0.32, 0.52]} scale={[1.3, 0.7, 1]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <StoneMaterial color={BODY_LIGHT} />
      </mesh>

      {/* Neck + head ------------------------------------------------ */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.2, 8]} />
        <StoneMaterial />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <StoneMaterial />
      </mesh>

      <Face />
      <Hair />
      <CrescentMoon />

      {/* Trident (trishul) standing to his right -------------------- */}
      <Trishul />
    </group>
  )
}

/** A flattened octagonal dais ringed with simple petal cones. */
function LotusBase() {
  const petals = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2),
    [],
  )
  return (
    <group position={[0, -1.0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.12, 1.34, 0.26, 10]} />
        <StoneMaterial color="#4f5e6c" />
      </mesh>
      {petals.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 1.16, 0.04, Math.sin(a) * 1.16]}
          rotation={[Math.PI / 2.1, 0, -a + Math.PI / 2]}
        >
          <coneGeometry args={[0.24, 0.52, 4]} />
          <StoneMaterial color={BODY_LIGHT} />
        </mesh>
      ))}
    </group>
  )
}

/** The only "features": a vertical third-eye gem and two serene closed eyes. */
function Face() {
  return (
    <group position={[0, 0, 0]}>
      {/* Closed, gently downcast eyes — thin dark slivers. */}
      <mesh position={[-0.16, 1.26, 0.38]} rotation={[0, 0, 0.22]}>
        <boxGeometry args={[0.15, 0.022, 0.04]} />
        <meshStandardMaterial color={EYE} roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 1.26, 0.38]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.15, 0.022, 0.04]} />
        <meshStandardMaterial color={EYE} roughness={0.9} />
      </mesh>

      {/* Third eye — a tall, thin gold gem centred on the forehead. */}
      <mesh position={[0, 1.42, 0.39]} scale={[0.62, 1.7, 0.5]}>
        <octahedronGeometry args={[0.075, 0]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.7} />
      </mesh>
    </group>
  )
}

/** Matted hair (jata) piled into a rounded, layered topknot above the head. */
function Hair() {
  return (
    <group position={[0, 1.46, -0.04]}>
      {/* Wide matted bun across the crown. */}
      <mesh position={[0, 0.12, 0]} scale={[1.18, 0.86, 1.02]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <StoneMaterial color={HAIR} />
      </mesh>
      {/* Piled lock, slightly back. */}
      <mesh position={[0, 0.46, -0.05]} scale={[0.92, 0.82, 0.9]}>
        <icosahedronGeometry args={[0.26, 0]} />
        <StoneMaterial color={HAIR} />
      </mesh>
      {/* Small topknot crest. */}
      <mesh position={[0.02, 0.66, -0.02]}>
        <icosahedronGeometry args={[0.14, 0]} />
        <StoneMaterial color={HAIR} />
      </mesh>
    </group>
  )
}

/** A thin crescent set high in the matted hair, opening upward, in pale gold. */
function CrescentMoon() {
  return (
    <mesh position={[0, 1.94, 0.18]} rotation={[0.15, 0, Math.PI * 0.9]}>
      <torusGeometry args={[0.14, 0.028, 8, 22, Math.PI * 1.2]} />
      <GoldMaterial color={GOLD_SOFT} emissive={0.25} />
    </mesh>
  )
}

/** The trishul — a vertical shaft with a clean three-pronged head. */
function Trishul() {
  return (
    <group position={[1.5, 0, 0.1]}>
      {/* Shaft */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 2.4, 8]} />
        <GoldMaterial color={GOLD_DEEP} />
      </mesh>
      {/* Boss where the prongs meet the shaft */}
      <mesh position={[0, 1.12, 0]}>
        <icosahedronGeometry args={[0.075, 0]} />
        <GoldMaterial />
      </mesh>
      {/* Crossbar joining the three prongs */}
      <mesh position={[0, 1.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.52, 6]} />
        <GoldMaterial />
      </mesh>
      {/* Three prongs, each a tine + barbed point */}
      <Prong x={0} height={0.6} />
      <Prong x={-0.24} height={0.46} />
      <Prong x={0.24} height={0.46} />
    </group>
  )
}

function Prong({ x, height }: { x: number; height: number }) {
  const baseY = 1.18
  return (
    <group position={[x, baseY, 0]}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.026, 0.026, height, 6]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, height + 0.11, 0]}>
        <coneGeometry args={[0.055, 0.24, 6]} />
        <GoldMaterial color={GOLD_SOFT} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Scene — figure + lights + controls, with the motion loop.           */
/* ------------------------------------------------------------------ */

function Scene({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  /** True while the user is actively dragging the controls. */
  const interacting = useRef(false)
  /** Wall-clock time (performance.now) after which auto-rotation may resume. */
  const resumeAt = useRef(0)

  useFrame((state, delta) => {
    const g = group.current
    if (!g || reduced) return

    // Gentle breathing bob — GPU-cheap, just a transform per frame.
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.05

    // Auto-rotate only when the user isn't dragging and the idle delay passed.
    const autoOn = !interacting.current && performance.now() >= resumeAt.current
    if (autoOn) {
      g.rotation.y += delta * ((Math.PI * 2) / ROTATION_PERIOD)
    }
  })

  return (
    <>
      {/* Soft, stylised lighting — cool ambient + a warm gold key, with a
          cool rim to give the facets dimension. No shadow maps: clean. */}
      <ambientLight intensity={0.65} color="#aebfd2" />
      <directionalLight position={[2.5, 4, 3]} intensity={1.25} color={GOLD_SOFT} />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.5} color="#7aa2c4" />
      <pointLight position={[0, 1.6, 1.6]} intensity={0.5} color={GOLD_SOFT} distance={6} />

      <group ref={group}>
        <ShivaFigure />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.5}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
        target={[0, 0.35, 0]}
        onStart={() => {
          interacting.current = true
        }}
        onEnd={() => {
          interacting.current = false
          resumeAt.current = performance.now() + RESUME_DELAY_MS
        }}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Public component — the framed canvas + caption.                     */
/* ------------------------------------------------------------------ */

export function DeityModel3D() {
  const reduced = useReducedMotion()

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      <div
        className="relative h-[420px] w-full select-none"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 18%, #18222f 0%, #0d1117 62%)',
        }}
      >
        <Canvas
          camera={{ position: [0, 0.55, 7], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Scene reduced={reduced} />
        </Canvas>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(130% 100% at 50% 0%, transparent 55%, rgba(0,0,0,0.4) 100%)',
          }}
          aria-hidden
        />

        <p className="sr-only">
          A low-poly 3D figure of the Hindu deity Shiva, seated in meditation on
          a lotus with a third eye, a crescent moon in his matted hair, and a
          trident standing beside him. Drag to rotate the figure.
        </p>
      </div>

      <figcaption className="space-y-1.5 p-4">
        <p className="label text-faint">Explore · Interactive 3D</p>
        <p className="font-display text-base font-semibold text-fg">
          Shiva in meditation — a low-poly icon
        </p>
        <p className="text-sm leading-relaxed text-muted">
          A respectful geometric interpretation: the third eye, the crescent
          moon at the crown, the matted jata, and the trishul. Drag to rotate
          and zoom; the figure turns slowly on its own when left alone.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-faint">
          <span className="label">Code-built · No assets</span>
          <span className="label">KaalVeda Atlas</span>
        </div>
      </figcaption>
    </figure>
  )
}

export default DeityModel3D
