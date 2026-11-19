// PLACEHOLDER quantities for planning only. Every number here needs professional review before release.
export type Cat = 'water' | 'food' | 'health' | 'energy' | 'comms' | 'shelter' | 'docs';
export interface KitItem {
  id: string; cat: Cat;
  /** quantity rules (summed): fixed + perPerson*people + perPersonDay*people*days */
  fixed?: number; perPerson?: number; perPersonDay?: number; unit?: 'L' | 'meals' | 'pcs' | 'sets';
  /** only shown when the profile has these (explains "why am I seeing this") */
  when?: 'kids' | 'elderly' | 'pets';
}
export const NEEDS_REVIEW = true;
export const KITS: Record<string, KitItem[]> = {
  '72h': [
    { id: 'water', cat: 'water', perPersonDay: 3, unit: 'L' },
    { id: 'purify', cat: 'water', fixed: 1, unit: 'sets' },
    { id: 'food', cat: 'food', perPersonDay: 3, unit: 'meals' },
    { id: 'firstaid', cat: 'health', fixed: 1, unit: 'sets' },
    { id: 'meds', cat: 'health', perPerson: 1, unit: 'sets' },
    { id: 'hygiene', cat: 'health', perPerson: 1, unit: 'sets' },
    { id: 'flashlight', cat: 'energy', perPerson: 1, unit: 'pcs' },
    { id: 'batteries', cat: 'energy', fixed: 1, unit: 'sets' },
    { id: 'powerbank', cat: 'energy', fixed: 1, unit: 'pcs' },
    { id: 'radio', cat: 'comms', fixed: 1, unit: 'pcs' },
    { id: 'whistle', cat: 'comms', perPerson: 1, unit: 'pcs' },
    { id: 'blanket', cat: 'shelter', perPerson: 1, unit: 'pcs' },
    { id: 'clothes', cat: 'shelter', perPerson: 1, unit: 'sets' },
    { id: 'docs', cat: 'docs', fixed: 1, unit: 'sets' },
    { id: 'cash', cat: 'docs', fixed: 1, unit: 'sets' },
    { id: 'kidsupplies', cat: 'health', fixed: 1, unit: 'sets', when: 'kids' },
    { id: 'elderlymeds', cat: 'health', fixed: 1, unit: 'sets', when: 'elderly' },
    { id: 'petsupplies', cat: 'food', fixed: 1, unit: 'sets', when: 'pets' },
  ],
  car: [
    { id: 'water', cat: 'water', perPerson: 1, unit: 'L' },
    { id: 'firstaid', cat: 'health', fixed: 1, unit: 'sets' },
    { id: 'flashlight', cat: 'energy', fixed: 1, unit: 'pcs' },
    { id: 'powerbank', cat: 'energy', fixed: 1, unit: 'pcs' },
    { id: 'blanket', cat: 'shelter', perPerson: 1, unit: 'pcs' },
    { id: 'whistle', cat: 'comms', fixed: 1, unit: 'pcs' },
    { id: 'docs', cat: 'docs', fixed: 1, unit: 'sets' },
  ],
};
export interface Needs { people: number; days: number; kids?: number; elderly?: number; pets?: number }

export function quantity(item: KitItem, n: Needs): number {
  return Math.ceil((item.fixed ?? 0) + (item.perPerson ?? 0) * n.people + (item.perPersonDay ?? 0) * n.people * n.days);
}
/** Items for a kit given the profile; conditional items appear only when the profile asks for them. */
export function plan(kit: string, n: Needs) {
  return (KITS[kit] ?? []).filter((i) => !i.when || (n[i.when] ?? 0) > 0).map((i) => ({ item: i, qty: quantity(i, n) }));
}
export const checkKey = (kit: string, id: string) => `${kit}:${id}`;
export function progress(kit: string, n: Needs, done: Set<string>): number {
  const items = plan(kit, n);
  return items.length ? Math.round((items.filter((x) => done.has(checkKey(kit, x.item.id))).length / items.length) * 100) : 0;
}
