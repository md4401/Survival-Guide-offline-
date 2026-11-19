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
| `npm run test:e2e:messages` | two isolated "devices" exchanging messages: bundle, private channel, WebRTC live link |
| `npm run plans` | regenerates `docs/PREMIUM.md` from the plan matrix |
| `npm run eval:ai` | offline evaluation of the assistant's guards and retrieval (60 questions en/pt) |
| `npm run shots` | store screenshots (en/pt/ar) into `store/` |
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
src/lib/mesh/            offline messaging: crypto, protocol, gossip sync, bundles/QR, WebRTC pairing, hub
src/lib/                 astro (sun/moon/seasons), clock, calendar, morse, coords, units: pure and unit-tested
src/interfaces/          license (Ed25519, offline), voice reading, pack updater: implemented, behind flags (off)
src/ai/                  optional assistant: model catalog, download manager, anchored-answer logic (guards, retrieval, verification)
android/ ios/            Capacitor native projects (not built here)
```
- **Content** is data, not code. Drafts (`status: draft`) are hidden unless *Developer mode* is on (Settings). The 2 complete example guides (campsite, water filter) are published with a visible "Needs review" badge. The other 22 guides are drafts with conservative text from public guidance, flagged "needs review" and hidden unless Developer mode is on (DECISIONS #31).
- **Offline**: service worker precaches the whole shell and both language packs; user data in IndexedDB.
- **Accessibility/UX**: dark theme by default, high-contrast and night-red themes, adjustable font, 48 px targets, no heavy animation (none in battery mode), CSS logical properties.
- **Android**: `android/` is a ready Capacitor project; the APK is built by GitHub Actions (`.github/workflows/android.yml`, see `docs/ANDROID.md`). `ios/` is generated but needs macOS/Xcode.

## Status (MVP)
- [x] F1 base, i18n, content pipeline + validator
- [x] F2 home, 1-tap triage, emergency numbers, flashlight/strobe/SOS Morse, whistle, GPS coordinates
- [x] F3 guide renderer, MiniSearch (accent-insensitive, typo-tolerant, synonyms), favorites, history, settings, developer mode
- [x] F4 Almanac: clock + manual offset + zones, day counter, sun/moon/seasons, calendar + BR holidays + alt calendars, 250 countries, climate sample, tables
- [x] F5 kits + checklist + calculator, family plan, timer/stopwatch, converter, notes, onboarding/profile, Premium/AI/voice/update interfaces
- [x] F6 offline E2E, size budget, RTL and touch-target checks
- [x] F10 Premium plan (`docs/PREMIUM.md` + `src/data/plans.ts`), full privacy policy and terms (in-app + `docs/`), Köppen climate for 246 countries and 1125 cities with a real-data map, offline nearby messaging (signed, encrypted channels, QR/text bundles, WebRTC live link)
- [x] F9 readiness score, scenario timelines (en/pt drafts), About/privacy page + legal drafts, CI workflow, store screenshots, AI offline evaluation (`npm run eval:ai`), 508/580 UI keys in es/fr/ar/hi/zh
- [x] F8 Morse + phonetic alphabet, compass, climate zones + latitude-band map, world in numbers, encrypted backup/restore, offline error reports; 24 guides in all 7 languages (non-en/pt as drafts, hidden from users)
- [x] F7 Crisis mode, water/chlorine calculators, rule-based suggestions, real population/time-zone/emergency data, partial es/fr/ar/hi/zh, PNG icons + update prompt, Android/iOS projects, offline license / voice / pack updater (flagged off), optional AI assistant

- [x] G0–G6 gap closure (spec v1.1 + content map): Premium functions built and unlocked **only in Developer mode** (`src/lib/access.ts`, `PremiumGate`); visual signal, UTM, return trail, step/ruler/level, medical card, silent mode; stock and energy calculators, inventory with expiry reminders, document vault, family plan (QR, print), 72 h plan; learn hub (quiz, decision trees, knowledge map, crisis drills, weekly goal); library (myths, facts, real cases, DIY, glossary, 24-phrase phrasebook in 7 languages, find by situation/material/symptom, scales and calculators), highlights and notes; license, packs, optional consented forecast, review dashboard, assistant summary/report; toolbox with 15 offline tools (calculator, recorder, QR reader, agenda, sound meter, metal detector and more), 84 draft guides in total (13 + 20 + 37 added in later rounds), redesigned Guides and Scenarios pages

- [x] Visual redesign: neon/black poster style from the moodboard (tokens, layout, Anton headings, new icon); contrast tested

## Optional AI assistant (separate download)
Settings → *AI assistant* → **AI models**. The assistant is not part of the app or its 50 MB core: you choose a model (Tiny / Lite / Standard / Pro, or a custom Hugging Face repo), see its size, confirm, and it downloads to your device (Wi-Fi recommended; mobile data needs an extra tick). After that it works offline and can be deleted at any time. Answers are anchored to the reviewed guides (see DECISIONS #28): life-risk questions open the vital guide directly, doses/diagnoses/weapons are refused, every answer must cite a guide and cannot invent numbers, and the AI is off during Crisis mode. Without a model, the assistant lists matching guides. **Untested with a real model**: the build sandbox cannot reach Hugging Face (see PENDING).

## Acceptance criteria
| Criterion | Result |
|---|---|
| Works in airplane mode, start to finish | E2E passes with the network off after first load |
| Icon → first emergency step ≤3 taps, ≤2 s | 3 taps; ~0.25 s, and ~0.65 s with the CPU throttled 6× (headless Chromium; **not yet on a real low-end phone**) |
| PT and EN complete, no hard-coded text | `check:i18n` enforces parity and no literal JSX text |
| Tests for clock, sun/moon, calendar, content validation | `tests/almanac.test.ts`, `tests/content-validation.test.ts` |
| Core ≤ 50 MB | ~0.4 MB (the AI model/runtime are never part of it) |

## Known limits
See `PENDING.md` (what is left) and `DECISIONS.md` (every deviation and why). Highlights: guide content, climate, kit/water parameters, tables and holidays need professional review and official sources; emergency numbers outside the spec examples are unverified community data; moon phase timing is ±~1 day; translations other than en/pt are partial drafts; the AI, native builds and real-device behaviour are untested.

Data: country data from npm `world-countries` (ODbL), attribution shown in the app.
