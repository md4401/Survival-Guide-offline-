# PENDING (after F6)

## Content / data (blocking for a public release)
- Professional review + registered sources for **all** content; the 2 example guides carry placeholder sources
- Write the 8 scenarios, water, first-aid essentials and kit guides (currently empty drafts, hidden outside Developer mode)
- Emergency numbers: only spec examples (BR, EU, US/CA, GB, AU) → need an official, complete source
- Climate: 3 sample cities (target 44); tables, holidays and kit quantities need verification
- Country population and time zones need a data source (not in `world-countries`)
- Chlorine dosing and water-consumption calculators (need reviewed formulas)

## Product / engineering
- Test on a low-end Android device with low battery (startup ≤2 s, battery/brightness behaviour, real torch/GPS/wake lock)
- Generate Capacitor `android/` and `ios/` projects; optionally native torch/geolocation plugins
- Translate es/fr/ar/hi/zh (stubs exist; Arabic RTL layout needs a visual pass with real strings)
- Premium, AI assistant, voice reading, pack updates: interfaces only
- Crisis Mode (scenario timeline, day counter + checklist + battery estimate) and "Where am I" suggestions: not built; only the pieces exist (counter, checklists)
- App icons (PNG maskable) for stores; service-worker update UX
