import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

const TOKEN =
  /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(`[^`]+`)|(\*[^*\n]+\*)/g

/**
 * Render a string of lightweight inline Markdown — links, bold, italic and
 * inline code — into React nodes. Internal links ("/article/…") use the
 * router; external links open in a new tab.
 */
export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let n = 0
  TOKEN.lastIndex = 0

  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`${keyPrefix}-t-${n++}`}>{text.slice(lastIndex, match.index)}</Fragment>)
    }
    const token = match[0]

    if (match[1]) {
      // link
      const inner = token.slice(1, token.indexOf(']'))
      const url = token.slice(token.indexOf('(') + 1, token.length - 1)
      if (url.startsWith('/')) {
        nodes.push(
          <Link
            key={`${keyPrefix}-l-${n++}`}
            to={url}
            className="font-medium text-gold underline decoration-gold/30 underline-offset-2 transition-colors hover:decoration-gold"
          >
            {inner}
          </Link>,
        )
      } else {
        nodes.push(
          <a
            key={`${keyPrefix}-l-${n++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline decoration-gold/30 underline-offset-2 transition-colors hover:decoration-gold"
          >
            {inner}
          </a>,
        )
      }
    } else if (match[2]) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${n++}`} className="font-semibold text-fg">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (match[3]) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${n++}`}
          className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-gold-soft"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (match[4]) {
      nodes.push(
        <em key={`${keyPrefix}-e-${n++}`} className="italic text-fg/90">
          {token.slice(1, -1)}
        </em>,
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t-${n++}`}>{text.slice(lastIndex)}</Fragment>)
  }

  return nodes
}

export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text)}</>
}
