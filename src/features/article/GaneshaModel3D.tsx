import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * GaneshaModel3D — a low-poly, code-built 3D figure of Ganesha for the
 * `hindu-gods` article, a companion piece to the Shiva figure (DeityModel3D).
 * A respectful, iconographic interpretation: seated calmly on a lotus, with the
 * elephant head and curling trunk, two ears, a single broken tusk (Ekadanta),
 * a golden crown, the affectionate rounded belly, and four arms — one cupping a
 * modak, one raised with a goad/axe, the others in rest and blessing.
 *
 * Like the Shiva figure, everything is primitive geometry (no model files, no
 * textures, no API keys) so it stays tiny and ships only when this tab is
 * opened — three.js lives in its own async chunk that never touches first paint.
 *
 * It deliberately avoids a literal face: the only features are serene, suggested
 * eyes and a sacred brow mark, keeping the piece abstract and dignified in the
 * same low-poly idiom as the rest of KaalVeda.
 */

/* Palette — drawn from KaalVeda's tokens. The body is a warm, muted terracotta-
 * grey, deliberately distinct from Shiva's stone-blue; gold is reserved for the
 * crown and the symbolic items, and a pale ivory for the tusks. */
const BODY = '#ad8068'
const BODY_LIGHT = '#c49a82'
const BELLY = '#b9886c'
const EAR_INNER = '#94604c'
const GOLD = '#d4af6e'
const GOLD_SOFT = '#e7c98c'
const GOLD_DEEP = '#a9824a'
const IVORY = '#e8e0cd'
const EYE = '#241a12'

/** Seconds per full auto-rotation — very slow, contemplative. */
const ROTATION_PERIOD = 30
/** How long after the user stops dragging before auto-rotation resumes. */
const RESUME_DELAY_MS = 3500

function BodyMaterial({ color = BODY }: { color?: string }) {
  return <meshStandardMaterial color={color} flatShading roughness={0.82} metalness={0.06} />
}

function IvoryMaterial() {
  return <meshStandardMaterial color={IVORY} flatShading roughness={0.6} metalness={0.1} />
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

function GaneshaFigure() {
  return (
    <group>
      {/* Lotus / dais base ------------------------------------------ */}
      <LotusBase />

      {/* Crossed legs (a low, wide lap) + knees --------------------- */}
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[0.86, 0.96, 0.46, 10]} />
        <BodyMaterial />
      </mesh>
      <mesh position={[-0.6, -0.6, 0.46]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <BodyMaterial color={BODY_LIGHT} />
      </mesh>
      <mesh position={[0.6, -0.6, 0.46]}>
        <icosahedronGeometry args={[0.3, 0]} />
        <BodyMaterial color={BODY_LIGHT} />
      </mesh>

      {/* Rounded belly — a defining, affectionate feature ----------- */}
      <mesh position={[0, -0.1, 0.26]} scale={[1.06, 0.92, 1]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <BodyMaterial color={BELLY} />
      </mesh>
      {/* A thin gold belt round the belly (the serpent Vasuki, abstracted). */}
      <mesh position={[0, -0.12, 0.26]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1, 0.92]}>
        <torusGeometry args={[0.5, 0.028, 8, 28]} />
        <GoldMaterial color={GOLD_DEEP} />
      </mesh>

      {/* Torso ------------------------------------------------------ */}
      <mesh position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.42, 0.4, 4, 10]} />
        <BodyMaterial />
      </mesh>
      {/* Shoulders — a soft horizontal bar so the body isn't a pillar. */}
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, 0.5, 4, 10]} />
        <BodyMaterial />
      </mesh>
      {/* Neck — a thick elephant neck. */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 0.24, 8]} />
        <BodyMaterial />
      </mesh>

      <Arms />
      <ElephantHead />
      <Crown />

      {/* Symbolic items — kept minimal and abstract. */}
      <Modak position={[0.44, -0.04, 0.7]} />
      <Axe position={[1.02, 1.66, 0.05]} />
    </group>
  )
}

/** A flattened octagonal dais ringed with simple petal cones (warm-toned). */
function LotusBase() {
  const petals = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2),
    [],
  )
  return (
    <group position={[0, -1.0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.12, 1.34, 0.26, 10]} />
        <BodyMaterial color="#6f5648" />
      </mesh>
      {petals.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 1.16, 0.04, Math.sin(a) * 1.16]}
          rotation={[Math.PI / 2.1, 0, -a + Math.PI / 2]}
        >
          <coneGeometry args={[0.24, 0.52, 4]} />
          <BodyMaterial color={BODY_LIGHT} />
        </mesh>
      ))}
    </group>
  )
}

/** A small cupped hand — a flattened facet sphere. */
function Hand({
  position,
  scale = [1, 1, 1],
}: {
  position: [number, number, number]
  scale?: [number, number, number]
}) {
  return (
    <mesh position={position} scale={scale}>
      <icosahedronGeometry args={[0.15, 0]} />
      <BodyMaterial color={BODY_LIGHT} />
    </mesh>
  )
}

/** Four arms, suggested simply: two raised, two at rest. */
function Arms() {
  return (
    <group>
      {/* Upper-right arm — raised, gripping the goad/axe. */}
      <mesh position={[0.62, 0.74, 0.02]} rotation={[0, 0, -0.62]}>
        <capsuleGeometry args={[0.11, 0.46, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <mesh position={[0.9, 1.18, 0.04]} rotation={[0, 0, -0.32]}>
        <capsuleGeometry args={[0.095, 0.44, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <Hand position={[0.99, 1.48, 0.05]} />

      {/* Upper-left arm — raised in abhaya (fear-not) blessing. */}
      <mesh position={[-0.62, 0.74, 0.02]} rotation={[0, 0, 0.62]}>
        <capsuleGeometry args={[0.11, 0.46, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <mesh position={[-0.9, 1.18, 0.06]} rotation={[0, 0, 0.32]}>
        <capsuleGeometry args={[0.095, 0.44, 4, 8]} />
        <BodyMaterial />
      </mesh>
      {/* Open palm facing forward. */}
      <mesh position={[-1.0, 1.46, 0.18]} scale={[0.85, 1.15, 0.55]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <BodyMaterial color={BODY_LIGHT} />
      </mesh>

      {/* Lower-right arm — cupping a modak by the belly. */}
      <mesh position={[0.62, 0.18, 0.18]} rotation={[0.35, 0, -0.28]}>
        <capsuleGeometry args={[0.11, 0.46, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <mesh position={[0.56, -0.12, 0.45]} rotation={[1.05, 0, 0.35]}>
        <capsuleGeometry args={[0.095, 0.44, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <Hand position={[0.44, -0.18, 0.64]} scale={[1.3, 0.7, 1]} />

      {/* Lower-left arm — resting open on the knee. */}
      <mesh position={[-0.62, 0.18, 0.18]} rotation={[0.35, 0, 0.28]}>
        <capsuleGeometry args={[0.11, 0.46, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <mesh position={[-0.6, -0.18, 0.42]} rotation={[1.15, 0, -0.2]}>
        <capsuleGeometry args={[0.095, 0.44, 4, 8]} />
        <BodyMaterial />
      </mesh>
      <Hand position={[-0.58, -0.46, 0.55]} scale={[1.2, 0.7, 1]} />
    </group>
  )
}

/** The elephant head: dome, brow, ears, curling trunk, two tusks, serene eyes. */
function ElephantHead() {
  return (
    <group>
      {/* Main rounded head form. */}
      <mesh position={[0, 1.34, 0]}>
        <icosahedronGeometry args={[0.52, 1]} />
        <BodyMaterial />
      </mesh>
      {/* Domed brow / forehead, pushed forward. */}
      <mesh position={[0, 1.5, 0.34]} scale={[1.1, 0.7, 0.6]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <BodyMaterial color={BODY_LIGHT} />
      </mesh>

      <Ear side={1} />
      <Ear side={-1} />
      <Trunk />

      {/* Full tusk on the figure's left (+x). */}
      <mesh position={[0.22, 1.04, 0.5]} rotation={[0.7, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.34, 6]} />
        <IvoryMaterial />
      </mesh>
      {/* Broken tusk on the figure's right (−x) — short, blunt (Ekadanta). */}
      <mesh position={[-0.22, 1.04, 0.5]} rotation={[0.7, 0, -0.3]}>
        <cylinderGeometry args={[0.045, 0.07, 0.15, 6]} />
        <IvoryMaterial />
      </mesh>

      {/* Serene, suggested eyes — small, gently downcast lenses. */}
      <mesh position={[0.24, 1.52, 0.42]} rotation={[0, 0, -0.12]} scale={[1.5, 0.85, 0.6]}>
        <icosahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color={EYE} roughness={0.9} />
      </mesh>
      <mesh position={[-0.24, 1.52, 0.42]} rotation={[0, 0, 0.12]} scale={[1.5, 0.85, 0.6]}>
        <icosahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color={EYE} roughness={0.9} />
      </mesh>

      {/* Sacred brow mark (tilak) — a small gold gem between the eyes. */}
      <mesh position={[0, 1.66, 0.46]} scale={[0.62, 1.5, 0.5]}>
        <octahedronGeometry args={[0.05, 0]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.5} />
      </mesh>
    </group>
  )
}

/** A large, flattened, gently curved ear fanning outward from the head. */
function Ear({ side }: { side: number }) {
  return (
    <group position={[0.5 * side, 1.34, -0.02]} rotation={[0.12, -0.5 * side, 0.18 * side]}>
      <mesh scale={[0.14, 1.0, 0.82]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <BodyMaterial color={BODY_LIGHT} />
      </mesh>
      <mesh position={[0.04 * side, 0, 0.05]} scale={[0.1, 0.7, 0.6]}>
        <icosahedronGeometry args={[0.36, 0]} />
        <BodyMaterial color={EAR_INNER} />
      </mesh>
    </group>
  )
}

/** The trunk — segmented tapering cylinders following a downward, curling path. */
function Trunk() {
  const segments = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.15, 0.48),
      new THREE.Vector3(0.0, 0.92, 0.62),
      new THREE.Vector3(0.04, 0.68, 0.72),
      new THREE.Vector3(0.1, 0.5, 0.74),
      new THREE.Vector3(0.18, 0.4, 0.66),
      new THREE.Vector3(0.24, 0.46, 0.55),
    ])
    const pts = curve.getPoints(14)
    const up = new THREE.Vector3(0, 1, 0)
    return pts.slice(0, -1).map((a, i) => {
      const b = pts[i + 1]
      const mid = a.clone().add(b).multiplyScalar(0.5)
      const dir = b.clone().sub(a)
      const len = dir.length()
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize())
      const f = i / (pts.length - 1)
      const r = THREE.MathUtils.lerp(0.16, 0.05, f)
      return {
        position: mid.toArray() as [number, number, number],
        quaternion,
        len,
        r,
      }
    })
  }, [])

  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion}>
          <cylinderGeometry args={[s.r, s.r, s.len * 1.08, 7]} />
          <BodyMaterial />
        </mesh>
      ))}
    </group>
  )
}

/** A golden crown (mukuta) with a small finial atop the head. */
function Crown() {
  return (
    <group position={[0, 1.8, -0.02]}>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.14, 12]} />
        <GoldMaterial color={GOLD_DEEP} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <coneGeometry args={[0.36, 0.38, 12]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <icosahedronGeometry args={[0.07, 0]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.4} />
      </mesh>
    </group>
  )
}

/** A modak (sweet) — a rounded base tapering to a small pleated point. */
function Modak({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <icosahedronGeometry args={[0.11, 0]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.15} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <coneGeometry args={[0.06, 0.11, 6]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.15} />
      </mesh>
    </group>
  )
}

/** A goad/axe (parashu) — a slim shaft with an abstract wedge blade. */
function Axe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Shaft */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.035, 0.62, 8]} />
        <GoldMaterial color={GOLD_DEEP} />
      </mesh>
      {/* Blade — a thin wedge near the top. */}
      <mesh position={[0.13, 0.24, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.2, 0.18, 0.04]} />
        <GoldMaterial />
      </mesh>
      {/* Finial cap. */}
      <mesh position={[0, 0.36, 0]}>
        <icosahedronGeometry args={[0.05, 0]} />
        <GoldMaterial color={GOLD_SOFT} emissive={0.3} />
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
        <GaneshaFigure />
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

export function GaneshaModel3D() {
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
          A low-poly 3D figure of the Hindu deity Ganesha, seated with an
          elephant head, a curving trunk, a single broken tusk, a tall golden
          crown, a rounded belly, and four arms — one cupping a modak sweet, one
          raised with a goad. Drag to rotate the figure.
        </p>
      </div>

      <figcaption className="space-y-1.5 p-4">
        <p className="label text-faint">Explore · Interactive 3D</p>
        <p className="font-display text-base font-semibold text-fg">
          Ganesha — remover of obstacles, in low-poly
        </p>
        <p className="text-sm leading-relaxed text-muted">
          A respectful geometric interpretation: the elephant head and curling
          trunk, the single broken tusk, a modak cupped in one of four hands, the
          golden crown, and the gentle rounded belly. Drag to rotate and zoom;
          the figure turns slowly on its own when left alone.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-faint">
          <span className="label">Code-built · No assets</span>
          <span className="label">KaalVeda Atlas</span>
        </div>
      </figcaption>
    </figure>
  )
}

export default GaneshaModel3D
