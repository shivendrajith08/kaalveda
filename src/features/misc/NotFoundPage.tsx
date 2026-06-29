import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Home, Search } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { StarField } from '@/components/StarField'

export default function NotFoundPage() {
  const { openPalette } = useCommandPalette()

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 starfield" aria-hidden />
      <StarField count={110} seed="void" />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-lg text-center"
      >
        <p className="font-display text-7xl font-semibold text-gold sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-fg">
          You’ve drifted off the map.
        </h1>
        <p className="mt-4 text-pretty text-muted">
          This corner of the knowledge universe hasn’t been charted — or the path no longer leads
          here. Let’s get you back on a journey.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn btn-gold w-full sm:w-auto">
            <Home size={16} /> Return home
          </Link>
          <Link to="/explore" className="btn btn-ghost w-full sm:w-auto">
            <Compass size={16} /> Open the Atlas
          </Link>
          <button type="button" onClick={openPalette} className="btn btn-ghost w-full sm:w-auto">
            <Search size={16} /> Search
          </button>
        </div>
      </motion.div>
    </section>
  )
}
