/** Device clock plus a manual offset (saved on device) for when the phone clock is wrong. */
export const nowMs = (offsetMs = 0) => Date.now() + offsetMs;

export interface Parts { year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number }

/** Calendar/clock fields of an instant in an IANA time zone (default: device). weekday 0=Sunday. */
export function partsIn(ms: number, timeZone?: string): Parts {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short' });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(new Date(ms))) o[p.type] = p.value;
  return { year: +o.year, month: +o.month, day: +o.day, hour: +o.hour % 24, minute: +o.minute, second: +o.second, weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
}
export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export function dayOfYear(y: number, m: number, d: number): number {
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[m - 1] + d + (m > 2 && isLeap(y) ? 1 : 0);
}
/** ISO-8601 week number and week-year. */
export function isoWeek(y: number, m: number, d: number): { week: number; year: number } {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(dt.getUTCFullYear(), 0, 1);
  return { week: Math.ceil(((dt.getTime() - yearStart) / 86400000 + 1) / 7), year: dt.getUTCFullYear() };
}
export const quarter = (m: number) => Math.ceil(m / 3);

/** Day counter: the start day is "Day 1". Uses local calendar days in `timeZone`. */
export function dayNumber(startMs: number, nowMs_: number, timeZone?: string): number {
  const a = partsIn(startMs, timeZone), b = partsIn(nowMs_, timeZone);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86400000) + 1;
}
export function elapsed(startMs: number, nowMs_: number) {
  const s = Math.max(0, Math.floor((nowMs_ - startMs) / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60) };
}
