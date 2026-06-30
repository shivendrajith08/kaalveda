import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTimeOfDay, type AmbiencePhase } from '@/hooks/useTimeOfDay'

const AMBIENCE_STORAGE_KEY = 'kaalveda-ambience'

interface AmbienceContextValue {
  /** The raw time-of-day phase, regardless of the on/off setting. */
  phase: AmbiencePhase
  /** Whether the ambience layer is switched on. */
  enabled: boolean
  /** The phase actually in effect: `phase` when on, neutral `day` when off. */
  effective: AmbiencePhase
  setEnabled: (on: boolean) => void
  toggle: () => void
}

const AmbienceContext = createContext<AmbienceContextValue | null>(null)

/** Default ON; honour a stored opt-out. */
function getInitialEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(AMBIENCE_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

/**
 * Owns the time-of-day ambience layer: the live phase, the user's on/off
 * preference, and the `data-ambience` attribute on <html> that the stylesheet
 * targets. Removing the attribute (ambience off) lets every `--amb-*` variable
 * fall back to its neutral default, so the site reverts to its static look.
 */
export function AmbienceProvider({ children }: { children: ReactNode }) {
  const phase = useTimeOfDay()
  const [enabled, setEnabledState] = useState<boolean>(getInitialEnabled)

  const effective: AmbiencePhase = enabled ? phase : 'day'

  useEffect(() => {
    const root = document.documentElement
    if (enabled) root.setAttribute('data-ambience', phase)
    else root.removeAttribute('data-ambience')
    try {
      window.localStorage.setItem(AMBIENCE_STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      /* localStorage may be unavailable (private mode) — ignore */
    }
  }, [enabled, phase])

  const setEnabled = useCallback((on: boolean) => setEnabledState(on), [])
  const toggle = useCallback(() => setEnabledState((v) => !v), [])

  const value = useMemo<AmbienceContextValue>(
    () => ({ phase, enabled, effective, setEnabled, toggle }),
    [phase, enabled, effective, setEnabled, toggle],
  )

  return <AmbienceContext.Provider value={value}>{children}</AmbienceContext.Provider>
}

export function useAmbience(): AmbienceContextValue {
  const ctx = useContext(AmbienceContext)
  if (!ctx) throw new Error('useAmbience must be used within an AmbienceProvider')
  return ctx
}
