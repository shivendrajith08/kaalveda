import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SoundEngine, UiSound } from '@/lib/soundEngine'

const SOUND_STORAGE_KEY = 'kaalveda-sound'

type AudioContextCtor = typeof AudioContext

/** Resolve the (possibly webkit-prefixed) AudioContext constructor *without*
 *  importing the engine module, so the engine stays lazy. */
function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ??
    null
  )
}

/**
 * Create and **synchronously** resume an `AudioContext` from inside the toggle's
 * click handler. The browser's autoplay policy only grants playback when the
 * context is created/resumed within the trusted user-activation window — and an
 * `await import(...)` between the gesture and the resume (the old code path)
 * pushes us *outside* that window, leaving the context permanently `suspended`.
 *
 * So we do the `resume()` here, right in the gesture, and hand the live context
 * to the (still lazily-imported) engine. `resume()` is fired but **not awaited**
 * — awaiting it would itself break out of the activation window.
 */
function primeAudioContext(): AudioContext | null {
  const Ctor = getAudioContextCtor()
  if (!Ctor) return null
  const ctx = new Ctor()
  console.info('[sound] AudioContext created in gesture — state =', ctx.state)
  ctx
    .resume()
    .then(() => console.info('[sound] resume() (gesture) resolved — state =', ctx.state))
    .catch((err) => console.warn('[sound] resume() (gesture) rejected', err))
  return ctx
}

interface SoundContextValue {
  /** Whether the user has opted into sound. Off by default. */
  enabled: boolean
  setEnabled: (on: boolean) => void
  toggle: () => void
  /** Play a sparse UI micro-sound. No-op (and zero cost) while sound is off. */
  play: (sound: UiSound) => void
  /** Colour the ambient bed for a cluster context (or `null` for neutral). */
  setContext: (cluster: string | null) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

/** OFF by default — sound only ever plays after an explicit opt-in. */
function getInitialEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

/**
 * Owns the sound system's on/off preference (persisted, default off) and the
 * lifecycle of the procedural audio engine. The engine module is **lazy-imported
 * only on the first opt-in**, so when sound is off there is no `AudioContext`,
 * no engine code loaded, and no processing whatsoever.
 *
 * Disabling fully tears the engine down (fast fade, then `AudioContext.close()`).
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(getInitialEnabled)
  const engineRef = useRef<SoundEngine | null>(null)
  /** Remember the latest cluster so enabling mid-article starts in-key. */
  const contextRef = useRef<string | null>(null)
  /** An AudioContext created+resumed in the click gesture, awaiting hand-off to
   *  the engine once its module finishes importing. */
  const primedCtxRef = useRef<AudioContext | null>(null)
  /** Mirror of `enabled` so the toggle callback can read it without re-creating. */
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  // Drive the engine off the user's preference. The dynamic import lives only in
  // the `enabled` branch, so nothing audio-related loads until the first opt-in.
  useEffect(() => {
    let active = true
    if (enabled) {
      // Take ownership of any gesture-primed context synchronously, so the ref
      // never carries a stale reference across renders.
      const primed = primedCtxRef.current
      primedCtxRef.current = null
      void import('@/lib/soundEngine').then(({ SoundEngine }) => {
        if (!active) {
          // Superseded before the engine loaded — release the primed context.
          primed?.close().catch(() => {})
          return
        }
        const engine = (engineRef.current ??= new SoundEngine())
        engine.setCluster(contextRef.current)
        void engine.start(primed ?? undefined)
      })
    } else {
      engineRef.current?.stop()
    }
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      /* localStorage may be unavailable (private mode) — ignore */
    }
    return () => {
      active = false
    }
  }, [enabled])

  // Tear down on real unmount (app teardown). gen-guarding in the engine makes
  // this safe under StrictMode's mount→unmount→mount.
  useEffect(() => () => engineRef.current?.stop(), [])

  // Prime the AudioContext *here*, in the click handler's synchronous call
  // stack, while the user gesture is still trusted — before React re-renders and
  // before the engine module is awaited.
  const setEnabled = useCallback((on: boolean) => {
    if (on && !primedCtxRef.current) primedCtxRef.current = primeAudioContext()
    setEnabledState(on)
  }, [])
  const toggle = useCallback(() => {
    const next = !enabledRef.current
    if (next && !primedCtxRef.current) primedCtxRef.current = primeAudioContext()
    setEnabledState(next)
  }, [])

  const play = useCallback((sound: UiSound) => {
    engineRef.current?.play(sound)
  }, [])

  const setContext = useCallback((cluster: string | null) => {
    contextRef.current = cluster
    engineRef.current?.setCluster(cluster)
  }, [])

  const value = useMemo<SoundContextValue>(
    () => ({ enabled, setEnabled, toggle, play, setContext }),
    [enabled, setEnabled, toggle, play, setContext],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within a SoundProvider')
  return ctx
}
