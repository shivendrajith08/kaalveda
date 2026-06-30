import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ForceGraph2D, {
  type ForceGraphMethods,
  type GraphData,
  type LinkObject,
} from 'react-force-graph-2d'
import { Maximize2, Crosshair, ArrowLeft } from 'lucide-react'
import { graph } from '@/lib/content'
import { clusters as allClusters, getCategoryName } from '@/data/categories'
import { palette, clusterAccent } from '@/styles/tokens'
import { useTheme } from '@/hooks/useTheme'
import { useSound } from '@/hooks/useSound'
import TimeScrubber from './TimeScrubber'
import { TODAY, buildBirthYears } from './timeScale'

/**
 * Knowledge Graph Canvas — a fullscreen, zoomable star-chart of every article
 * and the resolved links between them.
 *
 * Design notes (deliberate deviations from the brief, both toward the existing
 * design system):
 *   • Nodes are coloured by their `cluster` via the theme-aware palette
 *     (`clusterAccent`), not a hard-coded category→hex map. This is the same
 *     source of truth the Atlas uses and adapts to light/dark.
 *   • Only *resolved* edges (both endpoints are real articles) are drawn — the
 *     12 "frontier" links to uncharted ids would otherwise spawn ghost orbs.
 */

/** A node as it lives inside the force simulation. */
interface FgNode {
  id: string
  title: string
  category: string
  cluster: string
  degree: number
  /** Mutated in place by the force engine. */
  x?: number
  y?: number
  /** Eased display alpha for the time-travel fade (mutated in the draw loop). */
  __a?: number
  /** Timestamp of the last alpha update, for frame-rate-independent easing. */
  __t?: number
}

type FgLink = LinkObject<FgNode>

/** Parse a `#rrggbb` triple into [r, g, b]. */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Parse `#rrggbb` into an `rgba()` string at the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Blend a colour toward its own luminance-grey. `t = 1` is the full colour,
 * `t = 0` is fully desaturated — the look of a node that doesn't yet exist.
 */
function fadeColor(hex: string, t: number): string {
  const [r, g, b] = hexRgb(hex)
  const l = 0.299 * r + 0.587 * g + 0.114 * b
  const m = (c: number) => Math.round(l + (c - l) * t)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}

/** Map an eased alpha back to a 0–1 "vitality" (0 = absent, 1 = fully present). */
function vitality(alpha: number): number {
  return Math.max(0, Math.min(1, (alpha - 0.08) / 0.92))
}

/** Alpha an "absent" (after the playhead) node fades toward. */
const ABSENT_ALPHA = 0.08
/** Easing time-constant (seconds) for the ~400ms opacity transition. */
const FADE_TAU = 0.13

/** Resolve a link endpoint (string id, or a node object after the engine runs). */
function endId(end: FgLink['source']): string {
  return typeof end === 'object' && end ? String(end.id) : String(end)
}

export default function GraphCanvas() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { play } = useSound()
  const [params] = useSearchParams()
  const currentId = params.get('from')

  const fgRef = useRef<ForceGraphMethods<FgNode, FgLink> | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const fittedRef = useRef(false)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: FgNode } | null>(null)

  /* ---- Data (built once; positions persist across theme toggles) -------- */
  const { data, degreeRange, presentClusters } = useMemo(() => {
    const ids = new Set(graph.nodes.map((n) => n.id))
    const links = graph.edges
      .filter((e) => e.resolved && ids.has(e.source) && ids.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }))

    const degree = new Map<string, number>()
    for (const l of links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1)
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1)
    }

    const nodes: FgNode[] = graph.nodes.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      cluster: n.cluster,
      degree: degree.get(n.id) ?? 0,
    }))

    const degrees = nodes.map((n) => n.degree)
    const present = new Set(nodes.map((n) => n.cluster))

    return {
      data: { nodes, links } as GraphData<FgNode, FgLink>,
      degreeRange: { min: Math.min(...degrees), max: Math.max(...degrees) },
      presentClusters: present,
    }
  }, [])

  /* ---- Time travel ------------------------------------------------------ */
  const [year, setYear] = useState(TODAY)
  const birthYears = useMemo(() => buildBirthYears(data.nodes), [data])
  const nodeById = useMemo(
    () => new Map(data.nodes.map((n) => [n.id, n])),
    [data],
  )
  const existsAt = useCallback(
    (id: string) => (birthYears.get(id) ?? TODAY) <= year,
    [birthYears, year],
  )

  // Throttle scrubber updates to one React commit per frame (~16ms) so dragging
  // never outruns the canvas redraw.
  const pendingYear = useRef<number | null>(null)
  const yearRaf = useRef<number | undefined>(undefined)
  const handleYearChange = useCallback((y: number) => {
    pendingYear.current = y
    if (yearRaf.current != null) return
    yearRaf.current = requestAnimationFrame(() => {
      yearRaf.current = undefined
      if (pendingYear.current != null) setYear(pendingYear.current)
    })
  }, [])
  useEffect(
    () => () => {
      if (yearRaf.current != null) cancelAnimationFrame(yearRaf.current)
    },
    [],
  )

  /* ---- Theme-resolved colours ------------------------------------------ */
  const clusterColor = useMemo(() => {
    const p = palette[theme]
    const map: Record<string, string> = { unknown: p.gold }
    for (const [cluster, key] of Object.entries(clusterAccent)) map[cluster] = p[key]
    return map
  }, [theme])

  const edgeColor = useMemo(() => {
    const gold = palette[theme].gold
    return { gold, rest: 0.18, hover: 0.85, dim: 0.04 }
  }, [theme])

  const ink = palette[theme]

  /* ---- Hover neighbourhood --------------------------------------------- */
  const { neighborIds, hoverLinks } = useMemo(() => {
    const nb = new Set<string>()
    const hl = new Set<FgLink>()
    if (hoverId) {
      nb.add(hoverId)
      for (const l of data.links) {
        const s = endId(l.source)
        const t = endId(l.target)
        if (s === hoverId || t === hoverId) {
          nb.add(s)
          nb.add(t)
          hl.add(l)
        }
      }
    }
    return { neighborIds: nb, hoverLinks: hl }
  }, [hoverId, data])

  const radiusFor = (degree: number): number => {
    const { min, max } = degreeRange
    const t = max === min ? 0.5 : (degree - min) / (max - min)
    return 4 + t * 8
  }
  const labelThreshold = Math.max(4, Math.round(degreeRange.max * 0.5))

  /* ---- Size the canvas to its container --------------------------------- */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* ---- Loosen the layout so the 29 orbs breathe ------------------------- */
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('charge')?.strength(-160)
    fg.d3Force('link')?.distance(46)
    fg.d3ReheatSimulation()
  }, [])

  const fitToScreen = () => fgRef.current?.zoomToFit(500, 70)
  const resetZoom = () => {
    fgRef.current?.centerAt(0, 0, 400)
    fgRef.current?.zoom(1.4, 400)
  }

  return (
    <div ref={wrapRef} className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {size.width > 0 && (
        <ForceGraph2D<FgNode, FgLink>
          ref={fgRef}
          graphData={data}
          width={size.width}
          height={size.height}
          backgroundColor={ink.bg}
          autoPauseRedraw={false}
          minZoom={0.4}
          maxZoom={6}
          nodeRelSize={4}
          nodeVal={(n) => Math.max(1, n.degree)}
          enableNodeDrag
          cooldownTime={4000}
          onEngineStop={() => {
            if (!fittedRef.current) {
              fittedRef.current = true
              fgRef.current?.zoomToFit(600, 70)
            }
          }}
          /* ---- Links ---- */
          linkColor={(l: FgLink) => {
            // Fade an edge with whichever endpoint is least "present"; an edge
            // touching a not-yet-existing node disappears entirely.
            const sa = nodeById.get(endId(l.source))?.__a ?? 1
            const ta = nodeById.get(endId(l.target))?.__a ?? 1
            const v = Math.min(vitality(sa), vitality(ta))
            if (v <= 0.001) return 'rgba(0,0,0,0)'
            const a = !hoverId
              ? edgeColor.rest
              : hoverLinks.has(l)
                ? edgeColor.hover
                : edgeColor.dim
            return hexToRgba(edgeColor.gold, a * v)
          }}
          linkWidth={(l: FgLink) => (hoverLinks.has(l) ? 2 : 1)}
          /* ---- Nodes ---- */
          onNodeClick={(n) => {
            if (existsAt(String(n.id))) navigate(`/article/${n.id}`)
          }}
          onNodeHover={(n) => {
            // Not-yet-existing nodes are inert — no hover, no tooltip.
            const active = n && existsAt(String(n.id)) ? n : null
            // A whisper-quiet chime on entering a new orb (no-op while muted).
            if (active && String(active.id) !== hoverId) play('hover')
            setHoverId(active ? String(active.id) : null)
            if (active && active.x != null && active.y != null) {
              const screen = fgRef.current?.graph2ScreenCoords(active.x, active.y)
              if (screen) setTooltip({ x: screen.x, y: screen.y, node: active })
            } else {
              setTooltip(null)
            }
            if (wrapRef.current) wrapRef.current.style.cursor = active ? 'pointer' : 'grab'
          }}
          nodePointerAreaPaint={(n, color, ctx) => {
            if (!existsAt(String(n.id))) return // unclickable once "after"
            const r = radiusFor(n.degree)
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(n.x ?? 0, n.y ?? 0, r + 2, 0, 2 * Math.PI)
            ctx.fill()
          }}
          nodeCanvasObject={(n, ctx, globalScale) => {
            const x = n.x ?? 0
            const y = n.y ?? 0
            const r = radiusFor(n.degree)
            const base = clusterColor[n.cluster] ?? clusterColor.unknown
            const isCurrent = n.id === currentId
            const focused = !hoverId || neighborIds.has(String(n.id))

            // Time-travel fade — ease the display alpha toward the present
            // (1) or absent (0.08) target over ~400ms, frame-rate independent.
            const exists = (birthYears.get(n.id) ?? TODAY) <= year
            const target = exists ? 1 : ABSENT_ALPHA
            const now = performance.now()
            const dt = n.__t != null ? (now - n.__t) / 1000 : 0
            n.__t = now
            if (n.__a == null) n.__a = target
            else n.__a += (target - n.__a) * (1 - Math.exp(-dt / FADE_TAU))
            const v = vitality(n.__a) // 0 = not yet, 1 = fully present

            ctx.globalAlpha = n.__a * (focused ? 1 : 0.22)

            // soft glow — fades out as the node recedes into the future
            if (v > 0.01) {
              const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4)
              glow.addColorStop(0, hexToRgba(base, 0.4 * v))
              glow.addColorStop(1, hexToRgba(base, 0))
              ctx.fillStyle = glow
              ctx.beginPath()
              ctx.arc(x, y, r * 2.4, 0, 2 * Math.PI)
              ctx.fill()
            }

            // orb — desaturated toward grey while "after" the playhead
            ctx.beginPath()
            ctx.arc(x, y, r, 0, 2 * Math.PI)
            ctx.fillStyle = fadeColor(base, v)
            ctx.fill()
            ctx.lineWidth = 1 / globalScale
            ctx.strokeStyle = hexToRgba(ink.bg, 0.55)
            ctx.stroke()

            // pulsing gold ring on the "you are here" node
            if (isCurrent && exists) {
              const phase = (Math.sin(performance.now() / 600) + 1) / 2
              ctx.beginPath()
              ctx.arc(x, y, r + 2.5 + phase * 4, 0, 2 * Math.PI)
              ctx.strokeStyle = hexToRgba(ink.gold, 0.9 - phase * 0.55)
              ctx.lineWidth = (1.6 + phase) / globalScale
              ctx.stroke()
            }

            // label — hubs + the current/hovered node, or once zoomed in
            const showLabel =
              focused &&
              exists &&
              (isCurrent ||
                String(n.id) === hoverId ||
                n.degree >= labelThreshold ||
                globalScale > 1.6)
            if (showLabel) {
              const fontSize = 11 / globalScale
              ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              const ty = y + r + 3 / globalScale
              ctx.lineWidth = 3 / globalScale
              ctx.strokeStyle = hexToRgba(ink.bg, 0.85)
              ctx.strokeText(n.title, x, ty)
              ctx.fillStyle = isCurrent || String(n.id) === hoverId ? ink.gold : ink.muted
              ctx.fillText(n.title, x, ty)
            }

            ctx.globalAlpha = 1
          }}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="glass-strong pointer-events-none absolute z-20 max-w-[15rem] -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 shadow-float"
          style={{ left: tooltip.x, top: tooltip.y - 14 }}
        >
          <p className="truncate text-sm font-medium text-fg">{tooltip.node.title}</p>
          <p className="label mt-0.5 text-faint">{getCategoryName(tooltip.node.category)}</p>
        </div>
      )}

      {/* Top-left — title, back link, legend */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs">
        <Link
          to="/explore"
          className="pointer-events-auto inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-gold"
        >
          <ArrowLeft size={13} /> Back to Atlas
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-fg">Knowledge Map</h1>
        <p className="mt-1 text-xs text-muted">
          Every article and the paths between them. Click an orb to travel there.
        </p>
        <ul className="glass mt-3 inline-flex flex-col gap-1.5 rounded-lg px-3 py-2.5">
          {allClusters
            .filter((c) => presentClusters.has(c.id))
            .map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-xs text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: clusterColor[c.id] }}
                  aria-hidden
                />
                {c.name}
              </li>
            ))}
        </ul>
      </div>

      {/* Top-right — controls + counts */}
      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fitToScreen}
            className="glass flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium text-muted transition-colors hover:text-gold"
          >
            <Maximize2 size={14} /> Fit to screen
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="glass flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium text-muted transition-colors hover:text-gold"
          >
            <Crosshair size={14} /> Reset zoom
          </button>
        </div>
        <p className="glass label rounded-full px-3 py-1.5 text-faint">
          {data.nodes.length} nodes · {data.links.length} links
        </p>
      </div>

      {/* Time-Travel scrubber */}
      <TimeScrubber year={year} onChange={handleYearChange} />

      {/* depth vignette */}
      <div className="vignette pointer-events-none absolute inset-0 z-0" aria-hidden />
    </div>
  )
}
