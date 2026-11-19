// Family plan: validation and merging for QR/text sharing between family members' devices.
export interface Contact { name: string; phone: string }
export interface FamilyPlan { contacts: Contact[]; near: string; far: string; outside: string; hours: string; routes: string; roles: string; kids: string }
export const EMPTY_PLAN: FamilyPlan = { contacts: [], near: '', far: '', outside: '', hours: '', routes: '', roles: '', kids: '' };
const str = (x: unknown, max = 400) => (typeof x === 'string' ? x.slice(0, max) : '');
/** Accepts only well-formed data from another device; everything is clipped (a QR code is untrusted input). */
export function sanitizePlan(x: any): FamilyPlan | null {
  if (!x || typeof x !== 'object') return null;
  const contacts: Contact[] = Array.isArray(x.contacts) ? x.contacts.slice(0, 30).map((c: any) => ({ name: str(c?.name, 60), phone: str(c?.phone, 30) })).filter((c: Contact) => c.name && /^[\d+()\-.\s]{3,30}$/.test(c.phone)) : [];
  return { contacts, near: str(x.near), far: str(x.far), outside: str(x.outside), hours: str(x.hours), routes: str(x.routes, 1000), roles: str(x.roles, 1000), kids: str(x.kids, 1000) };
}
const digits = (p: string) => p.replace(/\D/g, '');
/** Adds the other plan's contacts (no duplicate phone numbers) and fills only empty text fields: never overwrites what you wrote. */
export function mergePlans(mine: FamilyPlan, other: FamilyPlan): { plan: FamilyPlan; added: number } {
  const have = new Set(mine.contacts.map((c) => digits(c.phone))); const add = other.contacts.filter((c) => !have.has(digits(c.phone)));
  const pick = (a: string, b: string) => a || b;
  return { added: add.length, plan: { contacts: [...mine.contacts, ...add], near: pick(mine.near, other.near), far: pick(mine.far, other.far), outside: pick(mine.outside, other.outside), hours: pick(mine.hours, other.hours), routes: pick(mine.routes, other.routes), roles: pick(mine.roles, other.roles), kids: pick(mine.kids, other.kids) } };
}
