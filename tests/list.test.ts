import { describe, it, expect } from 'vitest';
import { filterGuides, groupByCategory, categoryCounts, sortScenarios, SCENARIO_ORDER, SCENARIO_ICON } from '../src/lib/list';
const g = (id: string, category: string, title: string, vital = false, tags: string[] = [], materials: string[] = []) => ({ id, category, title, summary: `about ${title}`, vital, tags, materials });
const gs = [g('a', 'water', 'Boil water', false, ['thirst'], ['pot']), g('b', 'firstaid', 'Burns', true, ['burn']), g('c', 'water', 'Store water', true), g('d', 'firstaid', 'Bites')];
describe('list helpers', () => {
  it('filters by text across title, summary, tags and materials, and by category', () => {
    expect(filterGuides(gs, 'pot', '').map((x) => x.id)).toEqual(['a']); expect(filterGuides(gs, 'BURN', '').map((x) => x.id)).toEqual(['b']);
    expect(filterGuides(gs, '', 'water').map((x) => x.id)).toEqual(['a', 'c']); expect(filterGuides(gs, 'water', 'firstaid')).toEqual([]); expect(filterGuides(gs, '  ', '').length).toBe(4);
  });
  it('groups by category with vital first', () => {
    const r = groupByCategory(gs); expect(r.map((x) => x.category)).toEqual(['firstaid', 'water']);
    expect(r[0].items.map((x) => x.id)).toEqual(['b', 'd']); expect(r[1].items.map((x) => x.id)).toEqual(['c', 'a']);
    expect(categoryCounts(gs)).toEqual([['firstaid', 2], ['water', 2]]);
  });
  it('orders scenarios by urgency and every scenario has an icon', () => {
    const ids = ['scenario.blackout', 'scenario.flood', 'scenario.house-fire', 'scenario.new'].map((id) => ({ id }));
    expect(sortScenarios(ids).map((x) => x.id)).toEqual(['scenario.house-fire', 'scenario.flood', 'scenario.blackout', 'scenario.new']);
    for (const id of SCENARIO_ORDER) expect(SCENARIO_ICON[id]).toBeTruthy();
  });
});
