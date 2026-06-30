import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Gentle, once-only scroll reveal for long-form content.
 *
 * Returns a ref to attach to a container; every `[data-reveal]` descendant is
 * hidden (a small rise + fade) until it scrolls into view, then settles in once
 * and is never animated again. It coexists with the cosmic page-transition
 * system — that animates the *route wrapper*, this animates content *children*,
 * so the two never fight.
 *
 * Accessibility + robustness:
 *   - `prefers-reduced-motion`: nothing is ever hidden — content is present as
 *     authored (we return before touching the DOM).
 *   - No IntersectionObserver / no JS: same — elements stay visible, since the
 *     hiding class is only ever added by this hook at runtime.
 *   - The hiding class is applied in `useLayoutEffect` (before paint), so there
 *     is no flash of content appearing then jumping back to hidden.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!els.length) return

    // Reduced motion or no IO support → leave everything visible as authored.
    if (reduced || typeof IntersectionObserver === 'undefined') return

    els.forEach((el) => el.classList.add('reveal-init'))

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('reveal-in')
          io.unobserve(entry.target)
        }
      },
      // Reveal a touch before the element is fully in view; fire as soon as a
      // sliver shows so nothing ever lands already-visible-but-still-hidden.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [reduced])

  return ref
}
