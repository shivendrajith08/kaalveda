import { motion } from 'framer-motion'

/** Cinematic route-transition loader. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          className="relative h-12 w-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute inset-0 rounded-full border-2 border-border" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold" />
        </motion.div>
        <p className="label text-faint">Charting the path…</p>
      </div>
    </div>
  )
}
