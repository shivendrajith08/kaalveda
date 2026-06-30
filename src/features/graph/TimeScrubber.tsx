import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import {
  MIN_YEAR,
  TODAY,
  PRESETS,
  formatYear,
  yearToFraction,
  fractionToYear,
} from './timeScale'

/**
 * Time-Travel era scrubber — a scroll-like playhead docked at the bottom of the
 * Knowledge Graph. Dragging it sweeps the graph through 13.8 billion years;
 * nodes fade in as their civilizations appear. Auto-play animates the sweep so
 * you can watch history unfold; preset pills jump between eras.
 *
 * The component is presentational — it owns only the play/pause animation. The
 * current `year` is controlled by the parent, which uses it to fade nodes.
 */

const PLAY_DURATION_MS = 15_000

interface Props {
  /** Current playhead year (controlled). */
  year: number
  /** Throttled setter — the parent recomputes node visibility from this. */
  onChange: (year: number) => void
}

export default function TimeScrubber({ year, onChange }: Props) {
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | undefined>(undefined)

  const fraction = yearToFraction(year)
  const sliderValue = Math.round(fraction * 1000)

  /* ---- Auto-play: animate the fraction at constant track speed ---------- */
  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = undefined
    setPlaying(false)
  }, [])

  const play = useCallback(() => {
    // Restart from the dawn of time if we're already at the present.
    const startFraction = yearToFraction(year) >= 0.999 ? 0 : yearToFraction(year)
    const startTime = performance.now()
    setPlaying(true)

    const tick = (now: number) => {
      const f = startFraction + (now - startTime) / PLAY_DURATION_MS
      if (f >= 1) {
        onChange(TODAY)
        rafRef.current = undefined
        setPlaying(false)
        return
      }
      onChange(fractionToYear(f))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [year, onChange])

  useEffect(() => stop, [stop])

  const togglePlay = () => (playing ? stop() : play())

  const onSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playing) stop()
    onChange(fractionToYear(Number(e.target.value) / 1000))
  }

  const jumpTo = (target: number) => {
    if (playing) stop()
    onChange(target)
  }

  const fillPct = `${fraction * 100}%`

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-5">
      <div className="glass-strong pointer-events-auto w-full max-w-3xl rounded-2xl px-5 pb-3.5 pt-4 shadow-float">
        {/* Year label */}
        <div className="mb-2.5 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span className="label text-faint">Time Travel</span>
            <span className="font-display text-2xl font-semibold leading-none text-gold sm:text-[1.75rem]">
              {formatYear(year)}
            </span>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play through time'}
            aria-pressed={playing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-gold/12 text-gold transition-colors hover:bg-gold/20"
          >
            {playing ? <Pause size={15} /> : <Play size={15} className="translate-x-px" />}
          </button>
        </div>

        {/* Slider — a scroll of time */}
        <div className="relative h-7">
          {/* Decorative track */}
          <div
            className="era-track pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft"
              style={{ width: fillPct, transition: 'width 90ms linear' }}
            />
          </div>
          {/* Era notches */}
          {PRESETS.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-gold/35"
              style={{ left: `${yearToFraction(p.year) * 100}%` }}
              aria-hidden
            />
          ))}
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={sliderValue}
            onChange={onSlider}
            aria-label="Year"
            aria-valuetext={formatYear(year)}
            className="era-scrubber absolute inset-0 w-full"
          />
        </div>

        {/* Endpoints + preset pills */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="label hidden text-faint sm:inline">{formatYear(MIN_YEAR)}</span>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
            {PRESETS.map((p) => {
              const active = year === p.year
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => jumpTo(p.year)}
                  aria-pressed={active}
                  className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors ${
                    active
                      ? 'border-gold/60 bg-gold/15 text-gold'
                      : 'border-border text-muted hover:border-border-strong hover:text-gold'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <span className="label hidden text-faint sm:inline">Today</span>
        </div>
      </div>
    </div>
  )
}
