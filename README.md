# Survival Guide (offline-first PWA)

Offline survival guide: blackout, disasters, nature, plus an Almanac. **PWA** (Vite + Preact + TypeScript), **IndexedDB** (Dexie), **MiniSearch**, **Workbox** service worker, **Capacitor**-ready. English and Portuguese complete; architecture ready for 7 languages (en, pt, es, fr, ar, hi, zh) including RTL. No backend, no analytics, no ads: user data never leaves the device. Premium is prepared but **off**.

## Quick start
```bash
npm install
npm run dev          # builds content packs, then Vite dev server
npm run verify       # build + unit tests + size budget + offline E2E
```

| Command | What it does |
|---|---|
| `npm run validate` | Guide validator: required fields, broken `related` links, ≤12 words per step, source present, vital never premium, en/pt id parity |
| `npm run check:i18n` | en/pt key parity, unknown `t()` keys, hard-coded JSX text |
| `npm run check:css` | fails on physical `left/right` CSS (RTL safety) |
| `npm test` | Vitest: clock, ISO week, day counter, sun/moon, seasons, calendar/holidays, content validation, search, morse/coords, units, kits, access rules, i18n |
| `npm run build` | validate + i18n + css checks, content packs, typecheck, production build with service worker |
| `npm run size` | core size vs the 50 MB budget (currently ~0.3 MB) |
| `npm run test:e2e` | Playwright in **airplane mode**: cold start offline, icon → first emergency step in 3 taps, all main screens, IndexedDB persistence, search, 48 px touch targets, RTL switch |

## Architecture
```
content/{en,pt}/…        Markdown + frontmatter guides (id, category, plan, vital, review{date,level,source}, materials, related, now[], mistakes[])
scripts/                 validate-content, build-content (versioned packs + sha256 manifest), build-countries, check-*, size-report, gen-stubs
src/i18n/                key-based strings (en, pt full; es/fr/ar/hi/zh stubs fall back to English); ar ⇒ dir=rtl
src/content/             loader (lazy per-language pack), access rule (vital never gated), types
src/db/                  Dexie (favorites, history, counters, checklists, notes, kv/settings): device only
src/features/            home, triage, emergency (numbers, flashlight/strobe/SOS, whistle, GPS), guides, search, almanac, prepare, tools, settings
src/lib/                 astro (sun/moon/seasons), clock, calendar, morse, coords, units: pure and unit-tested
src/interfaces/          license, assistant, voice reading, pack updates: contracts + no-op stubs (not implemented)
```
- **Content** is data, not code. Drafts (`status: draft`) are hidden unless *Developer mode* is on (Settings). The 2 complete example guides (campsite, water filter) are published with a visible "Needs review" badge. Everything else is an empty draft: no medical or safety facts were invented.
- **Offline**: service worker precaches the whole shell and both language packs; user data in IndexedDB.
- **Accessibility/UX**: dark theme by default, high-contrast and night-red themes, adjustable font, 48 px targets, no heavy animation (none in battery mode), CSS logical properties.
- **Native**: `capacitor.config.ts` is ready; run `npx cap add android|ios` + `npx cap sync` (not generated here).

## Status (MVP)
- [x] F1 base, i18n, content pipeline + validator
- [x] F2 home, 1-tap triage, emergency numbers, flashlight/strobe/SOS Morse, whistle, GPS coordinates
- [x] F3 guide renderer, MiniSearch (accent-insensitive, typo-tolerant, synonyms), favorites, history, settings, developer mode
- [x] F4 Almanac: clock + manual offset + zones, day counter, sun/moon/seasons, calendar + BR holidays + alt calendars, 250 countries, climate sample, tables
- [x] F5 kits + checklist + calculator, family plan, timer/stopwatch, converter, notes, onboarding/profile, Premium/AI/voice/update interfaces
- [x] F6 offline E2E, size budget, RTL and touch-target checks

## Acceptance criteria
| Criterion | Result |
|---|---|
| Works in airplane mode, start to finish | E2E passes with the network off after first load |
| Icon → first emergency step ≤3 taps, ≤2 s | 3 taps, ~0.25 s in headless Chromium (**not yet measured on a low-end device**) |
| PT and EN complete, no hard-coded text | `check:i18n` enforces parity and no literal JSX text |
| Tests for clock, sun/moon, calendar, content validation | `tests/almanac.test.ts`, `tests/content-validation.test.ts` |
| Core ≤ 50 MB | ~0.3 MB |

## Known limits
See `PENDING.md` (what is left) and `DECISIONS.md` (every deviation and why). Highlights: content/numbers/climate/kit quantities/tables need professional review and official sources; country population and time zones are not in the data source; moon phase timing is ±~1 day; native projects not generated; low-end-device and real-phone sensor testing still to do.

Data: country data from npm `world-countries` (ODbL), attribution shown in the app.
