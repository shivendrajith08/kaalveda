/**
 * Shared domain types for KaalVeda.
 *
 * The shapes here are the contract between the content engine
 * (`scripts/build-content.mjs`) and the React app. The generated JSON in
 * `src/data/generated/` conforms to `Article`, `KnowledgeGraph` and
 * `SearchRecord` below.
 */

export type { ThemeMode } from '@/styles/tokens'

/** Epistemic status of an article, rendered as a coloured badge. */
export type FactStatus = 'verified' | 'theory' | 'speculation'

export type ClusterId =
  | 'cosmos-earth'
  | 'life-time'
  | 'belief-story'
  | 'mind-knowledge'
  | 'society-tomorrow'

export type CategoryId = string

/* ------------------------------------------------------------------ */
/* Parsed body blocks                                                  */
/* ------------------------------------------------------------------ */

export interface HeadingBlock {
  type: 'heading'
  level: 2 | 3
  text: string
  /** Slug id used for anchors + the table of contents. */
  id: string
}

export interface ParagraphBlock {
  type: 'paragraph'
  /** Inline Markdown (bold/italic/links/code) preserved as raw text. */
  text: string
}

export interface ListBlock {
  type: 'list'
  ordered: boolean
  items: string[]
}

export interface QuoteBlock {
  type: 'quote'
  text: string
  cite?: string
}

export type CalloutTone = 'note' | 'insight' | 'caution'

export interface CalloutBlock {
  type: 'callout'
  tone: CalloutTone
  title?: string
  text: string
}

export interface DividerBlock {
  type: 'divider'
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | QuoteBlock
  | CalloutBlock
  | DividerBlock

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export interface MediaMap {
  title: string
  caption: string
  region?: string
}

export interface MediaImage {
  title: string
  caption: string
  credit?: string
}

export interface MediaVideo {
  title: string
  caption: string
  duration?: string
  provider?: string
}

export interface ArticleMedia {
  maps: MediaMap[]
  images: MediaImage[]
  videos: MediaVideo[]
  /** Timeline id resolved from `src/data/timelines.ts`, or null. */
  timeline: string | null
  /** Quiz id resolved from `src/data/quizzes.ts`, or null. */
  quiz: string | null
}

/* ------------------------------------------------------------------ */
/* Articles + journey                                                  */
/* ------------------------------------------------------------------ */

export interface Citation {
  label: string
  source: string
  url?: string
}

/** A single stop on a knowledge journey (the path rail). */
export interface JourneyStep {
  /** Article id the step links to (may not yet exist as an article). */
  id: string
  label: string
  hint?: string
}

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

export interface Article {
  id: string
  title: string
  category: CategoryId
  factStatus: FactStatus
  readMins: number
  eyebrow: string
  lede: string
  related: string[]
  journey: JourneyStep[]
  media: ArticleMedia
  citations: Citation[]
  body: Block[]
  toc: TocEntry[]
  wordCount: number
}

/** Lightweight article summary for cards, rails and graph hovers. */
export interface ArticleSummary {
  id: string
  title: string
  category: CategoryId
  factStatus: FactStatus
  readMins: number
  eyebrow: string
  lede: string
}

/* ------------------------------------------------------------------ */
/* Knowledge graph                                                     */
/* ------------------------------------------------------------------ */

export interface GraphNode {
  id: string
  title: string
  category: CategoryId
  cluster: ClusterId | 'unknown'
  factStatus: FactStatus
}

export interface GraphEdge {
  source: string
  target: string
  /** True when both articles exist (a navigable link). */
  resolved: boolean
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export type SearchKind = 'article' | 'category'

export interface SearchRecord {
  id: string
  kind: SearchKind
  title: string
  subtitle: string
  category?: CategoryId
  cluster?: ClusterId
  keywords: string[]
}

export interface SearchResult extends SearchRecord {
  score: number
}

/* ------------------------------------------------------------------ */
/* Categories + clusters                                               */
/* ------------------------------------------------------------------ */

export interface Category {
  id: CategoryId
  name: string
  cluster: ClusterId
  blurb: string
  /** Lucide icon name used by the Atlas + nav. */
  icon: string
  /** Single-glyph fallback used in compact contexts. */
  glyph: string
}

export interface Cluster {
  id: ClusterId
  name: string
  tagline: string
  categories: CategoryId[]
}

/* ------------------------------------------------------------------ */
/* Timelines                                                           */
/* ------------------------------------------------------------------ */

export interface TimelineEvent {
  id: string
  /** Year as a signed integer — negative for BCE. */
  year: number
  title: string
  description: string
  era?: string
  factStatus?: FactStatus
}

export interface Timeline {
  id: string
  title: string
  subtitle?: string
  events: TimelineEvent[]
}

/* ------------------------------------------------------------------ */
/* Quizzes                                                             */
/* ------------------------------------------------------------------ */

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizOption[]
  answerId: string
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
}
