import type { Guide } from '../content/types';
/** Scenario cards, most time-critical first. */
export const SCENARIO_ORDER = ['scenario.house-fire', 'scenario.earthquake', 'scenario.flood', 'scenario.storm', 'scenario.lost', 'scenario.heatwave', 'scenario.coldwave', 'scenario.blackout'];
export const SCENARIO_ICON: Record<string, string> = { 'scenario.house-fire': '🔥', 'scenario.earthquake': '🌍', 'scenario.flood': '🌊', 'scenario.storm': '⛈️', 'scenario.lost': '🧭', 'scenario.heatwave': '🥵', 'scenario.coldwave': '🥶', 'scenario.blackout': '🔦' };
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
