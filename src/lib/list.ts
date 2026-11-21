import type { Guide } from '../content/types';
/** Scenario cards, most time-critical first. */
export const SCENARIO_ORDER = ['scenario.house-fire', 'scenario.earthquake', 'scenario.tsunami', 'scenario.flood', 'scenario.wildfire', 'scenario.building-collapse', 'scenario.chemical-spill', 'scenario.radiological', 'scenario.active-threat', 'scenario.landslide', 'scenario.dam-failure', 'scenario.hurricane', 'scenario.tornado', 'scenario.volcano', 'scenario.avalanche', 'scenario.blizzard', 'scenario.storm', 'scenario.evacuation-order', 'scenario.lost', 'scenario.stranded-car', 'scenario.sea-emergency', 'scenario.desert-survival', 'scenario.heatwave', 'scenario.coldwave', 'scenario.water-contamination', 'scenario.epidemic', 'scenario.civil-unrest', 'scenario.sinkhole', 'scenario.elevator-trapped', 'scenario.food-shortage', 'scenario.drought', 'scenario.telecom-outage', 'scenario.blackout'];
export const SCENARIO_ICON: Record<string, string> = { 'scenario.house-fire': '🔥', 'scenario.earthquake': '🌍', 'scenario.flood': '🌊', 'scenario.storm': '⛈️', 'scenario.lost': '🧭', 'scenario.heatwave': '🥵', 'scenario.coldwave': '🥶', 'scenario.blackout': '🔦', 'scenario.tsunami': '🌊', 'scenario.landslide': '⛰️', 'scenario.hurricane': '🌀', 'scenario.volcano': '🌋', 'scenario.wildfire': '🔥', 'scenario.tornado': '🌪️', 'scenario.blizzard': '❄️', 'scenario.drought': '🏜️', 'scenario.radiological': '☢️', 'scenario.chemical-spill': '☣️', 'scenario.building-collapse': '🏚️', 'scenario.active-threat': '🚨', 'scenario.civil-unrest': '📢', 'scenario.epidemic': '🦠', 'scenario.water-contamination': '🚱', 'scenario.food-shortage': '🍞', 'scenario.stranded-car': '🚗', 'scenario.elevator-trapped': '🛗', 'scenario.avalanche': '🏔️', 'scenario.sinkhole': '🕳️', 'scenario.dam-failure': '💧', 'scenario.telecom-outage': '📵', 'scenario.evacuation-order': '🧳', 'scenario.desert-survival': '🌵', 'scenario.sea-emergency': '🛟' };
export const sortScenarios = <T extends { id: string }>(xs: T[]): T[] => [...xs].sort((a, b) => { const i = SCENARIO_ORDER.indexOf(a.id), j = SCENARIO_ORDER.indexOf(b.id); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || a.id.localeCompare(b.id); });

type G = Pick<Guide, 'id' | 'title' | 'summary' | 'tags' | 'materials' | 'category' | 'vital'>;
/** Free-text filter over title, summary, tags and materials (case-insensitive). */
export function filterGuides<T extends G>(gs: T[], q: string, cat: string): T[] {
  const n = q.trim().toLowerCase();
  return gs.filter((g) => (!cat || g.category === cat) && (!n || [g.title, g.summary, ...g.tags, ...g.materials].some((x) => x.toLowerCase().includes(n))));
}
/** Groups by category: categories sorted by name, vital guides first inside each. */
export function groupByCategory<T extends G>(gs: T[]): Array<{ category: string; items: T[] }> {
  const m = new Map<string, T[]>();
  for (const g of gs) m.set(g.category, [...(m.get(g.category) ?? []), g]);
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([category, items]) => ({ category, items: [...items].sort((a, b) => Number(b.vital) - Number(a.vital) || a.title.localeCompare(b.title)) }));
}
export const categoryCounts = (gs: Array<{ category: string }>) => groupByCategory(gs as any).map((x) => [x.category, x.items.length] as const);

/** Scenario groups for the scenarios page (first matching rule wins). */
export const SCENARIO_GROUPS = ['home', 'weather', 'health', 'lost', 'water', 'animals', 'vehicle', 'camp'] as const;
export type ScenarioGroup = (typeof SCENARIO_GROUPS)[number];
const RULES: Array<[ScenarioGroup, RegExp]> = [
  ['camp', /^scenario\.(camp|tent|campfire|gas-stove|park|bear-camp)/],
  ['vehicle', /^scenario\.(stranded-car|plane|helicopter-down|bus|offroad|atv|bike|horse|paraglider|forest-road|gravel|snowmobile|wildlife-collision|desert-vehicle)/],
  ['lost', /^scenario\.(lost|separated|fog|compass|phone-dead|pack-lost|swamp|night-on|search|volunteer|found|rescue-wait|helicopter-signal|pet-lost|child-in-group|cliff|cave|summit|ski-lost|injured-leader|group-conflict|desert-heat-walk)/],
  ['animals', /^scenario\.(bear|cougar|boar|bee|hornet|dog|snake|plant-poisoning|trap|insect|hunting)/],
  ['water', /^scenario\.(river|swept|lake|kayak|canoe|rafting|waterfall|fishing|beach|quicksand|sea|water-contamination|tsunami|canyon|jungle-flash|flood|dam)/],
  ['health', /^scenario\.(injured|broken|heat(?!wave)|hypothermia|frostbite|altitude|asthma|diabetic|pregnant|elderly|allergic|bad-water|epidemic|out-of-water)/],
  ['weather', /^scenario\.(storm|tornado|hurricane|blizzard|lightning|ridge|mountain-storm|cold|ice|sandstorm|night-cold|drought|heatwave|coldwave|avalanche|landslide|rockfall|wildfire|smoke|earthquake|volcano|glacier|desert|sinkhole)/],
];
export const scenarioGroup = (id: string): ScenarioGroup => RULES.find(([, re]) => re.test(id))?.[0] ?? 'home';
export const groupScenarios = <T extends { id: string }>(xs: T[]): Array<{ group: ScenarioGroup; items: T[] }> =>
  SCENARIO_GROUPS.map((group) => ({ group, items: sortScenarios(xs.filter((x) => scenarioGroup(x.id) === group)) })).filter((g) => g.items.length > 0);
