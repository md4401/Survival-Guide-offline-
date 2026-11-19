import { describe, it, expect } from 'vitest';
import { premiumUnlocked } from '../src/lib/access';
import type { License } from '../src/interfaces/license';
import { FLAGS } from '../src/flags';

const lic = (exp: number): License => ({ sub: 'x', plan: 'premium', issued: 0, expires: exp, graceDays: 30, devices: 1, sig: '' });
describe('premium gate', () => {
  it('Developer mode unlocks Premium features for testing', () => expect(premiumUnlocked({ dev: true }, null)).toBe(true));
  it('regular users stay locked while Premium is off, even with a valid license', () => {
    expect(FLAGS.premium).toBe(false);
    expect(premiumUnlocked({ dev: false }, null)).toBe(false);
    expect(premiumUnlocked({ dev: false }, lic(9e9), 1000)).toBe(false);
  });
});
