import { lazy, type ComponentType } from 'react'

/** One-shot guard so a rotated deploy can trigger at most a single hard reload
 *  per session — never a reload loop. */
const RELOADED_KEY = 'kv:chunk-reload'

/** sessionStorage can throw in locked-down privacy modes; degrade quietly. */
function safeSession(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** Retry a dynamic import a few times with a short back-off to ride out
 *  transient failures (a flaky network, a cold edge node still warming up). */
async function retryImport<T>(
  factory: () => Promise<T>,
  retries: number,
  interval: number,
): Promise<T> {
  try {
    return await factory()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((resolve) => setTimeout(resolve, interval))
    return retryImport(factory, retries - 1, Math.round(interval * 1.5))
  }
}

/**
 * Drop-in replacement for `React.lazy` that survives the classic production
 * failure mode: a code-split chunk (e.g. the heavy `/graph` bundle) that fails
 * to load. Two layers of defence:
 *
 *  1. Transient failures are retried a couple of times with back-off.
 *  2. A *persistent* failure is almost always a stale deploy — the cached
 *     index.html points at chunk hashes that no longer exist on the host. We
 *     force ONE hard reload (guarded by sessionStorage so it can never loop) to
 *     pull a fresh index.html + chunk manifest. If it still fails after that,
 *     the rejection propagates to <RouteErrorBoundary>, which shows a recover
 *     card instead of a blank screen.
 *
 * Pairs with the vercel.json rewrite exclusion for `/assets/`: a missing chunk
 * now returns a real 404 (a fetch error this wrapper can catch) rather than
 * index.html (an HTML MIME error that silently kills the render).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  { retries = 2, interval = 400 }: { retries?: number; interval?: number } = {},
) {
  return lazy(async () => {
    try {
      const mod = await retryImport(factory, retries, interval)
      // Clear the guard on success so a *future* deploy can reload again.
      safeSession()?.removeItem(RELOADED_KEY)
      return mod
    } catch (err) {
      const session = safeSession()
      if (session && !session.getItem(RELOADED_KEY)) {
        session.setItem(RELOADED_KEY, '1')
        window.location.reload()
        // Never resolve — keep <Suspense> on its fallback while the reload
        // takes over the document.
        return new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}
