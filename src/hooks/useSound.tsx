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

  // Drive the engine off the user's preference. The dynamic import lives only in
  // the `enabled` branch, so nothing audio-related loads until the first opt-in.
  useEffect(() => {
    let active = true
    if (enabled) {
      void import('@/lib/soundEngine').then(({ SoundEngine }) => {
        if (!active) return
        const engine = (engineRef.current ??= new SoundEngine())
        engine.setCluster(contextRef.current)
        void engine.start()
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

  const setEnabled = useCallback((on: boolean) => setEnabledState(on), [])
  const toggle = useCallback(() => setEnabledState((v) => !v), [])

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
