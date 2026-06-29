import { clsx, type ClassValue } from 'clsx'
import type { FactStatus } from '@/types'

/** Tailwind-friendly className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Format a signed year as a human era string, e.g. -30 -> "30 BCE". */
export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`
  return `${year.toLocaleString()} CE`
}

export interface FactStatusMeta {
  label: string
  description: string
  /** CSS colour, resolved from the design tokens. */
  color: string
}

export function factStatusMeta(status: FactStatus): FactStatusMeta {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        description: 'Well-established by scholarly and scientific consensus.',
        color: 'var(--c-verified)',
      }
    case 'theory':
      return {
        label: 'Theory',
        description: 'A leading explanation supported by evidence but still debated.',
        color: 'var(--c-theory)',
      }
    case 'speculation':
      return {
        label: 'Speculation',
        description: 'Informed conjecture that goes beyond current evidence.',
        color: 'var(--c-speculation)',
      }
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** Deterministic 0..1 hash for laying out the Atlas without randomness jumps. */
export function hashUnit(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}
