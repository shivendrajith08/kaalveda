import { Info, Lightbulb, AlertTriangle, type LucideIcon } from 'lucide-react'
import type { Block, CalloutTone } from '@/types'
import { InlineText, renderInline } from '@/components/ui/InlineText'
import { cn } from '@/lib/utils'

const calloutMeta: Record<CalloutTone, { icon: LucideIcon; color: string; label: string }> = {
  note: { icon: Info, color: 'var(--c-gold)', label: 'Note' },
  insight: { icon: Lightbulb, color: 'var(--c-cluster-cosmos)', label: 'Insight' },
  caution: { icon: AlertTriangle, color: 'var(--c-speculation)', label: 'Caution' },
}

function Callout({ tone, title, text }: { tone: CalloutTone; title?: string; text: string }) {
  const meta = calloutMeta[tone]
  const Icon = meta.icon
  return (
    <aside
      className="my-7 flex gap-4 rounded-xl border p-5"
      style={{
        borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`,
        background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
      }}
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${meta.color} 18%, transparent)`, color: meta.color }}
      >
        <Icon size={17} />
      </div>
      <div className="space-y-1">
        {title && (
          <p className="font-display text-base font-semibold text-fg">{renderInline(title)}</p>
        )}
        <p className="text-[0.95rem] leading-relaxed text-muted">
          <InlineText text={text} />
        </p>
      </div>
    </aside>
  )
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const Tag = block.level === 2 ? 'h2' : 'h3'
            return (
              <Tag
                key={i}
                id={block.id}
                className={cn(
                  'scroll-mt-28 font-display text-fg',
                  block.level === 2 ? 'mt-12 text-2xl font-semibold sm:text-3xl' : 'mt-8 text-xl font-semibold',
                )}
              >
                {renderInline(block.text)}
              </Tag>
            )
          }
          case 'paragraph':
            return (
              <p key={i} className="mt-5 text-pretty text-[1.05rem] leading-[1.85] text-muted">
                <InlineText text={block.text} />
              </p>
            )
          case 'list':
            return block.ordered ? (
              <ol key={i} className="mt-5 list-decimal space-y-2.5 pl-6 text-[1.02rem] leading-relaxed text-muted marker:text-gold">
                {block.items.map((it, j) => (
                  <li key={j} className="pl-1.5">
                    <InlineText text={it} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="mt-5 space-y-2.5 text-[1.02rem] leading-relaxed text-muted">
                {block.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                    <span>
                      <InlineText text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            )
          case 'quote':
            return (
              <blockquote
                key={i}
                className="my-8 border-l-2 border-gold/60 pl-6 font-display text-xl italic leading-relaxed text-fg/90"
              >
                <InlineText text={block.text} />
                {block.cite && (
                  <cite className="mt-2 block font-body text-sm not-italic text-faint">— {block.cite}</cite>
                )}
              </blockquote>
            )
          case 'callout':
            return <Callout key={i} tone={block.tone} title={block.title} text={block.text} />
          case 'divider':
            return <div key={i} className="hairline my-10" />
          default:
            return null
        }
      })}
    </div>
  )
}
