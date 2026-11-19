// Inventory expiry and local reminders (no server).
export type Expiry = 'expired' | 'soon' | 'ok' | 'none';
const DAY = 86400000;
export const parseDay = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) : NaN);
export function daysLeft(expires: string, now = Date.now()): number | null {
  const t = parseDay(expires); if (Number.isNaN(t)) return null;
  const today = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  return Math.round((t - today) / DAY);
}
export function expiryStatus(expires: string, now = Date.now(), soonDays = 30): Expiry {
  const d = daysLeft(expires, now); return d === null ? 'none' : d < 0 ? 'expired' : d <= soonDays ? 'soon' : 'ok';
}
export const sortByExpiry = <T extends { expires: string }>(xs: T[]) => [...xs].sort((a, b) => (parseDay(a.expires) || Infinity) - (parseDay(b.expires) || Infinity));
export const dueSoon = <T extends { expires: string }>(xs: T[], now = Date.now(), soonDays = 30) => xs.filter((x) => ['expired', 'soon'].includes(expiryStatus(x.expires, now, soonDays)));

export interface Reminder { id: string; title: string; everyDays: number; last: number }
/** Recurring reminders (spec §6.6): kit review every 6 months, water rotation, power bank charge. */
export const DEFAULT_REMINDERS: Array<Omit<Reminder, 'last'>> = [{ id: 'kit', title: 'kit', everyDays: 182 }, { id: 'water', title: 'water', everyDays: 180 }, { id: 'powerbank', title: 'powerbank', everyDays: 90 }];
export const nextDue = (r: Reminder) => r.last + r.everyDays * DAY;
export const isDue = (r: Reminder, now = Date.now()) => now >= nextDue(r);
export const markDone = (rs: Reminder[], id: string, now = Date.now()) => rs.map((r) => (r.id === id ? { ...r, last: now } : r));
/** 09:00 local on the expiry date minus `before` days, for scheduling native notifications. Returns null when already past. */
export function notifyAt(expires: string, before: number, now = Date.now()): Date | null {
  const t = parseDay(expires); if (Number.isNaN(t)) return null;
  const [y, m, d] = [new Date(t).getUTCFullYear(), new Date(t).getUTCMonth(), new Date(t).getUTCDate() - before];
  const at = new Date(y, m, d, 9, 0, 0); return at.getTime() > now ? at : null;
}
