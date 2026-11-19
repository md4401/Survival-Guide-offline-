# DECISIONS

Where the spec (v1.1) conflicts or is silent, the simplest option was chosen and logged here.

| # | Topic | Decision |
|---|-------|----------|
| 1 | "Faça agora" step count | Spec §4 says ≤5 steps, but both spec example guides (campsite: 10, filter: 8) exceed it. The validator allows up to **10** steps; the 12-words-per-step rule is enforced. PT example steps were shortened to meet 12 words (meaning preserved). |
| 2 | Example guides status | Published (visible) but flagged `needsReview: true` with level `draft` and a source placeholder: the Mapa says they are drafts that need review + registered source. UI shows a "Needs review" badge. |
| 3 | Other guides | 8 scenarios, water, first-aid and kit entries are generated **drafts** (`scripts/gen-stubs.ts`): title only, no steps, hidden unless Developer mode is on. No medical/safety facts were invented. |
| 4 | Country data | npm `world-countries` (ODbL, attribution required) converted at build time to `src/generated/countries.json`. Names/languages/currencies are localized via `Intl` on device. **Population and time zones are not in that dataset** and are not invented: they are omitted until a source is provided. |
| 5 | Climate (44 cities) & emergency numbers | Structure + small sample only, flagged "needs review". Real data must come from official sources. |
| 6 | Native | Capacitor is configured only (`capacitor.config.ts`); `android/` and `ios/` are not generated (cannot be built here). |
| 7 | Routing | Hash routing (works from `file://`/Capacitor/no server). |
| 8 | Locale stubs | es/fr/ar/hi/zh locale files exist but are empty; they fall back to English per key. `ar` switches `dir="rtl"`. |
| 9 | Settings persistence | Single `kv` row in IndexedDB (Dexie). No localStorage, no network. |
| 10 | Premium | `FLAGS.premium=false`; only interfaces under `src/interfaces/`. Vital content can never be `plan: premium` (validator enforces). |
