import { Map as MapIcon, ImageIcon, Play, MapPin, Clock, Camera } from 'lucide-react'
import type { MediaImage, MediaMap, MediaVideo } from '@/types'
import { cn } from '@/lib/utils'

type Kind = 'map' | 'image' | 'video'

/**
 * Styled media placeholder with real captions. The visual area is a tasteful
 * "plate" in the antique-atlas style; the structure (title, caption, meta) is
 * real and ready to swap in true assets.
 */
export function MediaCard({
  kind,
  item,
}: {
  kind: Kind
  item: MediaMap | MediaImage | MediaVideo
}) {
  const Icon = kind === 'map' ? MapIcon : kind === 'video' ? Play : ImageIcon
  const region = (item as MediaMap).region
  const credit = (item as MediaImage).credit
  const duration = (item as MediaVideo).duration
  const provider = (item as MediaVideo).provider

  return (
    <figure className="group overflow-hidden rounded-xl border border-border bg-surface">
      <div
        className={cn(
          'relative flex aspect-[16/10] items-center justify-center overflow-hidden',
          kind === 'map' && 'media-plate-map',
          kind !== 'map' && 'media-plate',
        )}
      >
        {/* atlas grid for maps */}
        {kind === 'map' && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(var(--c-border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--c-border-strong) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
            aria-hidden
          />
        )}
        <span className="vignette pointer-events-none absolute inset-0" aria-hidden />

        <span
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full border border-border-strong bg-bg/50 text-gold transition-transform duration-300',
            kind === 'video' && 'group-hover:scale-110',
          )}
        >
          <Icon size={26} />
        </span>

        <span className="label absolute left-3 top-3 rounded-full border border-border bg-bg/60 px-2 py-1 text-faint backdrop-blur">
          {kind}
        </span>
      </div>

      <figcaption className="space-y-1.5 p-4">
        <p className="font-display text-base font-semibold text-fg">{item.title}</p>
        <p className="text-sm leading-relaxed text-muted">{item.caption}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-faint">
          {region && (
            <span className="label inline-flex items-center gap-1.5">
              <MapPin size={11} /> {region}
            </span>
          )}
          {credit && (
            <span className="label inline-flex items-center gap-1.5">
              <Camera size={11} /> {credit}
            </span>
          )}
          {duration && (
            <span className="label inline-flex items-center gap-1.5">
              <Clock size={11} /> {duration}
            </span>
          )}
          {provider && <span className="label">{provider}</span>}
        </div>
      </figcaption>
    </figure>
  )
}
