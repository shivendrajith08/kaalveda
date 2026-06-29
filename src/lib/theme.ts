import { paletteToVars, type ThemeMode } from '@/styles/tokens'

export const THEME_STORAGE_KEY = 'kaalveda-theme'

/**
 * Apply a theme by writing every `--c-*` custom property from the single
 * token source onto <html>. Because the variables come straight from
 * `tokens.ts`, there is no second place to keep palette values in sync.
 */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const vars = paletteToVars(mode)
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value)
  }
  root.dataset.theme = mode
  root.style.colorScheme = mode
}

/**
 * Resolve the startup theme. Defaults to dark (the brand is dark-first and
 * the inline script in index.html assumes dark), but honours a stored choice.
 */
export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* localStorage may be unavailable (private mode) — fall through */
  }
  return 'dark'
}

export function persistTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}
