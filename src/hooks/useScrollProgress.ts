import { useEffect, useState } from 'react'

/**
 * Reading-progress for the whole document, 0..100. Updates on scroll/resize
 * via rAF, and is safe when the page is shorter than the viewport.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      const value = scrollable <= 0 ? 0 : (doc.scrollTop / scrollable) * 100
      setProgress(Math.min(100, Math.max(0, value)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}
