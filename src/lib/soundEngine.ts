/**
 * KaalVeda procedural sound engine — a weightless, cosmic audio bed + sparse UI
 * micro-sounds built entirely from the Web Audio API. There are **zero audio
 * assets**: every tone is synthesised from oscillators, a noise buffer and
 * filters, so nothing is ever downloaded for sound.
 *
 * This module is **lazy-imported** by `useSound` only after the user explicitly
 * enables sound (a user gesture), so none of this code — and no `AudioContext`
 * — exists until then. When sound is disabled we fade out fast and `close()` the
 * context entirely, leaving nothing running in the background.
 *
 * Signal graph (built in `start`):
 *
 *   oscillators ─▶ lowpass ─▶ breathGain ─▶ levelGain ─┐
 *                                                       ├─▶ master ─▶ destination
 *                            one-shot UI sounds ────────┘
 *
 *   • breathGain  — gently amplitude-modulated by a slow LFO (the "breathing").
 *   • levelGain   — active⇄idle dimming so the bed recedes when nothing happens.
 *   • master      — global fade-in (on enable) / fast fade-out (on mute).
 *
 * UI one-shots bypass levelGain (they're never idle-dimmed) but still pass
 * through master, so muting silences everything instantly.
 */

export type UiSound = 'navigate' | 'hover' | 'palette'

/* ----------------------------- tuning constants ---------------------------- */

/** Global ceiling. Modest on purpose — the bed must never be foreground. */
const MASTER = 0.5
/** Gentle fade-in so enabling sound is felt, not jarring. */
const FADE_IN = 1.2
/** Fast (but click-free) fade-out so muting reads as instant. */
const FADE_OUT = 0.18
/** Ambient bed level while the user is active vs. idle (recedes when idle). */
const AMBIENT_ACTIVE = 0.5
const AMBIENT_IDLE = 0.3
/** Seconds of no interaction before the bed dims down so it never fatigues. */
const IDLE_AFTER = 16_000

/** Per-cluster colour for the bed — warmer (lower cutoff) for belief/story,
 *  cooler/airier (higher cutoff) for cosmos. Subtle; the chord is the same. */
interface Tuning {
  root: number
  cutoff: number
}
// Cutoffs sit ~1.5× higher than the original "warm & dark" tuning so the bed's
// upper partials (and the added double-octave voice below) fall inside the band
// laptop speakers can actually reproduce, without changing the relative colour.
const DEFAULT_TUNING: Tuning = { root: 60, cutoff: 690 }
const CLUSTER_TUNING: Record<string, Tuning> = {
  'cosmos-earth': { root: 58, cutoff: 840 }, // cool, airy
  'life-time': { root: 62, cutoff: 660 },
  'belief-story': { root: 55, cutoff: 540 }, // warm, low
  'mind-knowledge': { root: 65, cutoff: 780 },
  'society-tomorrow': { root: 60, cutoff: 700 },
}
const FIFTH = 1.5

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ??
    null
  )
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private levelGain: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private oscillators: { osc: OscillatorNode; ratio: number }[] = []
  private lfos: OscillatorNode[] = []
  private noise: AudioBuffer | null = null
  /** Bumped on every start/stop so an in-flight async start can detect that it
   *  was superseded (handles React StrictMode's mount→unmount→mount). */
  private gen = 0
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private tuning: Tuning = DEFAULT_TUNING
  /** Removes the "resume on next gesture" listeners, if armed. */
  private disarmResume: (() => void) | null = null

  /** Pick the bed's colour from the current cluster context. Safe to call any
   *  time; only audibly retunes while the bed is running. */
  setCluster(cluster: string | null): void {
    this.tuning = (cluster && CLUSTER_TUNING[cluster]) || DEFAULT_TUNING
    const ctx = this.ctx
    const filter = this.filter
    if (!ctx || !filter) return
    const now = ctx.currentTime
    filter.frequency.setTargetAtTime(this.tuning.cutoff, now, 3)
    for (const { osc, ratio } of this.oscillators) {
      osc.frequency.setTargetAtTime(this.tuning.root * ratio, now, 3)
    }
  }

  /**
   * Build (or revive) the audio graph and fade the bed in. Idempotent: calling
   * it while already running just ensures the context is resumed and audible.
   *
   * `preCreated` is an `AudioContext` that the caller created **and resumed**
   * inside the user-gesture window (see `primeAudioContext` in `useSound`). When
   * supplied we adopt it instead of constructing our own — this is what keeps the
   * context out of the permanently-`suspended` state on first opt-in, since our
   * own construction here happens after an `await import(...)`, well outside the
   * gesture's trusted activation window.
   */
  async start(preCreated?: AudioContext): Promise<void> {
    // Already running — ensure it's resumed (e.g. StrictMode remount, or the
    // tab was backgrounded). Don't build a second graph.
    if (this.ctx && this.ctx.state !== 'closed') {
      // A redundant gesture-primed context arrived; we don't need it.
      if (preCreated && preCreated !== this.ctx) preCreated.close().catch(() => {})
      this.gen++
      try {
        await this.ctx.resume()
      } catch {
        /* resume can reject if the context died — ignore */
      }
      this.fadeMaster(MASTER, FADE_IN)
      this.bumpActivity()
      return
    }

    const myGen = ++this.gen
    let ctx: AudioContext
    if (preCreated) {
      ctx = preCreated
    } else {
      const Ctor = getAudioContextCtor()
      if (!Ctor) return
      ctx = new Ctor()
    }
    console.info(
      '[sound] start(): ctx.state after creation =',
      ctx.state,
      preCreated ? '(primed in gesture)' : '(created in engine — no gesture)',
    )

    // The toggle click is a user gesture, but resume() defensively in case the
    // context starts suspended under the browser autoplay policy. For a primed
    // context this is a cheap no-op (already resumed in the gesture).
    try {
      await ctx.resume()
    } catch (err) {
      console.warn('[sound] resume() rejected in start()', err)
    }
    console.info('[sound] start(): ctx.state after resume() =', ctx.state)

    // A faster start/stop may have superseded us mid-await — bail and clean up.
    if (myGen !== this.gen) {
      ctx.close().catch(() => {})
      return
    }

    const now = ctx.currentTime

    // master — global volume + fades, starts silent.
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.connect(ctx.destination)

    // levelGain — active/idle dimming of the ambient bed only.
    const levelGain = ctx.createGain()
    levelGain.gain.setValueAtTime(AMBIENT_ACTIVE, now)
    levelGain.connect(master)

    // breathGain — slow amplitude breathing via an LFO, centred at 1.0.
    const breathGain = ctx.createGain()
    breathGain.gain.setValueAtTime(1, now)
    breathGain.connect(levelGain)

    // lowpass — the bed's tone colour; a slow LFO drifts the cutoff.
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(this.tuning.cutoff, now)
    filter.Q.setValueAtTime(0.7, now)
    filter.connect(breathGain)

    // The drone: root + detuned root + fifth + octave, all low and soft.
    const voices: { ratio: number; type: OscillatorType; gain: number }[] = [
      { ratio: 1, type: 'sine', gain: 0.06 },
      { ratio: 1.003, type: 'sine', gain: 0.05 }, // detune → gentle chorus/beating
      { ratio: FIFTH, type: 'sine', gain: 0.035 },
      { ratio: 2, type: 'triangle', gain: 0.026 }, // octave shimmer
      // Double octave (~220–260Hz). The root/fifth live at ~60–90Hz — below what
      // laptop speakers can physically reproduce — so this is the one voice that
      // actually carries the bed on tinny speakers. Soft, so it stays a hum.
      { ratio: 4, type: 'sine', gain: 0.02 },
    ]
    const oscillators: { osc: OscillatorNode; ratio: number }[] = []
    for (const v of voices) {
      const osc = ctx.createOscillator()
      osc.type = v.type
      osc.frequency.setValueAtTime(this.tuning.root * v.ratio, now)
      const g = ctx.createGain()
      g.gain.setValueAtTime(v.gain, now)
      osc.connect(g).connect(filter)
      osc.start()
      oscillators.push({ osc, ratio: v.ratio })
    }

    // LFO 1 — drifts the filter cutoff (±170Hz over ~20s) for slow movement.
    const lfo1 = ctx.createOscillator()
    lfo1.frequency.setValueAtTime(0.05, now)
    const lfo1Depth = ctx.createGain()
    lfo1Depth.gain.setValueAtTime(170, now)
    lfo1.connect(lfo1Depth).connect(filter.frequency)
    lfo1.start()

    // LFO 2 — breathing amplitude (±0.12 around 1.0) over ~12s.
    const lfo2 = ctx.createOscillator()
    lfo2.frequency.setValueAtTime(0.083, now)
    const lfo2Depth = ctx.createGain()
    lfo2Depth.gain.setValueAtTime(0.12, now)
    lfo2.connect(lfo2Depth).connect(breathGain.gain)
    lfo2.start()

    this.ctx = ctx
    this.master = master
    this.levelGain = levelGain
    this.filter = filter
    this.oscillators = oscillators
    this.lfos = [lfo1, lfo2]
    this.noise = this.makeNoiseBuffer(ctx)

    this.fadeMaster(MASTER, FADE_IN)
    this.bumpActivity()

    // First-ever enable fetches this module over the network; if that outlasts
    // the click's user-activation window the context can come up suspended.
    // Guarantee the bed comes alive on the next interaction.
    if (ctx.state === 'suspended') this.armResumeOnGesture(ctx)
  }

  /** One-shot gesture listeners that resume a context the autoplay policy left
   *  suspended, so the ambient bed reliably starts. Removed on stop. */
  private armResumeOnGesture(ctx: AudioContext): void {
    this.disarmResume?.()
    const events = ['pointerdown', 'keydown', 'touchstart']
    const onGesture = () => {
      this.disarmResume?.()
      if (this.ctx === ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => this.fadeMaster(MASTER, FADE_IN)).catch(() => {})
      }
    }
    for (const ev of events) window.addEventListener(ev, onGesture, { once: true, passive: true })
    this.disarmResume = () => {
      for (const ev of events) window.removeEventListener(ev, onGesture)
      this.disarmResume = null
    }
  }

  /**
   * Fade out fast, then tear the whole graph down and `close()` the context so
   * nothing keeps running. The short fade avoids a click on the low drone while
   * still reading as an instant mute.
   */
  stop(): void {
    this.gen++ // invalidate any in-flight start()
    this.disarmResume?.()
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
    const ctx = this.ctx
    const master = this.master
    const oscillators = this.oscillators
    const lfos = this.lfos

    // Detach references immediately so play()/setCluster() become no-ops at once.
    this.ctx = null
    this.master = null
    this.levelGain = null
    this.filter = null
    this.oscillators = []
    this.lfos = []
    this.noise = null

    if (!ctx) return

    const now = ctx.currentTime
    if (master) {
      try {
        master.gain.cancelScheduledValues(now)
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
        master.gain.exponentialRampToValueAtTime(0.0001, now + FADE_OUT)
      } catch {
        /* ignore */
      }
    }

    const stopAt = now + FADE_OUT
    for (const { osc } of oscillators) {
      try {
        osc.stop(stopAt)
      } catch {
        /* already stopped */
      }
    }
    for (const lfo of lfos) {
      try {
        lfo.stop(stopAt)
      } catch {
        /* ignore */
      }
    }

    // Close after the fade completes — frees the device & guarantees silence.
    setTimeout(
      () => {
        ctx.close().catch(() => {})
      },
      FADE_OUT * 1000 + 80,
    )
  }

  /** Trigger a short, soft UI sound. No-op when sound isn't running. */
  play(sound: UiSound): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    this.bumpActivity()

    switch (sound) {
      case 'navigate':
        this.playNavigate(ctx, master)
        break
      case 'hover':
        this.playHover(ctx, master)
        break
      case 'palette':
        this.playPalette(ctx, master)
        break
    }
  }

  /* ------------------------------- internals ------------------------------- */

  private fadeMaster(to: number, seconds: number): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const now = ctx.currentTime
    const from = Math.max(master.gain.value, 0.0001)
    const target = Math.max(to, 0.0001)
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(from, now)
    master.gain.exponentialRampToValueAtTime(target, now + seconds)
    // Verifies the bed actually ramps *up* (not 0→0). A frozen `now` here means
    // the context is still suspended and the ramp won't be heard until it resumes.
    console.info(
      `[sound] fadeMaster ${from.toFixed(4)} → ${target.toFixed(4)} over ${seconds}s ` +
        `(ctx.state=${ctx.state}, now=${now.toFixed(3)})`,
    )
  }

  /** Bring the bed back to full and (re)arm the idle-dim timer. */
  private bumpActivity(): void {
    const ctx = this.ctx
    const level = this.levelGain
    if (ctx && level) {
      const now = ctx.currentTime
      level.gain.cancelScheduledValues(now)
      level.gain.setTargetAtTime(AMBIENT_ACTIVE, now, 1.5)
    }
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => {
      const c = this.ctx
      const l = this.levelGain
      if (c && l) l.gain.setTargetAtTime(AMBIENT_IDLE, c.currentTime, 6)
    }, IDLE_AFTER)
  }

  private makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * 0.6)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  /** Soft attack → exponential decay envelope into master. Returns the gain. */
  private envelope(
    ctx: AudioContext,
    master: GainNode,
    peak: number,
    attack: number,
    decay: number,
  ): { gain: GainNode; end: number } {
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(peak, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)
    gain.connect(master)
    return { gain, end: now + attack + decay }
  }

  /** Cosmic woosh that matches the page-transition warp: a swept airy band. */
  private playNavigate(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime
    const { gain, end } = this.envelope(ctx, master, 0.16, 0.05, 0.34)
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.setValueAtTime(0.8, now)
    band.frequency.setValueAtTime(420, now)
    band.frequency.exponentialRampToValueAtTime(1600, now + 0.32)
    band.connect(gain)

    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.connect(band)
    src.start(now)
    src.stop(end + 0.02)
    src.onended = () => {
      src.disconnect()
      band.disconnect()
      gain.disconnect()
    }
  }

  /** Very quiet two-partial chime for hovering a graph node — sparse, celestial. */
  private playHover(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime
    const { gain, end } = this.envelope(ctx, master, 0.05, 0.008, 0.14)
    const partials = [880, 1320]
    const oscs: OscillatorNode[] = []
    partials.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      const g = ctx.createGain()
      g.gain.setValueAtTime(i === 0 ? 1 : 0.4, now)
      osc.connect(g).connect(gain)
      osc.start(now)
      osc.stop(end + 0.02)
      oscs.push(osc)
    })
    oscs[oscs.length - 1].onended = () => {
      oscs.forEach((o) => o.disconnect())
      gain.disconnect()
    }
  }

  /** Airy swell when the command palette opens — a soft fifth chord. */
  private playPalette(ctx: AudioContext, master: GainNode): void {
    const now = ctx.currentTime
    const { gain, end } = this.envelope(ctx, master, 0.09, 0.06, 0.38)
    const freqs = [523.25, 783.99] // C5 + G5
    const oscs: OscillatorNode[] = []
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now)
      const g = ctx.createGain()
      g.gain.setValueAtTime(i === 0 ? 1 : 0.6, now)
      osc.connect(g).connect(gain)
      osc.start(now)
      osc.stop(end + 0.02)
      oscs.push(osc)
    })
    // a breath of air under the chord
    const air = ctx.createBufferSource()
    air.buffer = this.noise
    const airFilter = ctx.createBiquadFilter()
    airFilter.type = 'highpass'
    airFilter.frequency.setValueAtTime(2000, now)
    const airGain = ctx.createGain()
    airGain.gain.setValueAtTime(0.0001, now)
    airGain.gain.linearRampToValueAtTime(0.028, now + 0.08)
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    air.connect(airFilter).connect(airGain).connect(master)
    air.start(now)
    air.stop(end + 0.02)

    oscs[oscs.length - 1].onended = () => {
      oscs.forEach((o) => o.disconnect())
      gain.disconnect()
      air.disconnect()
      airFilter.disconnect()
      airGain.disconnect()
    }
  }
}
