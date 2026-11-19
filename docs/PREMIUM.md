# Premium plan: what is Free and what is Premium

> Generated from `src/data/plans.ts` by `npm run plans`. Edit the data file, not this document.
> **Status:** Premium is **not on sale yet** (`FLAGS.premium = false`). Prices below are hypotheses to validate, not decisions.

## 1. Principles (from the product spec §1-2 and §11)
1. **Whatever protects life is always free**, in every language: triage, emergency numbers, flashlight/SOS, first aid essentials, water, shelter, evacuation, nearby messaging for SOS. The code enforces it (`canAccess()`, the validator, and a test that fails if any `vital` feature is not free).
2. **No ads. No upgrade prompts during Emergency or Crisis mode.** Premium content already downloaded stays available until a crisis ends.
3. **Premium sells depth, personalization and convenience**: more scenarios and variants, regional detail, maps, inventory with reminders, PDF, comparators, longer message history.
4. **Leaving Premium is painless**: you keep everything free and all vital content. Downloaded Premium content stays readable for a 30-day grace period.
5. **Works offline**: the license is a signed token verified on the device with a bundled public key; no server is needed to open the app.

## 2. Summary
| | Count |
|---|---|
| Free | 30 |
| Free + Premium (essential version free, depth in Premium) | 3 |
| Premium | 23 |
| Vital (always free) | 19 |

## 3. Feature matrix

### AI and voice
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Optional AI assistant (any model size) | **Free** |  | yes | ask and summarise from reviewed guides; the user picks any model size |
| AI personal plan, tutor and quiz | **Premium** |  | planned | personalised 72 h plan, tutor, quiz, emergency phrases |
| Read steps aloud | **Premium** |  | yes | read steps aloud, offline voices |

### Almanac
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Clock, date, day counter, calendar | **Free** |  | yes |  |
| Sun, Moon and seasons | **Free** |  | yes |  |
| 250 countries and territories | **Free** |  | yes |  |
| Köppen climate for all countries and 1100+ cities | **Free** |  | yes | Köppen class for all countries and up to 5 cities each |
| Reference tables | **Free** |  | yes |  |
| Climate comparator and monthly normals | **Premium** |  | planned | compare two places, monthly normals, filters |
| Disaster-risk sheet per country | **Premium** |  | planned | disaster-risk sheet per country |

### Communication
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Nearby messages: SOS, public channel, QR bundles, live link, 3 private channels | **Free** | yes | yes | signed messages, public channel + SOS broadcast, QR/text bundles, live link with 1 device, 3 private channels, 7-day history |
| Nearby messages plus: unlimited channels, 5 live links, 30-day history | **Premium** |  | yes | unlimited private channels, up to 5 live links relaying at once, 30-day history, verified contacts |
| Morse converter and phonetic alphabet | **Free** | yes | yes |  |
| Radio guide | **Premium** |  | planned |  |

### Emergency
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| "I need help now" triage | **Free** | yes | yes |  |
| Emergency numbers by country | **Free** | yes | yes |  |
| Flashlight, strobe and SOS Morse | **Free** | yes | yes |  |
| Whistle and alarm | **Free** | yes | yes |  |
| Share GPS coordinates | **Free** | yes | yes |  |
| Visual signalling screen | **Free** | yes | yes |  |
| Full emergency medical card | **Premium** |  | yes | full medical card with allergies, medicines and contacts |
| Silent mode | **Premium** |  | yes |  |

### Family plan
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Family plan: contacts and meeting point | **Free** | yes | yes | contacts and meeting points |
| Full family plan, routes and PDF | **Premium** |  | yes | evacuation routes, roles, children rules, medical file, PDF |

### First aid
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Life-saving first aid | **Free** | yes | yes |  |
| Extended first-aid library and decision trees | Free + Premium |  | yes | decision trees, children/older adults/pregnancy adaptations are premium |

### Food
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Food basics: rationing, keeping, cooking | **Free** | yes | yes |  |
| Wild plants, fishing, crisis garden | **Premium** |  | planned | wild plants, fishing, crisis garden |

### Learn
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Intro lessons | **Free** |  | yes |  |
| Full tracks, drills and certificate | **Premium** |  | yes | full tracks, crisis drills, certificate |

### Navigation
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Compass | **Free** | yes | yes |  |
| Offline maps | **Premium** |  | planned |  |
| Return trail | **Premium** |  | yes |  |
| Altimeter and barometer | **Premium** |  | planned |  |

### Prepare
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| 72 h and car kits with checklist and calculator | **Free** |  | yes | 72 h kit and car kit with checklist and people × days calculator |
| Readiness score | Free + Premium |  | yes | score and next step free; detailed breakdown per profile premium |
| Inventory with expiry reminders | **Premium** |  | yes | items with quantity, expiry date and reminders |
| Kits by profile and region | **Premium** |  | planned |  |

### Scenarios
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| 8 essential scenarios | **Free** | yes | yes | blackout, storm, flood, house fire, heat, cold, earthquake, lost |
| Crisis mode (day counter, timeline, diary) | **Free** | yes | yes |  |
| All 40+ scenarios | **Premium** |  | planned | 40+ scenarios with the full timeline |
| Variants by profile (baby, older adult, pet…) | **Premium** |  | planned | baby, older adult, reduced mobility, pet, high-rise |

### Shelter and fire
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Shelter, fire and temperature | **Free** | yes | yes |  |
| Knots with illustrations | **Premium** |  | planned |  |

### System
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Offline search and favorites | **Free** |  | yes |  |
| Dark/red themes, font size, accessibility | **Free** | yes | yes |  |
| All languages | **Free** | yes | yes | all languages are free; only review status differs |
| Encrypted backup and restore | Free + Premium |  | yes | encrypted file backup free; scheduled reminders premium |
| PDF to print | **Premium** |  | yes |  |
| Optional account to sync devices | **Premium** |  | planned | optional account, only to sync devices/family |
| No ads, no upgrade prompts in emergencies | **Free** | yes | yes | no upgrade prompt in Emergency or Crisis, no ads ever |

### Tools
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Timer, converter and notes | **Free** |  | yes |  |
| undefined | **Free** |  | yes | calculator, audio recorder, QR reader, agenda, sound level meter, metal detector (magnetic sensor), compass, level, clock, calendar, notes |

### Water
| Feature | Plan | Vital | Built | Note |
|---|---|---|---|---|
| Water: find, purify, store, calculators | **Free** | yes | yes | find, boil, chlorine, filter, store, calculators |
| Water by region | **Premium** |  | planned |  |
| 30-day water plan | **Premium** |  | planned |  |

## 4. Numeric limits
| Limit | Free | Premium |
|---|---|---|
| Private message channels | 3 | unlimited |
| Live links at once | 1 | 5 |
| Message history (days) | 7 | 30 |

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
- **License:** `{ sub, plan, issued, expires, grace_days, devices, sig }`, Ed25519 signature checked offline (`src/interfaces/license.ts`). Term 12 months + 30 days grace. Auto-renews when online; weeks offline are fine.
- **Restore purchases:** button that fetches the license from the store or with a code. Family (v2.0): up to 5 devices with an invite code.
- **Packs:** Premium content packs are downloaded only with a valid license; once downloaded they work offline (`src/interfaces/packUpdate.ts`).
- **Not built:** store plugins, a license/pack server, a web checkout, the public key, family invites.

## 7. Price hypotheses to validate (no currency amounts on purpose)
- Offer **annual** (primary), **lifetime** (one-time) and **monthly** only if tests show it is needed; regional pricing.
- Suggested starting ratios to test: annual ≈ 8-10 months of the monthly price; lifetime ≈ 2.5-3 years of the annual price.
- Metrics (spec §14): premium conversion measured **without tracking sensitive data**; satisfaction above 4.5 in the stores; zero reported errors in vital content.

## 8. Open questions for you
1. Prices and currencies per region; whether a monthly plan exists at all.
2. Which stores and payment methods at launch; who operates the license/pack server.
3. Whether Premium unlocks the planned content only, or also cloud-free family sync earlier.
4. Legal review of the purchase, refund and consumer-law terms (see `docs/TERMS.md`).
