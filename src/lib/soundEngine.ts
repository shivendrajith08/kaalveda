/**
 * KaalVeda sound engine — a looping temple-ambience music bed (a real audio
 * file) plus sparse UI micro-sounds synthesised from the Web Audio API.
 *
 * The **background bed** is the `/audio/temple-ambience.mp3` file, played via a
 * plain `HTMLAudioElement` and faded in/out independently of the Web Audio
 * graph. The **UI one-shots** (navigate woosh, hover chime, palette swell) are
 * still procedural — zero assets, synthesised on demand from oscillators and a
 * noise buffer routed through `master`.
 *
 * This module is **lazy-imported** by `useSound` only after the user explicitly
 * enables sound (a user gesture), so none of this code — no `AudioContext`, no
 * media element — exists until then. When sound is disabled we fade the music
 * out and pause it, then fade out and `close()` the Web Audio context so the UI
 * one-shots leave nothing running in the background.
 *
 * Signal graph (built in `start`):
 *
 *   HTMLAudioElement (temple-ambience.mp3, loop) ──▶ speakers  [own volume fade]
 *
 *   one-shot UI sounds ──▶ master ──▶ destination           [Web Audio]
 *
 *   • master — global fade-in (on enable) / fast fade-out (on mute) for the UI
 *     one-shots, so muting silences everything instantly.
 */

export type UiSound = 'navigate' | 'hover' | 'palette'

/* ----------------------------- tuning constants ---------------------------- */

/** Global ceiling for the UI one-shots. Modest — they must never be harsh. */
const MASTER = 0.5
/** Gentle fade-in so enabling sound is felt, not jarring. */
const FADE_IN = 1.2
/** Fast (but click-free) fade-out so muting reads as instant. */
const FADE_OUT = 0.18

/* --------------------------- temple-ambience music ------------------------- */

/** The looping background bed — a real audio file in `public/audio/`. */
const MUSIC_SRC = '/audio/temple-ambience.mp3'
/** Target music volume. Sits under the UI woosh/chime, never drowning them. */
const MUSIC_LEVEL = 0.4
/** Slow, cinematic fade-in when sound is enabled. */
const MUSIC_FADE_IN = 2.5
/** Quicker fade-out when muting, then the element is paused. */
const MUSIC_FADE_OUT = 1.0
/** Volume-ramp granularity for the music fades (ms per step). */
const MUSIC_FADE_STEP_MS = 40

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
  private noise: AudioBuffer | null = null
  /** The looping temple-ambience file. Created lazily and reused across
   *  mute/unmute cycles so the 5 MB asset is only ever fetched once. */
  private music: HTMLAudioElement | null = null
  /** Active music volume-ramp, if a fade is in flight. */
  private musicFadeTimer: ReturnType<typeof setInterval> | null = null
  /** Removes the "retry music playback on next gesture" listeners, if armed. */
  private disarmMusicResume: (() => void) | null = null
  /** Bumped on every start/stop so an in-flight async start can detect that it
   *  was superseded (handles React StrictMode's mount→unmount→mount). */
  private gen = 0
  /** Removes the "resume on next gesture" listeners, if armed. */
  private disarmResume: (() => void) | null = null

  /** Previously coloured the procedural drone per cluster. The drone has been
   *  replaced by the fixed temple-ambience file, so this is now a no-op kept so
   *  callers (`useSound`) need not change. */
  setCluster(_cluster: string | null): void {
    /* no-op — the background bed is now a fixed audio file */
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
      this.startMusic()
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

    // master — bus for the UI one-shots; global volume + fades, starts silent.
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.connect(ctx.destination)

    this.ctx = ctx
    this.master = master
    this.noise = this.makeNoiseBuffer(ctx)

    this.fadeMaster(MASTER, FADE_IN)

    // The background bed: the looping temple-ambience file, faded in on its own.
    this.startMusic()

    // First-ever enable fetches this module over the network; if that outlasts
    // the click's user-activation window the context can come up suspended.
    // Guarantee the one-shots come alive on the next interaction.
    if (ctx.state === 'suspended') this.armResumeOnGesture(ctx)
  }

  /* --------------------------- temple-ambience music ------------------------- */

  /** Create the looping music element once; reused across mute/unmute cycles. */
  private ensureMusic(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null
    if (!this.music) {
      const audio = new Audio(MUSIC_SRC)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0
      this.music = audio
    }
    return this.music
  }

  /** Begin (or resume) the looping bed and fade it up to `MUSIC_LEVEL`. Safe to
   *  call while already playing — `play()` is a no-op and we just re-fade. */
  private startMusic(): void {
    this.disarmMusicResume?.()
    const audio = this.ensureMusic()
    if (!audio) return
    const myGen = this.gen
    // If it had faded out and paused, restart from silence; otherwise continue
    // from wherever the (possibly interrupted) fade-out left the volume.
    if (audio.paused) audio.volume = 0
    const fadeUp = () => {
      if (myGen !== this.gen) return // superseded by a stop()/restart
      this.fadeMusic(MUSIC_LEVEL, MUSIC_FADE_IN)
    }
    const p = audio.play()
    if (p && typeof p.then === 'function') {
      p.then(fadeUp).catch(() => {
        // Autoplay blocked (rare after a toggle gesture) — retry on next gesture.
        if (myGen === this.gen) this.armMusicOnGesture(audio)
      })
    } else {
      fadeUp()
    }
  }

  /** Fade the music element's volume to `to` over `seconds`, optionally pausing
   *  it once silent. Cancels any fade already in flight. */
  private fadeMusic(to: number, seconds: number, thenPause = false): void {
    const audio = this.music
    if (!audio) return
    if (this.musicFadeTimer) {
      clearInterval(this.musicFadeTimer)
      this.musicFadeTimer = null
    }
    const from = audio.volume
    const target = Math.min(1, Math.max(0, to))
    const steps = Math.max(1, Math.round((seconds * 1000) / MUSIC_FADE_STEP_MS))
    let i = 0
    this.musicFadeTimer = setInterval(() => {
      i++
      const v = from + (target - from) * (i / steps)
      audio.volume = Math.min(1, Math.max(0, v))
      if (i >= steps) {
        if (this.musicFadeTimer) {
          clearInterval(this.musicFadeTimer)
          this.musicFadeTimer = null
        }
        audio.volume = target
        if (thenPause) audio.pause()
      }
    }, MUSIC_FADE_STEP_MS)
  }

  /** One-shot gesture listeners that retry music playback if the autoplay policy
   *  blocked the initial `play()`. Removed on stop or once it fires. */
  private armMusicOnGesture(audio: HTMLAudioElement): void {
    this.disarmMusicResume?.()
    const events = ['pointerdown', 'keydown', 'touchstart']
    const myGen = this.gen
    const onGesture = () => {
      this.disarmMusicResume?.()
      if (myGen !== this.gen) return
      audio
        .play()
        .then(() => {
          if (myGen === this.gen) this.fadeMusic(MUSIC_LEVEL, MUSIC_FADE_IN)
        })
        .catch(() => {})
    }
    for (const ev of events) window.addEventListener(ev, onGesture, { once: true, passive: true })
    this.disarmMusicResume = () => {
      for (const ev of events) window.removeEventListener(ev, onGesture)
      this.disarmMusicResume = null
    }
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
   * Mute everything: fade the music bed out (then pause it) and fast-fade the UI
   * one-shot bus out before tearing down and `close()`-ing the Web Audio context
   * so nothing keeps running. The short fades avoid clicks while reading as an
   * instant mute.
   */
  stop(): void {
    this.gen++ // invalidate any in-flight start()
    this.disarmResume?.()
    this.disarmMusicResume?.()

    // Fade the temple-ambience file out, then pause it. The element itself is
    // kept (not nulled) so a later unmute reuses it without re-fetching.
    if (this.music && !this.music.paused) {
      this.fadeMusic(0, MUSIC_FADE_OUT, true)
    }

    const ctx = this.ctx
    const master = this.master

    // Detach references immediately so play()/setCluster() become no-ops at once.
    this.ctx = null
    this.master = null
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
