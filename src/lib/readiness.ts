// Readiness score (spec §6.3). Weights are the spec's starting point. The score is guidance, never a judgment: it always names the next most useful step.
import { KITS, checkKey, plan, type Cat, type Needs } from '../data/kits';

export const WEIGHTS = { water: 20, food: 15, health: 20, energy: 10, comms: 10, shelter: 10, docs: 10, knowledge: 5 } as const;
export type Area = keyof typeof WEIGHTS;
export const AREAS = Object.keys(WEIGHTS) as Area[];
const KIT_CAT_TO_AREA: Record<Cat, Area> = { water: 'water', food: 'food', health: 'health', energy: 'energy', comms: 'comms', shelter: 'shelter', docs: 'docs' };

export interface Inputs { needs: Needs; done: Set<string>; hasFamilyPlan: boolean; vitalTotal: number; vitalRead: number; kit?: string }
export interface Next { area: Area; itemId?: string; gain: number }
export interface Score { total: number; areas: Record<Area, number>; next: Next | null }

/** Each area is 0..100: share of its kit items checked (comms also counts a filled family plan; knowledge = share of vital guides opened). */
export function readiness(i: Inputs): Score {
  const kit = i.kit ?? '72h';
  const items = plan(kit, i.needs);
  const parts: Record<Area, Array<{ id?: string; done: boolean }>> = { water: [], food: [], health: [], energy: [], comms: [], shelter: [], docs: [], knowledge: [] };
  for (const { item } of items) parts[KIT_CAT_TO_AREA[item.cat]].push({ id: item.id, done: i.done.has(checkKey(kit, item.id)) });
  parts.comms.push({ id: 'familyplan', done: i.hasFamilyPlan });
  const areas = {} as Record<Area, number>;
  for (const a of AREAS) {
    if (a === 'knowledge') { areas[a] = i.vitalTotal ? Math.round((Math.min(i.vitalRead, i.vitalTotal) / i.vitalTotal) * 100) : 0; continue; }
    const p = parts[a]; areas[a] = p.length ? Math.round((p.filter((x) => x.done).length / p.length) * 100) : 0;
  }
  const total = Math.round(AREAS.reduce((n, a) => n + (areas[a] * WEIGHTS[a]) / 100, 0));
  // next step = the unchecked item whose area gives the most points per item
  let next: Next | null = null;
  for (const a of AREAS) {
    if (a === 'knowledge') { if (i.vitalTotal > i.vitalRead) { const gain = WEIGHTS[a] / i.vitalTotal; if (!next || gain > next.gain) next = { area: a, gain }; } continue; }
    const p = parts[a]; const open = p.filter((x) => !x.done); if (!open.length) continue;
    const gain = WEIGHTS[a] / p.length;
    if (!next || gain > next.gain) next = { area: a, itemId: open[0].id, gain };
  }
  return { total, areas, next };
}
export const kitIds = (kit = '72h') => KITS[kit].map((x) => x.id);
