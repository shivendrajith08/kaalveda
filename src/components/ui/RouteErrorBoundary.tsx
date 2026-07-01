import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render / lazy-load failures inside a route so a single broken chunk
 * — a dynamic import that fails to fetch after a redeploy, say — shows a recover
 * card instead of blanking the whole app.
 *
 * Recovery is a hard reload rather than an in-place retry on purpose: once a
 * `React.lazy` factory has rejected, React caches it as rejected and will not
 * re-invoke it on a plain remount, so only a fresh document reliably re-fetches
 * the chunk. The wrapper is remounted per route (it lives inside PageTransition's
 * pathname-keyed subtree), so simply navigating elsewhere also clears the error.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary] a route failed to render', error, info)
  }

  render() {
    if (this.state.hasError) return <RouteErrorFallback />
    return this.props.children
  }
}

/** The recover card shown when a route's chunk can't be loaded/rendered. */
function RouteErrorFallback() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold text-fg">This view didn’t load.</h1>
        <p className="mt-4 text-pretty text-muted">
          A piece of this page failed to download — usually a dropped connection or a fresh release
          still rolling out. Reloading almost always sorts it.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-gold w-full sm:w-auto"
          >
            <RefreshCw size={16} /> Reload
          </button>
          <Link to="/" className="btn btn-ghost w-full sm:w-auto">
            <Home size={16} /> Return home
          </Link>
        </div>
      </div>
    </section>
  )
}
