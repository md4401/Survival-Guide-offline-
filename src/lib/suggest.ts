import type { Season } from './astro';
export interface Suggestion { scenario: string; reason: string }
/** Transparent rules (no AI): profile + season → scenarios, each with a "why am I seeing this" key. Regional hazards need data and are not included. */
export function suggest(o: { season: Season | null; home: '' | 'house' | 'apartment'; kids: number; elderly: number; pets: number }): Suggestion[] {
  const out: Suggestion[] = [];
  if (o.season === 'summer') out.push({ scenario: 'heatwave', reason: 'why.summer' });
  if (o.season === 'winter') out.push({ scenario: 'coldwave', reason: 'why.winter' });
  if (o.home === 'apartment') out.push({ scenario: 'fire', reason: 'why.apartment' });
  out.push({ scenario: 'blackout', reason: 'why.blackout' });
  return out;
}
