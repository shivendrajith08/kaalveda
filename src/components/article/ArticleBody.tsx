import { Info, Lightbulb, AlertTriangle, type LucideIcon } from 'lucide-react'
import type { Block, CalloutTone } from '@/types'
import { InlineText, renderInline } from '@/components/ui/InlineText'
import { useScrollReveal } from '@/hooks/useScrollReveal'
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
      data-reveal
      className="my-8 rounded-xl border p-5"
      style={{
        borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`,
        background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${meta.color} 18%, transparent)`, color: meta.color }}
        >
          <Icon size={15} />
        </span>
        {title ? (
          <p className="font-display text-base font-semibold text-fg">{renderInline(title)}</p>
        ) : (
          <span className="label" style={{ color: meta.color }}>
            {meta.label}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[0.975rem] leading-relaxed text-muted">
        <InlineText text={text} />
      </p>
    </aside>
  )
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  const containerRef = useScrollReveal<HTMLDivElement>()
  // The opening paragraph (the lede) earns a drop-cap. Every article opens on a
  // heading, so the lede is the first paragraph block, not block 0.
  const ledeIndex = blocks.findIndex((b) => b.type === 'paragraph')

  return (
    <div ref={containerRef} className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 2) {
              return (
                <h2
                  key={i}
                  id={block.id}
                  data-reveal
                  className="scroll-mt-28 mb-1 mt-14 font-display text-2xl font-semibold leading-snug tracking-tight text-fg sm:text-[1.9rem]"
                >
                  {/* a short gold hairline — a quiet marker that opens each section */}
                  <span
                    aria-hidden
                    className="mb-3.5 block h-px w-12 bg-gradient-to-r from-gold via-gold/50 to-transparent"
                  />
                  {renderInline(block.text)}
                </h2>
              )
            }
            return (
              <h3
                key={i}
                id={block.id}
                data-reveal
                className="scroll-mt-28 mt-10 font-display text-lg font-semibold text-fg sm:text-xl"
              >
                {renderInline(block.text)}
              </h3>
            )
          }
          case 'paragraph':
            return (
              <p
                key={i}
                data-reveal
                className={cn(
                  'text-pretty',
                  i === ledeIndex
                    ? 'article-lede mt-6 text-[1.15rem] leading-[1.7] text-fg/90'
                    : 'mt-6 text-[1.075rem] leading-[1.8] text-muted',
                )}
              >
                <InlineText text={block.text} />
              </p>
            )
          case 'list':
            return block.ordered ? (
              <ol
                key={i}
                data-reveal
                className="mt-6 list-decimal space-y-3 pl-6 text-[1.05rem] leading-[1.75] text-muted marker:text-gold"
              >
                {block.items.map((it, j) => (
                  <li key={j} className="pl-1.5">
                    <InlineText text={it} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} data-reveal className="mt-6 space-y-3 text-[1.05rem] leading-[1.75] text-muted">
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
                data-reveal
                className="relative my-9 border-l-2 border-gold/50 pl-6 font-display text-xl italic leading-relaxed text-fg/90"
              >
                <span
                  aria-hidden
                  className="absolute -left-1 -top-4 select-none font-display text-5xl not-italic leading-none text-gold/25"
                >
                  &ldquo;
                </span>
                <InlineText text={block.text} />
                {block.cite && (
                  <cite className="mt-2 block font-body text-sm not-italic text-faint">— {block.cite}</cite>
                )}
              </blockquote>
            )
          case 'callout':
            return <Callout key={i} tone={block.tone} title={block.title} text={block.text} />
          case 'divider':
            return <div key={i} data-reveal className="hairline my-12" />
          default:
            return null
        }
      })}
    </div>
  )
}
