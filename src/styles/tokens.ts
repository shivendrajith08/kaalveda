/**
 * KaalVeda design tokens — the single source of truth.
 *
 * Design identity: "Illuminated Manuscript meets Star Chart".
 * Midnight indigo, warm gold, parchment cream — an antique celestial atlas.
 *
 * This module feeds BOTH:
 *   1. Tailwind (via `tailwindColors`, `fontFamily`, `radii`, `shadows`) at build time, and
 *   2. The runtime CSS custom properties (via `paletteToVars`) applied on <html>.
 *
 * To change a colour, edit it here once. Nothing else hardcodes palette values.
 */

export type ThemeMode = 'dark' | 'light'

/** Semantic colour roles. The same keys exist for both themes. */
export interface Palette {
  /** App background — deepest layer. */
  bg: string
  /** Raised panel / card background. */
  surface: string
  /** Highest elevation (popovers, command palette). */
  elevated: string
  /** Hairline borders and dividers. */
  border: string
  /** Stronger border / outline. */
  'border-strong': string
  /** Primary text. */
  fg: string
  /** Secondary text. */
  muted: string
  /** Tertiary / disabled text. */
  faint: string
  /** Primary accent — warm gold. */
  gold: string
  /** Lighter gold for hovers / glows. */
  'gold-soft': string
  /** Deeper gold for pressed / borders. */
  'gold-deep': string
  /** Parchment cream — used for highlighted surfaces. */
  parchment: string
  /** Ink colour used on parchment surfaces. */
  ink: string
  /** Fact-status: verified. */
  verified: string
  /** Fact-status: theory. */
  theory: string
  /** Fact-status: speculation. */
  speculation: string
  /** Cluster accent — Cosmos & Earth. */
  'cluster-cosmos': string
  /** Cluster accent — Life & Time. */
  'cluster-life': string
  /** Cluster accent — Belief & Story. */
  'cluster-belief': string
  /** Cluster accent — Mind & Knowledge. */
  'cluster-mind': string
  /** Cluster accent — Society & Tomorrow. */
  'cluster-society': string
}

export const palette: Record<ThemeMode, Palette> = {
  dark: {
    bg: '#0d1117',
    surface: '#131b26',
    elevated: '#19222f',
    border: 'rgba(212, 175, 110, 0.14)',
    'border-strong': 'rgba(212, 175, 110, 0.30)',
    fg: '#ece3cf',
    muted: '#a9b1bd',
    faint: '#6b7585',
    gold: '#d4af6e',
    'gold-soft': '#e7c98c',
    'gold-deep': '#a9824a',
    parchment: '#efe5cc',
    ink: '#2a2417',
    verified: '#6fbf8b',
    theory: '#d4af6e',
    speculation: '#c98a8a',
    'cluster-cosmos': '#7aa2c4',
    'cluster-life': '#c98f6a',
    'cluster-belief': '#c4a062',
    'cluster-mind': '#8fb3a0',
    'cluster-society': '#b08fc4',
  },
  light: {
    bg: '#f4ecd8',
    surface: '#fbf6e9',
    elevated: '#ffffff',
    border: 'rgba(96, 72, 38, 0.18)',
    'border-strong': 'rgba(96, 72, 38, 0.34)',
    fg: '#2a2417',
    muted: '#5c5340',
    faint: '#8a7f66',
    gold: '#9a7634',
    'gold-soft': '#b08f4c',
    'gold-deep': '#7a5d28',
    parchment: '#fbf6e9',
    ink: '#2a2417',
    verified: '#2f7d4f',
    theory: '#9a7634',
    speculation: '#a85b5b',
    'cluster-cosmos': '#3a6a93',
    'cluster-life': '#9a5a32',
    'cluster-belief': '#8a6a1e',
    'cluster-mind': '#3f6f57',
    'cluster-society': '#6f4a8a',
  },
}

const paletteKeys = Object.keys(palette.dark) as (keyof Palette)[]

/** CSS custom-property name for a palette key, e.g. `gold-soft` -> `--c-gold-soft`. */
export const cssVarName = (key: keyof Palette): string => `--c-${key}`

/**
 * Tailwind colour map: every semantic role resolved through a CSS variable.
 *
 * We wrap each variable in `color-mix(... <alpha-value> ...)` so Tailwind's
 * slash-opacity modifiers (e.g. `bg-gold/12`) work even though the underlying
 * value is a CSS custom property rather than a parseable literal.
 */
export const tailwindColors: Record<string, string> = Object.fromEntries(
  paletteKeys.map((k) => [
    k,
    `color-mix(in srgb, var(${cssVarName(k)}) calc(<alpha-value> * 100%), transparent)`,
  ]),
)

/** Resolve a theme into a record of `--c-*` custom properties. */
export function paletteToVars(mode: ThemeMode): Record<string, string> {
  const p = palette[mode]
  return Object.fromEntries(paletteKeys.map((k) => [cssVarName(k), p[k]]))
}

export const fontFamily = {
  display: ["'Fraunces'", 'Georgia', 'serif'],
  body: ["'Inter'", 'system-ui', 'sans-serif'],
  mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
} as const

export const radii = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '0.875rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  full: '9999px',
} as const

export const shadows = {
  card: '0 1px 0 0 rgba(212,175,110,0.06), 0 18px 40px -24px rgba(0,0,0,0.65)',
  glow: '0 0 0 1px rgba(212,175,110,0.25), 0 0 40px -8px rgba(212,175,110,0.35)',
  float: '0 30px 80px -30px rgba(0,0,0,0.75)',
  inset: 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
} as const

/** Cluster id -> accent palette key, used by the Atlas + graph. */
export const clusterAccent: Record<string, keyof Palette> = {
  'cosmos-earth': 'cluster-cosmos',
  'life-time': 'cluster-life',
  'belief-story': 'cluster-belief',
  'mind-knowledge': 'cluster-mind',
  'society-tomorrow': 'cluster-society',
}

export const tokens = {
  palette,
  tailwindColors,
  fontFamily,
  radii,
  shadows,
  clusterAccent,
} as const
