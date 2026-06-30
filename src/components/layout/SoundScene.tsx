import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSound } from '@/hooks/useSound'
import { getArticle } from '@/lib/content'
import { getClusterForCategory } from '@/data/categories'

/**
 * Renders nothing — it just translates route changes into sound. On every
 * navigation it plays the cosmic "warp" woosh (matching <PageTransition/>) and
 * re-colours the ambient bed to the cluster of the page you've arrived on.
 *
 * All calls route through `useSound`, which is a complete no-op while sound is
 * off, so this costs nothing until the user opts in.
 */

/** Resolve the cluster for a path, for tinting the ambient bed. */
function clusterForPath(pathname: string): string | null {
  const article = pathname.match(/^\/article\/(.+)$/)
  if (article) {
    const a = getArticle(decodeURIComponent(article[1]))
    return a ? (getClusterForCategory(a.category)?.id ?? null) : null
  }
  const category = pathname.match(/^\/category\/(.+)$/)
  if (category) {
    return getClusterForCategory(decodeURIComponent(category[1]))?.id ?? null
  }
  return null
}

export function SoundScene() {
  const { play, setContext } = useSound()
  const { pathname } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    setContext(clusterForPath(pathname))
    // Don't woosh on the very first paint (cold load) — only on real navigations.
    if (first.current) {
      first.current = false
      return
    }
    play('navigate')
  }, [pathname, play, setContext])

  return null
}
