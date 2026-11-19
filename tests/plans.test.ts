import { describe, it, expect } from 'vitest';
import { FEATURES, LIMITS_BY_PLAN, limit, vitalFeatures, byPlan } from '../src/data/plans';
import { FLAGS } from '../src/flags';

describe('plan matrix', () => {
  it('ids are unique and every feature has a valid plan', () => {
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length);
    for (const f of FEATURES) expect(['free', 'premium', 'both']).toContain(f.plan);
  });
  it('anything vital is free (spec §2: nothing that protects life is paywalled)', () => {
    for (const f of vitalFeatures()) expect(f.plan, f.id).toBe('free');
  });
  it('premium-only features are never vital and none is an upgrade nag in emergencies', () => {
    for (const f of byPlan('premium')) expect(f.vital, f.id).toBe(false);
    expect(FEATURES.find((f) => f.id === 'noUpgradeNags')).toMatchObject({ plan: 'free', vital: true });
  });
  it('the vital basics from the spec are all present and free', () => {
    for (const id of ['triage', 'emergencyNumbers', 'flashlightSos', 'whistle', 'coordinates', 'scenarios8', 'firstAidEssentials', 'waterEssentials', 'messagesBasic', 'languages']) expect(FEATURES.find((f) => f.id === id)?.plan, id).toBe('free');
  });
  it('premium limits are never lower than free limits; free values apply while premium is off', () => {
    for (const [k, v] of Object.entries(LIMITS_BY_PLAN)) expect(v.premium, k).toBeGreaterThanOrEqual(v.free);
    expect(FLAGS.premium).toBe(false);
    expect(limit('privateChannels')).toBe(3); expect(limit('privateChannels', true)).toBe(Infinity); expect(limit('livePeers')).toBe(1);
  });
});
