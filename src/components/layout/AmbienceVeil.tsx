/**
 * Time-of-day ambience veil — three fixed, non-interactive gradient layers
 * (a warm top-glow, a warm vignette, and a cool deepening wash) whose opacities
 * are driven entirely by the `[data-ambience]` CSS variables in globals.css.
 *
 * It sits *behind* all page content (the content shell is lifted above it), so
 * it tints the atmosphere around and behind the stars without ever passing over
 * text — readability and contrast are untouched. Only `opacity` transitions, so
 * the live phase fade is GPU-friendly and causes no layout shift.
 */
export function AmbienceVeil() {
  return (
    <div className="ambience-veil" aria-hidden>
      <span className="ambience-veil__warm" />
      <span className="ambience-veil__vignette" />
      <span className="ambience-veil__cool" />
    </div>
  )
}
