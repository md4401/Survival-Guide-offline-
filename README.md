# Survival Guide (offline-first PWA)

Offline survival guide: blackout, disasters, nature, plus an Almanac. PWA (Vite + Preact + TypeScript), IndexedDB (Dexie), MiniSearch, Workbox service worker, Capacitor-ready. No backend, no analytics, no ads. User data never leaves the device.

## Commands
| | |
|---|---|
| `npm run dev` | build content packs + dev server |
| `npm run validate` | validate guides (required fields, broken links, ≤12 words/step, source present) |
| `npm run check:i18n` | en/pt key parity, unknown keys, hard-coded JSX text |
| `npm test` | unit tests |
| `npm run build` | validate + i18n check + content + production build (service worker) |
| `npm run size` | core size report (≤50 MB budget) |

## Content
Markdown with frontmatter in `content/{lang}/…` (id, category, plan, vital, review{date,level,source}, materials, related, now[], mistakes[]). Body bullets = "Understand better". `npm run content` compiles versioned packs with sha256 checksums into `src/generated/`. Drafts (`status: draft`) are visible only in Developer mode. See `DECISIONS.md` and `PENDING.md`.

## Status
- [x] F1 base, i18n, content pipeline
- [x] F2 home, triage (3 taps), emergency numbers, flashlight/strobe/SOS Morse, whistle, GPS coordinates
- [x] F3 guide renderer, MiniSearch (accent-insensitive, typo-tolerant, synonyms), favorites, history, settings page, developer mode
- E2E offline test: `npm run build && npm run test:e2e`
