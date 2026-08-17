# design canvas

A prompt-driven design canvas built with Next.js and Konva. Type a mood or theme, get a matching palette of vector assets, and arrange them on a draggable/resizable canvas. Can play solo, against a friends, or against a Gemini-powered AI agent in a timed challenge.

## Modes

- **Timed Canvas** (`/canvas`) — Free-form canvas. Enter a prompt to pull a matching asset palette, then drag, scale, rotate, and recolor pieces to compose a design.
- **AI Game Mode** (`/game`) — You and an AI agent get the same prompt and the same asset palette. A timer runs while you place assets on your canvas; the AI plans and places on its own canvas in parallel. Compare results when time's up.
- **Asset Library** (`/upload`) — Upload SVGs (drag-and-drop or file picker), generate new ones from a text prompt via Gemini, auto-label them (name/tags/moods) via Gemini, and save them to Supabase for use in both modes.

## How asset matching works

Each asset carries `tags` (visual descriptors like `organic`, `angular`, `bold`) and `moods` (`fog`, `tension`, `energy`, etc). A prompt is tokenized, expanded through a small synonym map (`lib/assets.ts`), and scored against every asset's tags/moods. Top matches become the palette; if nothing scores, a random sample is shown instead of an empty canvas.

There's a small built-in set of local vector-primitive assets (`ASSET_DB` in `lib/assets.ts`) plus whatever's been uploaded to Supabase as SVGs.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Konva](https://konvajs.org) / [react-konva](https://github.com/konvajs/react-konva) for the canvas
- [Supabase](https://supabase.com) for asset storage (Postgres table + storage bucket for SVGs)
- [Google Gemini](https://ai.google.dev) (`@google/genai`) for AI composition placement, SVG generation, and asset auto-labeling
- [react-colorful](https://github.com/omgovich/react-colorful) for the color picker

## Getting started

Install dependencies:

```bash
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Your Supabase project needs:
- a public storage bucket named `asset-svgs`
- a table named `assets` with columns `id`, `label`, `tags` (text[]), `moods` (text[]), `svg_url`, `created_at`

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              landing page — mode picker
  canvas/page.tsx        Timed Canvas mode
  game/page.tsx          AI Game mode
  upload/page.tsx        Asset Library / upload + AI generation
  api/
    ai-place/            Gemini: plans a composition (list of placements) for a prompt
    generate-svg/        Gemini: generates a new SVG asset from a text description
    label-asset/         Gemini: auto-labels an SVG with a name, tags, and moods
components/
  CanvasStage.tsx        Konva stage wrapper (drag/select/transform)
  KonvaAsset.tsx         renders a single asset (shape or SVG) on the canvas
  AssetThumb.tsx         small asset preview used in palettes
  Sidebar.tsx, Topbar.tsx  shared chrome
lib/
  assets.ts              asset DB, prompt matching/scoring, Supabase fetch
  supabase.ts            Supabase client
```
