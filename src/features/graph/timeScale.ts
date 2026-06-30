import { timelines } from '@/data/timelines'
import { getArticle } from '@/lib/content'

/**
 * Time-travel scale + era mapping for the Knowledge Graph scrubber.
 *
 * The graph spans 13.8 billion years of cosmic time *and* the last ~5,000 years
 * of human civilization. A plain linear slider would crush every civilization
 * into the rightmost 0.0002 % of the track. So the playhead runs on a
 * **piecewise scale**:
 *
 *   • deep time  (MIN_YEAR … PIVOT)  → log-compressed into the left `SPLIT`
 *   • human time (PIVOT … TODAY)     → linear across the remaining `1 - SPLIT`
 *
 * `yearToFraction` / `fractionToYear` are exact inverses, so the slider handle,
 * the auto-play animation and the preset jumps all share one source of truth.
 */

/** Right edge of the scale — "Today". */
export const TODAY = new Date().getFullYear()

/** All event years across every timeline (universe included). */
const allYears = timelines.flatMap((t) => t.events.map((e) => e.year))

/** Left edge of the scale — the most negative year on record (the Big Bang). */
export const MIN_YEAR = Math.min(...allYears)

/** Where deep time hands off to human history (a little before Egypt/Indus). */
const PIVOT = -5000
/** Fraction of the track given to deep time; the rest is human history. */
const SPLIT = 0.45
const MAX_AGO = PIVOT - MIN_YEAR
const LOG_MAX_AGO = Math.log10(1 + MAX_AGO)

/** Map a calendar year to a slider fraction in [0, 1] (monotonic, non-linear). */
export function yearToFraction(year: number): number {
  if (year >= TODAY) return 1
  if (year <= MIN_YEAR) return 0
  if (year <= PIVOT) {
    const t = Math.log10(1 + (PIVOT - year)) / LOG_MAX_AGO
    return SPLIT * (1 - t)
  }
  const u = (year - PIVOT) / (TODAY - PIVOT)
  return SPLIT + (1 - SPLIT) * u
}

/** Inverse of {@link yearToFraction} — slider fraction back to a calendar year. */
export function fractionToYear(fraction: number): number {
  if (fraction >= 1) return TODAY
  if (fraction <= 0) return MIN_YEAR
  if (fraction >= SPLIT) {
    const u = (fraction - SPLIT) / (1 - SPLIT)
    return Math.round(PIVOT + u * (TODAY - PIVOT))
  }
  const t = 1 - fraction / SPLIT
  return Math.round(PIVOT - (Math.pow(10, t * LOG_MAX_AGO) - 1))
}

/** Human-readable year label — "13.8 Bya", "1200 BCE", "1517 CE", "Today". */
export function formatYear(year: number): string {
  if (year >= TODAY) return 'Today'
  const a = Math.abs(year)
  if (a >= 1e9) return `${(a / 1e9).toFixed(1)} Bya`
  if (a >= 1e6) return `${Math.round(a / 1e6)} Mya`
  if (year < 0) return `${a.toLocaleString()} BCE`
  return `${year} CE`
}

export interface Preset {
  id: string
  label: string
  year: number
}

/** Quick-jump pills below the slider. */
export const PRESETS: Preset[] = [
  { id: 'bronze', label: 'Bronze Age', year: -3000 },
  { id: 'classical', label: 'Classical Era', year: -500 },
  { id: 'roman', label: 'Roman Empire', year: 100 },
  { id: 'medieval', label: 'Middle Ages', year: 1000 },
  { id: 'today', label: 'Today', year: TODAY },
]

/* ------------------------------------------------------------------ */
/* Article → "first existing" year                                     */
/* ------------------------------------------------------------------ */

/** Earliest event year of each timeline, keyed by timeline id. */
const timelineEarliest = new Map<string, number>(
  timelines.map((t) => [t.id, Math.min(...t.events.map((e) => e.year))]),
)

/** Year of any timeline event whose id exactly matches an article/node id. */
const eventYearById = new Map<string, number>()
for (const t of timelines) {
  for (const e of t.events) {
    const prev = eventYearById.get(e.id)
    if (prev == null || e.year < prev) eventYearById.set(e.id, e.year)
  }
}

interface MinimalNode {
  id: string
  cluster: string
}

/**
 * Infer the timeline of the *civilization* an untimelined article belongs to.
 *
 * `category` is too coarse to use here — "architecture", "religions" and
 * "kingdoms-empires" each span Egypt, Greece and Rome. Instead we read the
 * article's own links: its `related` list is authored most-relevant-first, so
 * Roman articles lead with Roman links and Egyptian ones with Egyptian links.
 * We tally the timelines those related articles carry and pick the winner
 * (ties broken by authored position), e.g. `julius-caesar`/`roman-empire` →
 * `rome` rather than the broader `life-time` cluster's earliest (Egypt).
 */
function inferCivilizationTimeline(id: string): string | null {
  const related = getArticle(id)?.related
  if (!related) return null

  const tally = new Map<string, { count: number; first: number }>()
  related.forEach((relatedId, index) => {
    const tl = getArticle(relatedId)?.media.timeline
    if (!tl) return
    const entry = tally.get(tl)
    if (entry) entry.count += 1
    else tally.set(tl, { count: 1, first: index })
  })

  let best: string | null = null
  let bestCount = -1
  let bestFirst = Infinity
  for (const [tl, { count, first }] of tally) {
    if (count > bestCount || (count === bestCount && first < bestFirst)) {
      best = tl
      bestCount = count
      bestFirst = first
    }
  }
  return best
}

/**
 * Compute the "birth year" of every node — the year at/after which its subject
 * is considered to exist. A node is shown once the playhead reaches this year.
 *
 * Mapping cascade (most specific wins):
 *   1. **Exact event match** — a timeline event whose id equals the node id
 *      (e.g. `trojan-war`, `ramayana`, `mahabharata`) → that event's year.
 *   2. **Direct timeline** — the article's `media.timeline` → that timeline's
 *      earliest event (Egypt −3100, Greece −1600, Rome −753, Christianity −4,
 *      Islam 570, Hinduism −3000, Universe −13.8 By). Sub-articles light up
 *      with their tradition's founding (e.g. every `islam` article at 570).
 *   3a. **Same-civilization timeline** — for untimelined articles, the earliest
 *      event of the civilization inferred from their links
 *      ({@link inferCivilizationTimeline}). Roman articles anchor to Rome
 *      (−753), Egyptian ones to Egypt (−3100), not the broad cluster.
 *   3b. **Cluster fallback** — only when no same-civilization timeline exists:
 *      the earliest timeline event among same-cluster articles that *do* have a
 *      timeline (cosmos articles with no civ links inherit the Big Bang).
 *   4. **Today** — nothing to anchor to (e.g. "The Future of Space") → reveal
 *      only at the present.
 */
export function buildBirthYears(nodes: MinimalNode[]): Map<string, number> {
  const direct = new Map<string, number>()
  const clusterEarliest = new Map<string, number>()

  for (const n of nodes) {
    const tl = getArticle(n.id)?.media.timeline
    if (!tl) continue
    const earliest = timelineEarliest.get(tl)
    if (earliest == null) continue
    direct.set(n.id, earliest)
    const cur = clusterEarliest.get(n.cluster)
    clusterEarliest.set(n.cluster, cur == null ? earliest : Math.min(cur, earliest))
  }

  const out = new Map<string, number>()
  for (const n of nodes) {
    let birth = eventYearById.get(n.id) ?? direct.get(n.id)
    if (birth == null) {
      const civTimeline = inferCivilizationTimeline(n.id)
      birth =
        (civTimeline != null ? timelineEarliest.get(civTimeline) : undefined) ??
        clusterEarliest.get(n.cluster) ??
        TODAY
    }
    out.set(n.id, birth)
  }
  return out
}
