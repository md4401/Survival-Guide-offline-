// Writes docs/PREMIUM.md from src/data/plans.ts + the English strings, so the document cannot drift from the code. Run: npm run plans
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/content';
import { FEATURES, LIMITS_BY_PLAN, type Area } from '../src/data/plans';

const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/locales/en.json'), 'utf8')) as Record<string, string>;
const AREAS = Object.keys(en).filter((k) => k.startsWith('plan.area.')).map((k) => k.slice(10)) as Area[];
const label = { free: '**Free**', premium: '**Premium**', both: 'Free + Premium' } as const;
const count = (p: string) => FEATURES.filter((f) => f.plan === p).length;

let md = `# Premium plan: what is Free and what is Premium

> Generated from \`src/data/plans.ts\` by \`npm run plans\`. Edit the data file, not this document.
> **Status:** Premium is **not on sale yet** (\`FLAGS.premium = false\`). Prices below are hypotheses to validate, not decisions.

## 1. Principles (from the product spec §1-2 and §11)
1. **Whatever protects life is always free**, in every language: triage, emergency numbers, flashlight/SOS, first aid essentials, water, shelter, evacuation, nearby messaging for SOS. The code enforces it (\`canAccess()\`, the validator, and a test that fails if any \`vital\` feature is not free).
2. **No ads. No upgrade prompts during Emergency or Crisis mode.** Premium content already downloaded stays available until a crisis ends.
3. **Premium sells depth, personalization and convenience**: more scenarios and variants, regional detail, maps, inventory with reminders, PDF, comparators, longer message history.
4. **Leaving Premium is painless**: you keep everything free and all vital content. Downloaded Premium content stays readable for a 30-day grace period.
5. **Works offline**: the license is a signed token verified on the device with a bundled public key; no server is needed to open the app.

## 2. Summary
| | Count |
|---|---|
| Free | ${count('free')} |
| Free + Premium (essential version free, depth in Premium) | ${count('both')} |
| Premium | ${count('premium')} |
| Vital (always free) | ${FEATURES.filter((f) => f.vital).length} |

## 3. Feature matrix
`;
for (const a of AREAS) {
  const rows = FEATURES.filter((f) => f.area === a); if (!rows.length) continue;
  md += `\n### ${en[`plan.area.${a}`]}\n| Feature | Plan | Vital | Built | Note |\n|---|---|---|---|---|\n`;
  for (const f of rows) md += `| ${en[`plan.f.${f.id}`]} | ${label[f.plan]} | ${f.vital ? 'yes' : ''} | ${f.built ? 'yes' : 'planned'} | ${f.note ?? ''} |\n`;
}
md += `
## 4. Numeric limits
| Limit | Free | Premium |
|---|---|---|
${Object.entries(LIMITS_BY_PLAN).map(([k, v]) => `| ${en[`plans.limit.${k}`]} | ${v.free} | ${Number.isFinite(v.premium) ? v.premium : 'unlimited'} |`).join('\n')}

While Premium is off, **everyone gets the Free values** and Premium-only features are simply unavailable.

## 5. Decisions that differ from the spec (and why)
| Topic | Spec | This plan | Why |
|---|---|---|---|
| Nearby messages | Premium, v3.0 | **Basic is Free** (SOS, public channel, bundles, 1 live link, 3 private channels, 7-day history); Premium adds unlimited channels, 5 simultaneous links, 30-day history | Communication when networks fail protects life; charging for it would break principle 1 |
| AI model size | Lite free, bigger models Premium | **Any model size is Free**; Premium is the AI personal plan, tutor/quiz and voice | Model size depends on the device's RAM, not on content value; the user chooses what to download |
| Climate | 44 cities free, 300 cities + comparator Premium | **Köppen class for all countries and 1100+ cities is Free**; comparator, monthly normals and risk sheets are Premium | The data is a free public dataset and costs nothing to ship; depth (comparisons, normals) is the paid part |
| Languages | Extra language packs a Premium convenience | **All languages Free** | "Multilingual for real" is a principle; only review status differs |

## 6. How Premium would work (not built end to end)
- **Purchase:** store billing on iOS/Android and local web payment (e.g. Pix); the receipt yields a license.
- **License:** \`{ sub, plan, issued, expires, grace_days, devices, sig }\`, Ed25519 signature checked offline (\`src/interfaces/license.ts\`). Term 12 months + 30 days grace. Auto-renews when online; weeks offline are fine.
- **Restore purchases:** button that fetches the license from the store or with a code. Family (v2.0): up to 5 devices with an invite code.
- **Packs:** Premium content packs are downloaded only with a valid license; once downloaded they work offline (\`src/interfaces/packUpdate.ts\`).
- **Not built:** store plugins, a license/pack server, a web checkout, the public key, family invites.

## 7. Price hypotheses to validate (no currency amounts on purpose)
- Offer **annual** (primary), **lifetime** (one-time) and **monthly** only if tests show it is needed; regional pricing.
- Suggested starting ratios to test: annual ≈ 8-10 months of the monthly price; lifetime ≈ 2.5-3 years of the annual price.
- Metrics (spec §14): premium conversion measured **without tracking sensitive data**; satisfaction above 4.5 in the stores; zero reported errors in vital content.

## 8. Open questions for you
1. Prices and currencies per region; whether a monthly plan exists at all.
2. Which stores and payment methods at launch; who operates the license/pack server.
3. Whether Premium unlocks the planned content only, or also cloud-free family sync earlier.
4. Legal review of the purchase, refund and consumer-law terms (see \`docs/TERMS.md\`).
`;
fs.writeFileSync(path.join(ROOT, 'docs/PREMIUM.md'), md);
console.log('✓ docs/PREMIUM.md written');
