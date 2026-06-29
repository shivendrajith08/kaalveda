import { BadgeCheck, CircleDashed, Sparkle } from 'lucide-react'
import type { FactStatus } from '@/types'
import { cn, factStatusMeta } from '@/lib/utils'

const icons: Record<FactStatus, typeof BadgeCheck> = {
  verified: BadgeCheck,
  theory: CircleDashed,
  speculation: Sparkle,
}

export function FactStatusBadge({
  status,
  size = 'md',
  className,
}: {
  status: FactStatus
  size?: 'sm' | 'md'
  className?: string
}) {
  const meta = factStatusMeta(status)
  const Icon = icons[status]
  return (
    <span
      className={cn(
        'label inline-flex items-center gap-1.5 rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-1',
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 45%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
      }}
      title={meta.description}
    >
      <Icon size={size === 'sm' ? 11 : 13} strokeWidth={2.2} aria-hidden />
      {meta.label}
    </span>
  )
}
