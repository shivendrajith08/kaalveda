import { Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSound } from '@/hooks/useSound'
import { cn } from '@/lib/utils'

/**
 * The single, persistent sound control. Off by default; one click toggles the
 * cosmic ambient bed + UI micro-sounds, and the speaker glyph flips on/off so
 * the state is always obvious. Sits beside the ambience/theme toggles in the nav.
 */
export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSound()
  const Icon = enabled ? Volume2 : VolumeX

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={`Sound ${enabled ? 'on' : 'off'}`}
      title={enabled ? 'Sound on — click to mute' : 'Sound off — click for cosmic ambience'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border bg-surface transition-colors',
        enabled
          ? 'border-border-strong text-gold hover:text-gold-soft'
          : 'border-border text-faint hover:text-muted',
        className,
      )}
    >
      <motion.span
        key={enabled ? 'on' : 'off'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex"
      >
        <Icon size={16} />
      </motion.span>
    </button>
  )
}
