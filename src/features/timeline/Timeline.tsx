import { motion } from 'framer-motion'
import type { Timeline as TimelineData, TimelineEvent } from '@/types'
import { formatYear, cn, factStatusMeta } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Timeline({
  timeline,
  className,
}: {
  timeline: TimelineData
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    <div className={cn('relative', className)}>
      {/* The spine */}
      <div
        className="absolute bottom-2 left-[7px] top-2 w-px sm:left-[calc(7rem+7px)]"
        style={{ background: 'linear-gradient(var(--c-gold), transparent)' }}
        aria-hidden
      />

      <ol className="space-y-7">
        {timeline.events.map((event, i) => (
          <TimelineRow key={event.id} event={event} index={i} reduced={reduced} />
        ))}
      </ol>
    </div>
  )
}

function TimelineRow({
  event,
  index,
  reduced,
}: {
  event: TimelineEvent
  index: number
  reduced: boolean
}) {
  const statusColor = event.factStatus ? factStatusMeta(event.factStatus).color : 'var(--c-gold)'

  return (
    <motion.li
      className="relative flex flex-col gap-2 sm:flex-row sm:gap-6"
      initial={reduced ? false : { opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Year (left rail on sm+) */}
      <div className="order-2 shrink-0 sm:order-1 sm:w-28 sm:pt-0.5 sm:text-right">
        <span className="label text-gold">{formatYear(event.year)}</span>
        {event.era && <span className="mt-0.5 hidden text-xs text-faint sm:block">{event.era}</span>}
      </div>

      {/* Node */}
      <div className="absolute left-0 top-1.5 order-1 sm:left-[7rem]">
        <span
          className="block h-3.5 w-3.5 rounded-full border-2"
          style={{ borderColor: statusColor, background: 'var(--c-bg)' }}
        />
      </div>

      {/* Content */}
      <div className="order-3 pl-7 sm:pl-8">
        <h3 className="font-display text-lg font-semibold text-fg">{event.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{event.description}</p>
        {event.era && (
          <span className="label mt-1 inline-block text-faint sm:hidden">{event.era}</span>
        )}
      </div>
    </motion.li>
  )
}
