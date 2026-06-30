import { Sunrise, Sun, Sunset, MoonStar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAmbience } from '@/hooks/useAmbience'
import type { AmbiencePhase } from '@/hooks/useTimeOfDay'
import { cn } from '@/lib/utils'

/** Phase-aware glyph so the control quietly announces the hour it reads. */
const PHASE_ICON = { dawn: Sunrise, day: Sun, dusk: Sunset, night: MoonStar } as const
const PHASE_LABEL: Record<AmbiencePhase, string> = {
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
}

/**
 * Toggles the time-of-day ambience layer on/off (default on, persisted). The
 * icon reflects the real current phase even while ambience is switched off, so
 * the control always tells you what time the site thinks it is.
 */
export function AmbienceToggle({ className }: { className?: string }) {
  const { phase, enabled, toggle } = useAmbience()
  const Icon = PHASE_ICON[phase]
  const label = PHASE_LABEL[phase]

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={`Time-of-day ambience ${enabled ? 'on' : 'off'} (currently ${label.toLowerCase()})`}
      title={
        enabled
          ? `Ambience: ${label} — click to turn off`
          : 'Ambience off — click to turn on'
      }
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full border bg-surface transition-colors',
        enabled
          ? 'border-border-strong text-gold hover:text-gold-soft'
          : 'border-border text-faint hover:text-muted',
        className,
      )}
    >
      <motion.span
        key={phase}
        initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex"
      >
        <Icon size={16} />
      </motion.span>
      {!enabled && (
        <span
          className="pointer-events-none absolute h-px w-5 -rotate-45 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
    </button>
  )
}
