import { useEffect, useState } from 'react'

/**
 * TEMPORARY dev aid — a floating panel that visualises the sound engine's live
 * master fader so we can *see* the volume ramp while tuning on real hardware.
 *
 * It polls the debug hooks the engine sets in `soundEngine.ts` (`__kvAudioCtx` /
 * `__kvMaster`). Those are only present while sound is enabled and are cleared on
 * mute (the engine `close()`s its context), so the panel reads SUSPENDED / 0%
 * whenever sound is off. Remove this file — and the `exposeForDebug()` calls in
 * the engine — before shipping.
 */

interface FaderState {
  value: number
  state: AudioContextState | 'off'
}

type DebugWindow = Window & {
  __kvAudioCtx?: AudioContext | null
  __kvMaster?: GainNode | null
}

export function SoundDebugFader() {
  const [isOpen, setIsOpen] = useState(false)
  const [fader, setFader] = useState<FaderState>({ value: 0, state: 'off' })

  useEffect(() => {
    const read = () => {
      const w = window as DebugWindow
      const ctx = w.__kvAudioCtx ?? null
      const master = w.__kvMaster ?? null
      if (!ctx || !master || ctx.state === 'closed') {
        setFader({ value: 0, state: 'off' })
        return
      }
      let value = 0
      try {
        value = master.gain.value
      } catch {
        /* node belongs to a torn-down context — treat as silent */
      }
      setFader({ value, state: ctx.state })
    }
    read()
    const interval = window.setInterval(read, 50)
    return () => window.clearInterval(interval)
  }, [])

  const running = fader.state === 'running'
  const pct = Math.min(100, Math.max(0, fader.value * 100))

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded bg-yellow-600/80 px-3 py-2 font-mono text-xs text-white hover:bg-yellow-700"
        title="Toggle sound debug fader"
      >
        🔊 Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-64 rounded-lg border border-yellow-500/50 bg-gray-900/95 p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-yellow-400">SOUND DEBUG</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-lg text-gray-400 hover:text-yellow-400"
          aria-label="Close sound debug fader"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 text-xs text-gray-300">
        <div className="mb-2 flex justify-between">
          <span>AudioContext:</span>
          <span className={running ? 'font-bold text-green-400' : 'font-bold text-red-400'}>
            {fader.state === 'off' ? 'OFF' : fader.state.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Master Fader:</span>
          <span className="font-bold text-yellow-300">{pct.toFixed(1)}%</span>
        </div>
      </div>

      {/* Visual fader bar */}
      <div className="mb-3 h-6 overflow-hidden rounded border border-yellow-500/30 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="border-t border-yellow-500/20 pt-2 text-xs leading-relaxed text-gray-400">
        <p className="mb-1">✓ Bar fills as the master fader ramps</p>
        <p className="mb-1">✓ Reads OFF/SUSPENDED when sound is muted</p>
        <p>💬 Laptop: nav woosh + a faint upper-octave hum</p>
      </div>

      <div className="mt-3 border-t border-yellow-500/20 pt-3 text-xs text-gray-400">
        <p className="mb-1 font-bold text-yellow-400">TEST NOW:</p>
        <ol className="list-inside list-decimal space-y-1">
          <li>Enable sound (nav speaker icon)</li>
          <li>Watch the bar ramp to ~50%</li>
          <li>Navigate → hear the woosh</li>
        </ol>
      </div>
    </div>
  )
}
