/**
 * KaalVeda content engine.
 *
 * Scans every `.mdx` file in `content/`, parses frontmatter + Markdown body
 * into typed blocks, and regenerates `src/data/generated/`:
 *
 *   articles.json       — full articles (frontmatter + parsed body blocks)
 *   graph.json          — knowledge-graph nodes + edges from each `related[]`
 *   search-index.json   — ranked search records for the ⌘K palette
 *
 * Runs automatically via BOTH `predev` and `prebuild` in package.json, so the
 * dev server and every production/Vercel build always use fresh data.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')
const OUT_DIR = join(ROOT, 'src', 'data', 'generated')
const TAXONOMY_PATH = join(ROOT, 'src', 'data', 'taxonomy.json')

const VALID_FACT_STATUS = new Set(['verified', 'theory', 'speculation'])

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function titleCase(id) {
  return String(id)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function stripInline(text) {
  return String(text)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[*_`~]/g, '')
    .trim()
}

function tokenize(text) {
  return stripInline(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
}

/* ------------------------------------------------------------------ */
/* Markdown body -> typed blocks                                       */
/* ------------------------------------------------------------------ */

function parseBody(markdown) {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  const toc = []
  let i = 0

  const isBlank = (l) => l.trim() === ''

  while (i < lines.length) {
    let line = lines[i]

    if (isBlank(line)) {
      i++
      continue
    }

    const trimmed = line.trim()

    // Divider
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'divider' })
      i++
      continue
    }

    // Callout:  :::tone Optional Title  ...  :::
    const calloutOpen = trimmed.match(/^:::(\w+)\s*(.*)$/)
    if (calloutOpen) {
      const tone = ['note', 'insight', 'caution'].includes(calloutOpen[1])
        ? calloutOpen[1]
        : 'note'
      const title = calloutOpen[2].trim() || undefined
      i++
      const buf = []
      while (i < lines.length && lines[i].trim() !== ':::') {
        buf.push(lines[i])
        i++
      }
      i++ // consume closing :::
      blocks.push({
        type: 'callout',
        tone,
        ...(title ? { title } : {}),
        text: buf.join(' ').replace(/\s+/g, ' ').trim(),
      })
      continue
    }

    // Heading (## or ###)
    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length === 3 ? 3 : 2
      const text = heading[2].trim()
      const id = slugify(text)
      blocks.push({ type: 'heading', level, text, id })
      toc.push({ id, text: stripInline(text), level })
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const quoteLines = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      let cite
      const textLines = []
      for (const ql of quoteLines) {
        const citeMatch = ql.match(/^(?:—|--)\s*(.+)$/)
        if (citeMatch) cite = citeMatch[1].trim()
        else if (ql.trim()) textLines.push(ql)
      }
      blocks.push({
        type: 'quote',
        text: textLines.join(' ').replace(/\s+/g, ' ').trim(),
        ...(cite ? { cite } : {}),
      })
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, '').trim())
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, '').trim())
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // Paragraph (gather consecutive plain lines)
    const para = []
    while (i < lines.length) {
      const l = lines[i]
      const t = l.trim()
      if (isBlank(l)) break
      if (/^(#{2,3})\s+/.test(t)) break
      if (/^>\s?/.test(t)) break
      if (/^[-*+]\s+/.test(t)) break
      if (/^\d+\.\s+/.test(t)) break
      if (/^:::/.test(t)) break
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) break
      para.push(t)
      i++
    }
    if (para.length) {
      blocks.push({ type: 'paragraph', text: para.join(' ').replace(/\s+/g, ' ').trim() })
    }
  }

  return { blocks, toc }
}

function countWords(blocks) {
  let n = 0
  for (const b of blocks) {
    if (b.type === 'paragraph' || b.type === 'quote' || b.type === 'callout') {
      n += stripInline(b.text).split(/\s+/).filter(Boolean).length
    } else if (b.type === 'list') {
      for (const it of b.items) n += stripInline(it).split(/\s+/).filter(Boolean).length
    } else if (b.type === 'heading') {
      n += stripInline(b.text).split(/\s+/).filter(Boolean).length
    }
  }
  return n
}

/* ------------------------------------------------------------------ */
/* Frontmatter normalisation                                           */
/* ------------------------------------------------------------------ */

function normalizeJourney(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((step) => {
      if (typeof step === 'string') return { id: step, label: titleCase(step) }
      if (step && typeof step === 'object') {
        const id = String(step.id ?? step.slug ?? '').trim()
        if (!id) return null
        return {
          id,
          label: String(step.label ?? titleCase(id)),
          ...(step.hint ? { hint: String(step.hint) } : {}),
        }
      }
      return null
    })
    .filter(Boolean)
}

function normalizeMedia(raw) {
  const m = raw && typeof raw === 'object' ? raw : {}
  const arr = (x) => (Array.isArray(x) ? x : [])
  return {
    maps: arr(m.maps).map((it) => ({
      title: String(it.title ?? 'Map'),
      caption: String(it.caption ?? ''),
      ...(it.region ? { region: String(it.region) } : {}),
    })),
    images: arr(m.images).map((it) => ({
      title: String(it.title ?? 'Image'),
      caption: String(it.caption ?? ''),
      ...(it.credit ? { credit: String(it.credit) } : {}),
    })),
    videos: arr(m.videos).map((it) => ({
      title: String(it.title ?? 'Video'),
      caption: String(it.caption ?? ''),
      ...(it.duration ? { duration: String(it.duration) } : {}),
      ...(it.provider ? { provider: String(it.provider) } : {}),
    })),
    timeline: m.timeline ? String(m.timeline) : null,
    quiz: m.quiz ? String(m.quiz) : null,
  }
}

function normalizeCitations(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((c) => ({
    label: String(c.label ?? c.source ?? 'Source'),
    source: String(c.source ?? c.label ?? ''),
    ...(c.url ? { url: String(c.url) } : {}),
  }))
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main() {
  const taxonomy = JSON.parse(readFileSync(TAXONOMY_PATH, 'utf8'))
  const categoryToCluster = new Map()
  const categoryName = new Map()
  for (const cat of taxonomy.categories) {
    categoryToCluster.set(cat.id, cat.cluster)
    categoryName.set(cat.id, cat.name)
  }

  if (!existsSync(CONTENT_DIR)) {
    console.warn(`[content] No content/ directory at ${CONTENT_DIR} — writing empty datasets.`)
  }

  const files = existsSync(CONTENT_DIR)
    ? readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    : []

  const articles = []
  const warnings = []

  for (const file of files.sort()) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    const fallbackId = slugify(basename(file).replace(/\.(mdx|md)$/, ''))
    const id = String(data.id ?? fallbackId)

    if (!data.title) warnings.push(`${file}: missing "title"`)

    const factStatus = VALID_FACT_STATUS.has(data.factStatus) ? data.factStatus : 'verified'
    if (data.factStatus && !VALID_FACT_STATUS.has(data.factStatus)) {
      warnings.push(`${file}: invalid factStatus "${data.factStatus}" — defaulting to verified`)
    }

    const category = String(data.category ?? 'world-history')
    if (!categoryToCluster.has(category)) {
      warnings.push(`${file}: unknown category "${category}"`)
    }

    const { blocks, toc } = parseBody(content)
    const wordCount = countWords(blocks)
    const readMins =
      Number.isFinite(data.readMins) && data.readMins > 0
        ? Math.round(data.readMins)
        : Math.max(1, Math.round(wordCount / 200))

    articles.push({
      id,
      title: String(data.title ?? titleCase(id)),
      category,
      factStatus,
      readMins,
      eyebrow: String(data.eyebrow ?? categoryName.get(category) ?? ''),
      lede: String(data.lede ?? ''),
      related: Array.isArray(data.related) ? data.related.map(String) : [],
      journey: normalizeJourney(data.journey),
      media: normalizeMedia(data.media),
      citations: normalizeCitations(data.citations),
      body: blocks,
      toc,
      wordCount,
    })
  }

  articles.sort((a, b) => a.title.localeCompare(b.title))

  /* -------- Knowledge graph -------- */
  const articleIds = new Set(articles.map((a) => a.id))
  const nodes = articles.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    cluster: categoryToCluster.get(a.category) ?? 'unknown',
    factStatus: a.factStatus,
  }))

  const edgeSeen = new Set()
  const edges = []
  for (const a of articles) {
    for (const target of a.related) {
      if (target === a.id) continue
      const key = [a.id, target].sort().join('__')
      if (edgeSeen.has(key)) continue
      edgeSeen.add(key)
      edges.push({
        source: a.id,
        target,
        resolved: articleIds.has(target),
      })
    }
  }

  const graph = { nodes, edges }

  /* -------- Search index -------- */
  const searchRecords = []
  for (const a of articles) {
    const cluster = categoryToCluster.get(a.category) ?? undefined
    const keywords = Array.from(
      new Set([
        ...tokenize(a.title),
        ...tokenize(a.eyebrow),
        ...tokenize(a.lede),
        ...tokenize(categoryName.get(a.category) ?? ''),
        ...a.related.map((r) => r.toLowerCase()),
      ]),
    )
    searchRecords.push({
      id: a.id,
      kind: 'article',
      title: a.title,
      subtitle: a.eyebrow || categoryName.get(a.category) || '',
      category: a.category,
      ...(cluster ? { cluster } : {}),
      keywords,
    })
  }
  for (const cat of taxonomy.categories) {
    searchRecords.push({
      id: cat.id,
      kind: 'category',
      title: cat.name,
      subtitle: `${taxonomy.clusters.find((c) => c.id === cat.cluster)?.name ?? ''} · Category`,
      category: cat.id,
      cluster: cat.cluster,
      keywords: Array.from(new Set([...tokenize(cat.name), ...tokenize(cat.blurb)])),
    })
  }

  /* -------- Write -------- */
  mkdirSync(OUT_DIR, { recursive: true })
  const write = (name, data) =>
    writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8')

  write('articles.json', articles)
  write('graph.json', graph)
  write('search-index.json', searchRecords)

  /* -------- Report -------- */
  const resolvedEdges = edges.filter((e) => e.resolved).length
  console.log('\n  KaalVeda content engine')
  console.log('  ─────────────────────────────')
  console.log(`  articles        ${articles.length}`)
  console.log(`  graph nodes     ${nodes.length}`)
  console.log(`  graph edges     ${edges.length} (${resolvedEdges} resolved)`)
  console.log(`  search records  ${searchRecords.length}`)
  console.log(`  output          src/data/generated/`)
  if (warnings.length) {
    console.log('\n  warnings:')
    for (const w of warnings) console.log(`    • ${w}`)
  }
  console.log('')
}

main()
