# KaalVeda

> **Explore Everything. Learn Everything.**

KaalVeda is a premium interactive **knowledge-universe**. Instead of a wiki of isolated
pages, every article is a **node in a journey** — you _travel a path_ through the cosmos,
history, religions, science and civilizations as one connected map.

A reader following Ancient Egypt is offered a route:

> **Ancient Egypt → Religion → Pharaoh → Pyramids → Architecture → Astronomy → Modern Egypt → Tourism**

A gold **HERE** marker shows where you are on the path, a "Continue your path" rail shows
where you can go next, and cross-links connect to neighbouring domains.

---

## Design identity — _Illuminated Manuscript meets Star Chart_

Midnight indigo (`#0d1117`), warm gold (`#d4af6e`) and parchment cream — an antique
celestial atlas, deliberately **not** neon-space. Typography pairs **Fraunces** (display
serif), **Inter** (body) and **JetBrains Mono** (labels). Dark + light themes are generated
from a **single token source** in [`src/styles/tokens.ts`](src/styles/tokens.ts) that feeds
both Tailwind and the runtime CSS variables.

## Stack

- **React 18 + Vite + TypeScript** (strict)
- **Tailwind CSS** wired directly to the design tokens
- **Framer Motion** for cinematic motion (respects `prefers-reduced-motion`)
- **MDX-style content** authored in [`content/`](content/)
- **Supabase optional** for auth/bookmarks, with a **localStorage fallback** so it runs with
  zero backend setup
- **PWA** for offline reading

## Content engine

Content is authored as `.mdx` files in [`content/`](content/). The build script
[`scripts/build-content.mjs`](scripts/build-content.mjs) scans every MDX file, parses the
frontmatter and the Markdown body into typed blocks, and regenerates
[`src/data/generated/`](src/data/generated/):

| File                 | Contents                                                      |
| -------------------- | ------------------------------------------------------------ |
| `articles.json`      | Every article, frontmatter + body parsed into typed blocks   |
| `graph.json`         | Knowledge-graph **nodes + edges** built from each `related[]` |
| `search-index.json`  | Ranked search records for the ⌘K palette                     |

The script runs automatically via **both** `predev` and `prebuild` in `package.json`, so the
dev server and every production/Vercel build always use fresh data. The generated folder is
also committed, so deploys never depend on stale data either way.

```bash
npm run content   # regenerate src/data/generated/ on demand
```

## Getting started

```bash
npm install
npm run content   # (also runs automatically before dev/build)
npm run dev       # http://localhost:5173
```

Build & preview:

```bash
npm run build     # type-checks, regenerates content, builds to dist/
npm run preview
```

### Optional Supabase

Copy `.env.example` to `.env` and add your project URL + anon key. Without them, auth and
bookmarks transparently use `localStorage`.

## Routing on Vercel

[`vercel.json`](vercel.json) rewrites all routes to `/index.html`, so refreshing a deep link
like `/category/universe` or `/article/ancient-egypt` never 404s.

## Project structure

```
content/                 Authored MDX articles
scripts/build-content.mjs Content engine (frontmatter + body -> JSON)
src/
  app/                   Router, providers, app shell
  components/            Shared UI + layout
  features/              landing · explore · category · article · timeline · search · quiz
  hooks/                 Theme, bookmarks, command palette, reading progress …
  lib/                   content · search · supabase
  data/                  categories · timelines · quizzes · generated/
  styles/                tokens.ts (single source) + globals.css
  types/                 Shared TypeScript types
```

## The 27 categories, in 5 clusters

- **Cosmos & Earth** — Universe · Space · Earth · Nature · Geography
- **Life & Time** — Dinosaurs · Human Evolution · Ancient Civilizations · Kingdoms & Empires · Wars · World History
- **Belief & Story** — Religions · Sacred Books · Mythology · Literature · Art · Music · Architecture
- **Mind & Knowledge** — Science · Medicine · Psychology · Programming · Artificial Intelligence
- **Society & Tomorrow** — Politics · Economy · Business · Future

---

© KaalVeda. Content authored for demonstration; see each article's citations.
