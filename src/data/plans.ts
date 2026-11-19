// Free vs Premium plan: the single source of truth (docs/PREMIUM.md is generated from it: `npm run plans`).
// Rules (spec §2): anything vital is ALWAYS free; no ads; no upgrade prompts during Emergency or Crisis mode; Premium sells depth, personalization and convenience.
export type PlanKind = 'free' | 'premium' | 'both'; // both = essential version free, depth/convenience in Premium
export type Area = 'emergency' | 'scenarios' | 'firstaid' | 'water' | 'food' | 'shelter' | 'prepare' | 'family' | 'navigation' | 'comms' | 'almanac' | 'learn' | 'ai' | 'tools' | 'system';
export interface Feature { id: string; area: Area; plan: PlanKind; vital: boolean; built: boolean; note?: string }

const F = (id: string, area: Area, plan: PlanKind, built: boolean, vital = false, note?: string): Feature => ({ id, area, plan, vital, built, note });
export const FEATURES: Feature[] = [
  // Emergency: all vital, all free
  F('triage', 'emergency', 'free', true, true), F('emergencyNumbers', 'emergency', 'free', true, true), F('flashlightSos', 'emergency', 'free', true, true),
  F('whistle', 'emergency', 'free', true, true), F('coordinates', 'emergency', 'free', true, true), F('compass', 'navigation', 'free', true, true),
  F('visualSignal', 'emergency', 'free', true, true), F('medicalCard', 'emergency', 'premium', true, false, 'full medical card with allergies, medicines and contacts'), F('silentMode', 'emergency', 'premium', true),
  // Scenarios, first aid, water, shelter (vital content is free)
  F('scenarios8', 'scenarios', 'free', true, true, 'blackout, storm, flood, house fire, heat, cold, earthquake, lost'), F('crisisMode', 'scenarios', 'free', true, true),
  F('scenariosAll', 'scenarios', 'premium', false, false, '40+ scenarios with the full timeline'), F('profileVariants', 'scenarios', 'premium', false, false, 'baby, older adult, reduced mobility, pet, high-rise'),
  F('firstAidEssentials', 'firstaid', 'free', true, true), F('firstAidLibrary', 'firstaid', 'both', true, false, 'decision trees, children/older adults/pregnancy adaptations are premium'),
  F('waterEssentials', 'water', 'free', true, true, 'find, boil, chlorine, filter, store, calculators'), F('waterRegional', 'water', 'premium', false), F('water30Days', 'water', 'premium', false),
  F('foodBasics', 'food', 'free', true, true), F('foodAdvanced', 'food', 'premium', false, false, 'wild plants, fishing, crisis garden'), F('shelterFire', 'shelter', 'free', true, true), F('knots', 'shelter', 'premium', false),
  // Preparation
  F('kits', 'prepare', 'free', true, false, '72 h kit and car kit with checklist and people × days calculator'), F('readinessScore', 'prepare', 'both', true, false, 'score and next step free; detailed breakdown per profile premium'),
  F('inventory', 'prepare', 'premium', true, false, 'items with quantity, expiry date and reminders'), F('kitsByProfile', 'prepare', 'premium', false),
  F('familyPlanBasic', 'family', 'free', true, true, 'contacts and meeting points'), F('familyPlanFull', 'family', 'premium', true, false, 'evacuation routes, roles, children rules, medical file, PDF'),
  // Navigation and maps
  F('offlineMaps', 'navigation', 'premium', false), F('returnTrail', 'navigation', 'premium', true), F('altimeter', 'navigation', 'premium', false),
  // Communication
  F('messagesBasic', 'comms', 'free', true, true, 'signed messages, public channel + SOS broadcast, QR/text bundles, live link with 1 device, 3 private channels, 7-day history'),
  F('messagesPlus', 'comms', 'premium', true, false, 'unlimited private channels, up to 5 live links relaying at once, 30-day history, verified contacts'),
  F('morsePhonetic', 'comms', 'free', true, true), F('radio', 'comms', 'premium', false),
  // Almanac
  F('clockCalendar', 'almanac', 'free', true), F('sunMoon', 'almanac', 'free', true), F('countries250', 'almanac', 'free', true), F('climateClasses', 'almanac', 'free', true, false, 'Köppen class for all countries and up to 5 cities each'),
  F('tables', 'almanac', 'free', true), F('climateComparator', 'almanac', 'premium', false, false, 'compare two places, monthly normals, filters'), F('countryRisk', 'almanac', 'premium', false, false, 'disaster-risk sheet per country'),
  // Learn
  F('lessonsIntro', 'learn', 'free', true), F('lessonsFull', 'learn', 'premium', true, false, 'full tracks, crisis drills, certificate'),
  // AI
  F('aiAssistant', 'ai', 'free', true, false, 'ask and summarise from reviewed guides; the user picks any model size'), F('aiPlan', 'ai', 'premium', false, false, 'personalised 72 h plan, tutor, quiz, emergency phrases'), F('voice', 'ai', 'premium', true, false, 'read steps aloud, offline voices'),
  // Tools and system
  F('timerConverterNotes', 'tools', 'free', true), F('toolbox', 'tools', 'free', true, false, 'calculator, audio recorder, QR reader, agenda, sound level meter, metal detector (magnetic sensor), compass, level, clock, calendar, notes'), F('searchFavorites', 'system', 'free', true), F('themesAccessibility', 'system', 'free', true, true), F('languages', 'system', 'free', true, true, 'all languages are free; only review status differs'),
  F('backup', 'system', 'both', true, false, 'encrypted file backup free; scheduled reminders premium'), F('pdfExport', 'system', 'premium', true), F('accountSync', 'system', 'premium', false, false, 'optional account, only to sync devices/family'), F('noUpgradeNags', 'system', 'free', true, true, 'no upgrade prompt in Emergency or Crisis, no ads ever'),
];

/** Numeric limits per plan. While Premium is off (MVP) everyone gets the free values; premium values apply with an active license. */
export const LIMITS_BY_PLAN = {
  privateChannels: { free: 3, premium: Infinity },
  livePeers: { free: 1, premium: 5 },
  messageDays: { free: 7, premium: 30 },
} as const;
export type LimitName = keyof typeof LIMITS_BY_PLAN;
export const limit = (name: LimitName, premiumActive = false) => (premiumActive ? LIMITS_BY_PLAN[name].premium : LIMITS_BY_PLAN[name].free);

export const byPlan = (p: PlanKind) => FEATURES.filter((f) => f.plan === p);
export const vitalFeatures = () => FEATURES.filter((f) => f.vital);
