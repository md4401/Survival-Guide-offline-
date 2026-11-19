import { describe, it, expect } from 'vitest';
import { sanitizePlan, mergePlans, EMPTY_PLAN } from '../src/lib/family';
import { packText, unpackText } from '../src/lib/mesh/bundle';

describe('family plan sharing', () => {
  it('sanitizes untrusted input: types, lengths, phone format, max contacts', () => {
    expect(sanitizePlan(null)).toBeNull(); expect(sanitizePlan('x')).toBeNull();
    const p = sanitizePlan({ contacts: [{ name: 'Ana', phone: '+55 11 99999-0000' }, { name: '', phone: '123' }, { name: 'Bad', phone: '<script>' }, 5], near: 'x'.repeat(999), routes: 42 })!;
    expect(p.contacts).toEqual([{ name: 'Ana', phone: '+55 11 99999-0000' }]); expect(p.near.length).toBe(400); expect(p.routes).toBe('');
    expect(sanitizePlan({ contacts: Array.from({ length: 100 }, (_, i) => ({ name: 'n' + i, phone: '1234' + i })) })!.contacts.length).toBe(30);
  });
  it('merge adds new contacts, never duplicates a number, never overwrites your text', () => {
    const mine = { ...EMPTY_PLAN, contacts: [{ name: 'Ana', phone: '11 99999-0000' }], near: 'the oak' };
    const other = { ...EMPTY_PLAN, contacts: [{ name: 'Ana B', phone: '(11) 99999 0000' }, { name: 'Leo', phone: '21 88888-1111' }], near: 'the park', far: 'school' };
    const { plan, added } = mergePlans(mine, other); expect(added).toBe(1); expect(plan.contacts.map((c) => c.name)).toEqual(['Ana', 'Leo']); expect(plan.near).toBe('the oak'); expect(plan.far).toBe('school');
  });
  it('round-trips through the compressed text/QR code', async () => {
    const P = { raw: 'SGMC0.', zip: 'SGMC1.' }; const plan = { ...EMPTY_PLAN, contacts: [{ name: 'Ana', phone: '123456' }], near: 'oak' };
    const code = await packText({ app: 'sg-family', plan }, P); expect(code.startsWith('SGMC1.')).toBe(true);
    expect(sanitizePlan((await unpackText(code, P) as any).plan)).toEqual(plan);
  });
});
