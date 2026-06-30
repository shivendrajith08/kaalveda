import { useEffect, useState } from 'react'

/** The four ambient "moods" the site drifts through over a day. */
export type AmbiencePhase = 'dawn' | 'day' | 'dusk' | 'night'

/**
 * Map a 24-hour local hour to an ambience phase. Contiguous, non-overlapping
 * ranges so every hour resolves to exactly one phase:
 *   - dawn  05:00–07:59
 *   - day   08:00–16:59
 *   - dusk  17:00–19:59
 *   - night 20:00–04:59
 */
export function phaseForHour(hour: number): AmbiencePhase {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/**
 * Relative starfield brightness per phase — the single source shared by the
 * DOM `StarField` (mirrored as the `--amb-starfield` CSS variable) and the
 * canvas `HeroBackground` (read directly in JS). Day is the neutral baseline
 * (1); night is the brightest, dawn the dimmest.
 */
export const ambienceStarBrightness: Record<AmbiencePhase, number> = {
  dawn: 0.78,
  day: 1,
  dusk: 1.06,
  night: 1.3,
}

/** Re-evaluate the phase every 5 minutes — cheap, and enough to catch a
 *  boundary crossing on a tab left open for hours. */
const RECHECK_MS = 5 * 60 * 1000

function currentPhase(): AmbiencePhase {
  return phaseForHour(new Date().getHours())
}

/**
 * The current time-of-day ambience phase. Recomputed on a light interval (and
 * whenever the tab regains visibility) so a long-lived session crosses phase
 * boundaries on its own. State only updates when the phase actually changes,
 * so consumers never re-render on a tick that didn't matter. All timers and
 * listeners are cleaned up on unmount.
 */
export function useTimeOfDay(): AmbiencePhase {
  const [phase, setPhase] = useState<AmbiencePhase>(currentPhase)

  useEffect(() => {
    const sync = () =>
      setPhase((prev) => {
        const next = currentPhase()
        return next === prev ? prev : next
      })

    // Catch any drift between the initial render and this effect running.
    sync()
    const id = window.setInterval(sync, RECHECK_MS)
    const onVisible = () => {
      if (!document.hidden) sync()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return phase
}
