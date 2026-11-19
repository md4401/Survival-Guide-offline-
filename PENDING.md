# PENDING

## Content / data (blocking for a public release)
- Professional review of all guides: the 8 scenarios, water, first aid and kit drafts now have text (`scripts/fill-drafts.py`) but stay drafts, hidden outside Developer mode, until reviewed; register real sources for them and for the 2 example guides (then set `status: published`)
- Scenario `timeline` sections (10 min … 30 days) are not written
- Emergency numbers: only the spec examples are "sample"; the other ~190 countries are unverified community data → verify against official sources
- Climate: 3 sample cities (target 44) → needs a source; tables, holidays, kit quantities, water-need and chlorine parameters need review
- Country population is missing for 14 territories

## AI assistant (built, never run against a real model)
- Verify the model repo ids / sizes in `src/ai/models.ts` and test download + generation on a real device (the build sandbox cannot reach Hugging Face)
- Runtime is loaded from jsDelivr (pinned 3.8.1, no SRI possible for dynamic import): consider self-hosting it as a second optional download
- iOS WKWebView has no service worker, so the cached runtime may not work offline there; WebGPU/WASM speed and memory on low-end phones unmeasured
- Spec quality gates not done: ~200-question test set per language, hallucination tests, human review of samples, time-to-first-token and battery measurements
- Gemma may require accepting a license on Hugging Face

## Languages
- es/fr/ar/hi/zh: ~170 essential UI keys (and the 24 guides, as drafts) are machine-translated → native-speaker review before anything is published; remaining UI keys fall back to English; Arabic needs a visual pass on every screen

## Product / engineering
- Build and run android/ and ios/ (Android Studio / Xcode); test torch, GPS, wake lock, battery API on real phones; test on a low-end Android with low battery
- Premium: bundle the public key, purchase/restore flow and a pack server; license, pack updater and voice are implemented but off
- Native torch/geolocation plugins (optional), store assets/screenshots, privacy policy and terms (legal review)
- Compass needs a real-device test; backup UI tested only in headless Chromium
- Error reports have no server (endpoint `null`)
- Readiness score, learn/quizzes, offline maps, regional risk rules: out of MVP scope
- Not done by choice: scenario `timeline` text, the ~290 UI keys still missing in es/fr/ar/hi/zh, AI evaluation set, CI, store assets, privacy policy/terms
