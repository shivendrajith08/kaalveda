import { useMemo } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn, hashUnit } from '@/lib/utils'

interface Star {
  x: number
  y: number
  size: number
  delay: number
  bright: boolean
}

/**
 * Ambient "antique star-chart" backdrop — a calm drift of constellation
 * points rather than a neon starfield. Honours reduced-motion.
 */
export function StarField({
  count = 70,
  className,
  seed = 'kaalveda',
}: {
  count?: number
  className?: string
  seed?: string
}) {
  const reduced = useReducedMotion()
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const a = hashUnit(`${seed}-x-${i}`)
      const b = hashUnit(`${seed}-y-${i}`)
      const c = hashUnit(`${seed}-s-${i}`)
      const d = hashUnit(`${seed}-d-${i}`)
      return {
        x: a * 100,
        y: b * 100,
        size: 0.6 + c * 1.8,
        delay: d * 6,
        bright: c > 0.82,
      }
    })
  }, [count, seed])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      // Time-of-day ambience dims/brightens the whole field as one (the
      // per-star twinkle keeps running inside). Snaps under reduced-motion.
      style={{ opacity: 'var(--amb-starfield, 1)', transition: 'opacity 2s ease' }}
      aria-hidden
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className={cn('absolute rounded-full', !reduced && 'animate-twinkle')}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.bright ? 'var(--c-gold-soft)' : 'var(--c-muted)',
            opacity: s.bright ? 0.85 : 0.35,
            boxShadow: s.bright ? '0 0 6px var(--c-gold-soft)' : 'none',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
