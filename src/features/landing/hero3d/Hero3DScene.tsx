import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

/**
 * Hero3DScene — KaalVeda's cinematic landing intro: "the whole of knowledge,
 * as one galaxy." A slow, eased drift through a deep-space cosmos — a dense 3D
 * starfield, a warm-gold spiral galaxy fading to indigo/violet, layered nebula
 * glow, and a bloom + vignette film pass.
 *
 * This module is the ONLY place the three.js / postprocessing stack is pulled
 * into the landing bundle, and it is reached solely through the lazy import in
 * <Hero3DBackground/>. That keeps three + postprocessing in their own async
 * chunk — zero cost to first paint and to every other route. Everything here is
 * built from buffer geometry, code-generated textures and shaders (no asset
 * files), so the chunk stays small and self-contained.
 *
 * It never mounts under prefers-reduced-motion or on a weak device — those get
 * the fast 2D <HeroBackground/> instead (see <Hero3DBackground/>).
 */

/* Brand palette — KaalVeda tokens. Gold core → indigo/violet arms on midnight. */
const GOLD = new THREE.Color('#d4af6e')
const GOLD_SOFT = new THREE.Color('#e7c98c')
const GOLD_HOT = new THREE.Color('#fff2cf')
const VIOLET = new THREE.Color('#6f4a8a')
const INDIGO = new THREE.Color('#2a3d6e')
const STAR_COOL = new THREE.Color('#cdd7ff')
const STAR_WARM = new THREE.Color('#f0d9a8')
const CLEAR = '#0b0e15'

/** Deterministic PRNG so the cosmos is identical every mount — no reshuffle. */
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

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/* Composition: the galaxy disk is tilted for a cinematic angle and sat LOW and
 * slightly BACK, so its bright core falls below/behind the CTA area rather than
 * directly behind the title text. The nebula shares the same transform so the
 * glow tracks the galaxy. */
const GALAXY_TILT: [number, number, number] = [0.62, 0, 0.12]
const GALAXY_POSITION: [number, number, number] = [0, -1.35, -0.8]

/* ------------------------------------------------------------------ */
/* Shared points shader — soft round, additive, per-point twinkle.     */
/* ------------------------------------------------------------------ */

const POINT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTwinkleAmp;
  attribute vec3 aColor;
  attribute float aScale;
  attribute float aTwinkle;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (uSize / max(-mv.z, 0.1));
    float tw = (1.0 - uTwinkleAmp) + uTwinkleAmp * sin(uTime * (0.4 + aScale) + aTwinkle * 6.2831);
    vTw = clamp(tw, 0.0, 1.4);
    vColor = aColor;
  }
`

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.26, 0.0, d);
    vec3 col = vColor + vColor * core * 0.7;
    gl_FragColor = vec4(col, glow * vTw);
  }
`

interface FieldData {
  positions: Float32Array
  colors: Float32Array
  scales: Float32Array
  twinkles: Float32Array
}

function PointsField({
  data,
  size,
  twinkleAmp,
  motion,
}: {
  data: FieldData
  size: number
  twinkleAmp: number
  motion: boolean
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: gl.getPixelRatio() },
      uTwinkleAmp: { value: twinkleAmp },
    }),
    // Built once; values are pushed imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    if (motion && matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[data.scales, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" args={[data.twinkles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={POINT_VERT}
        fragmentShader={POINT_FRAG}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Deep starfield — thousands of points in a spherical shell.          */
/* ------------------------------------------------------------------ */

function Starfield({ count, motion }: { count: number; motion: boolean }) {
  const data = useMemo<FieldData>(() => buildStarfield(count), [count])
  return <PointsField data={data} size={90} twinkleAmp={0.45} motion={motion} />
}

function buildStarfield(count: number): FieldData {
  const rng = mulberry32(0x9e3779b1)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const scales = new Float32Array(count)
  const twinkles = new Float32Array(count)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    // Uniform direction on a sphere, radius 34..140 for real depth.
    const u = rng() * 2 - 1
    const theta = rng() * Math.PI * 2
    const r = 34 + rng() * 106
    const s = Math.sqrt(1 - u * u)
    positions[i * 3] = Math.cos(theta) * s * r
    positions[i * 3 + 1] = u * r * 0.75 // a touch flattened
    positions[i * 3 + 2] = Math.sin(theta) * s * r

    const bright = rng() > 0.9
    const warm = rng() > 0.74
    c.copy(warm ? STAR_WARM : STAR_COOL)
    if (bright) c.lerp(GOLD_HOT, 0.25)
    const lum = bright ? 1.0 : 0.45 + rng() * 0.4
    colors[i * 3] = c.r * lum
    colors[i * 3 + 1] = c.g * lum
    colors[i * 3 + 2] = c.b * lum

    scales[i] = bright ? 1.0 + rng() * 0.8 : 0.22 + rng() * rng() * 0.7
    twinkles[i] = rng()
  }
  return { positions, colors, scales, twinkles }
}

/* ------------------------------------------------------------------ */
/* Central galaxy — a warm-gold spiral fading to indigo/violet arms.   */
/* ------------------------------------------------------------------ */

function Galaxy({ count, motion }: { count: number; motion: boolean }) {
  const spin = useRef<THREE.Group>(null)
  const data = useMemo<FieldData>(() => buildGalaxy(count), [count])

  useFrame((_, delta) => {
    // Clamp delta so a long off-screen pause (frameloop 'never') can't fast-
    // forward the spin on resume — the scene picks up smoothly where it left off.
    if (motion && spin.current) spin.current.rotation.y += Math.min(delta, 0.05) * 0.028
  })

  return (
    // Tilt the disk for a cinematic angle; sit it low + back (see GALAXY_POSITION).
    <group rotation={GALAXY_TILT} position={GALAXY_POSITION}>
      <group ref={spin}>
        <PointsField data={data} size={19} twinkleAmp={0.14} motion={motion} />
      </group>
    </group>
  )
}

function buildGalaxy(count: number): FieldData {
  const rng = mulberry32(0xc0ffee42)
  const RADIUS = 9
  const BRANCHES = 4
  const SPIN = 1.15
  const RAND_POWER = 2.6
  const RANDOMNESS = 0.42
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const scales = new Float32Array(count)
  const twinkles = new Float32Array(count)
  const c = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const r = Math.pow(rng(), 0.7) * RADIUS // denser toward the core
    const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2
    const spinAngle = r * SPIN

    const sign = () => (rng() < 0.5 ? 1 : -1)
    const spread = RANDOMNESS * (r + 0.6)
    const rx = Math.pow(rng(), RAND_POWER) * sign() * spread
    const ry = Math.pow(rng(), RAND_POWER) * sign() * spread * 0.32 // flat disk
    const rz = Math.pow(rng(), RAND_POWER) * sign() * spread

    positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + rx
    positions[i * 3 + 1] = ry
    positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz

    // Colour: warm-gold core → gold → violet → indigo out along the arms. The
    // core is GOLD_SOFT rather than white-hot GOLD_HOT, and turns to violet
    // sooner, so the centre reads as a rich warm glow instead of a hotspot.
    const t = r / RADIUS
    if (t < 0.2) c.copy(GOLD_SOFT).lerp(GOLD, t / 0.2)
    else if (t < 0.6) c.copy(GOLD).lerp(VIOLET, (t - 0.2) / 0.4)
    else c.copy(VIOLET).lerp(INDIGO, (t - 0.6) / 0.4)
    // Radial dimming so the rim melts into deep space and the core stays calm.
    const lum = 0.5 + (1 - t) * 0.32
    colors[i * 3] = c.r * lum
    colors[i * 3 + 1] = c.g * lum
    colors[i * 3 + 2] = c.b * lum

    scales[i] = 0.4 + (1 - t) * (1 - t) * 1.1 + rng() * 0.3
    twinkles[i] = rng()
  }
  return { positions, colors, scales, twinkles }
}

/* ------------------------------------------------------------------ */
/* Nebula — layered additive sprites for volumetric-feeling glow.      */
/* ------------------------------------------------------------------ */

/** A soft radial gradient painted to a canvas → glow texture for the sprites. */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.28, 'rgba(255,255,255,0.5)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

interface Cloud {
  pos: [number, number, number]
  scale: number
  color: THREE.Color
  opacity: number
  drift: number
}

function Nebula({ motion }: { motion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const tex = useMemo(makeGlowTexture, [])
  useEffect(() => () => tex.dispose(), [tex])

  const clouds = useMemo<Cloud[]>(() => {
    const rng = mulberry32(0x1234abcd)
    const list: Cloud[] = []
    // Warm gold haze hugging the core.
    for (let i = 0; i < 3; i++) {
      const a = rng() * Math.PI * 2
      list.push({
        pos: [Math.cos(a) * 2.2, (rng() - 0.5) * 1.6, Math.sin(a) * 2.2],
        scale: 11 + rng() * 6,
        color: GOLD_SOFT.clone().lerp(GOLD, rng()),
        opacity: 0.1 + rng() * 0.05,
        drift: (rng() - 0.5) * 0.06,
      })
    }
    // Cooler violet/indigo veils spread wider through the arms.
    for (let i = 0; i < 4; i++) {
      const a = rng() * Math.PI * 2
      const rad = 6 + rng() * 7
      list.push({
        pos: [Math.cos(a) * rad, (rng() - 0.5) * 3, Math.sin(a) * rad - 2],
        scale: 16 + rng() * 12,
        color: VIOLET.clone().lerp(INDIGO, rng()),
        opacity: 0.1 + rng() * 0.08,
        drift: (rng() - 0.5) * 0.04,
      })
    }
    return list
  }, [])

  useFrame((_, delta) => {
    if (motion && group.current) group.current.rotation.z += Math.min(delta, 0.05) * 0.01
  })

  return (
    <group ref={group} rotation={GALAXY_TILT} position={GALAXY_POSITION}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={tex}
            color={c.color}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
      {/* The luminous core the bloom pass catches — a warm glow, not a blowout. */}
      <sprite position={[0, 0, 0]} scale={[3.4, 3.4, 1]}>
        <spriteMaterial
          map={tex}
          color={GOLD_SOFT}
          transparent
          opacity={0.4}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Camera choreography — eased opening dolly, then endless slow drift. */
/* ------------------------------------------------------------------ */

const CAM_START = new THREE.Vector3(1.4, 2.9, 16.8)
const CAM_END = new THREE.Vector3(0.0, 1.15, 7.3)
const LOOK_START = new THREE.Vector3(0, 0.7, 0)
const LOOK_END = new THREE.Vector3(0, 0.12, 0)
const DOLLY_SECONDS = 7.2

function CameraRig({ motion }: { motion: boolean }) {
  // Self-accumulated, delta-clamped time so pausing off-screen freezes the shot
  // and resuming continues smoothly — never a fast-forward after a long pause.
  const elapsedRef = useRef(0)
  const look = useMemo(() => new THREE.Vector3().copy(LOOK_START), [])

  useFrame((state, delta) => {
    const cam = state.camera
    if (!motion) {
      cam.position.copy(CAM_END)
      cam.lookAt(LOOK_END)
      return
    }
    elapsedRef.current += Math.min(delta, 0.05)
    const elapsed = elapsedRef.current
    const t = Math.min(elapsed / DOLLY_SECONDS, 1)
    const e = easeInOutCubic(t)
    cam.position.lerpVectors(CAM_START, CAM_END, e)
    look.lerpVectors(LOOK_START, LOOK_END, e)

    if (t >= 1) {
      // Never fully static: an ultra-slow lissajous breath around the frame.
      const d = elapsed - DOLLY_SECONDS
      cam.position.x = CAM_END.x + Math.sin(d * 0.11) * 0.55
      cam.position.y = CAM_END.y + Math.sin(d * 0.08 + 1) * 0.3
      cam.position.z = CAM_END.z + Math.sin(d * 0.06) * 0.42
      look.x = Math.sin(d * 0.05) * 0.16
      look.y = LOOK_END.y + Math.cos(d * 0.06) * 0.08
    }
    cam.lookAt(look)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Post-processing — the "lush film" pass.                             */
/* ------------------------------------------------------------------ */

function PostFX({ tier }: { tier: SceneTier }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0011), [])
  const effects = [
    <Bloom
      key="bloom"
      mipmapBlur
      intensity={tier === 'high' ? 0.55 : 0.42}
      luminanceThreshold={0.24}
      luminanceSmoothing={0.9}
      radius={0.72}
    />,
    <Vignette key="vignette" eskil={false} offset={0.26} darkness={0.92} />,
  ]
  if (tier === 'high') {
    effects.push(
      <ChromaticAberration
        key="ca"
        offset={caOffset}
        radialModulation
        modulationOffset={0.35}
      />,
    )
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  )
}

/* ------------------------------------------------------------------ */
/* Public scene.                                                        */
/* ------------------------------------------------------------------ */

export type SceneTier = 'medium' | 'high'

interface Hero3DSceneProps {
  tier: SceneTier
  /** false only if reduced-motion flips on while mounted — freezes the camera. */
  motion?: boolean
  /** Pause the render loop when the hero scrolls off-screen / tab hidden. */
  active?: boolean
  /** Fired once the GL context is live — used to cross-fade in over the 2D hero. */
  onReady?: () => void
  /** Fired on a lost GL context so the caller can fall back to the 2D hero. */
  onError?: () => void
}

function SceneContents({ tier, motion }: { tier: SceneTier; motion: boolean }) {
  const starCount = tier === 'high' ? 6000 : 2600
  const galaxyCount = tier === 'high' ? 18000 : 7000
  return (
    <>
      <color attach="background" args={[CLEAR]} />
      <Starfield count={starCount} motion={motion} />
      <Galaxy count={galaxyCount} motion={motion} />
      <Nebula motion={motion} />
      <CameraRig motion={motion} />
      <PostFX tier={tier} />
    </>
  )
}

export default function Hero3DScene({
  tier,
  motion = true,
  active = true,
  onReady,
  onError,
}: Hero3DSceneProps) {
  const dprMax = tier === 'high' ? 2 : 1.5

  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(CLEAR, 1)
    const canvas = state.gl.domElement
    const onLost = (e: Event) => {
      e.preventDefault()
      onError?.()
    }
    canvas.addEventListener('webglcontextlost', onLost, { once: true })
    onReady?.()
  }

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [CAM_START.x, CAM_START.y, CAM_START.z], fov: 50, near: 0.1, far: 340 }}
      dpr={[1, dprMax]}
      frameloop={active ? 'always' : 'never'}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={handleCreated}
    >
      <SceneContents tier={tier} motion={motion} />
    </Canvas>
  )
}
