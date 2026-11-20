export type Repeat = 'none' | 'daily' | 'weekly' | 'yearly';
export interface AgendaEvent { id?: number; title: string; at: number; note: string; repeat: Repeat; /** duration in minutes (default 60) */ dur?: number; allDay?: boolean }
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
/** Next time the event happens at or after `from` (epoch ms), or null if it already passed and does not repeat. */
export function nextOccurrence(e: AgendaEvent, from: number): number | null {
  const base = new Date(e.at); if (e.at >= from) return e.at; if (e.repeat === 'none') return null;
  const d = new Date(base);
  if (e.repeat === 'daily' || e.repeat === 'weekly') {
    const step = e.repeat === 'daily' ? 1 : 7; const days = Math.ceil((from - e.at) / 86400000 / step) * step;
    let c = addDays(base, days); while (c.getTime() < from) c = addDays(c, step); while (addDays(c, -step).getTime() >= from && addDays(c, -step).getTime() >= e.at) c = addDays(c, -step); return c.getTime();
  }
  d.setFullYear(new Date(from).getFullYear()); if (d.getTime() < from) d.setFullYear(d.getFullYear() + 1); return d.getTime();
}
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
/** Events that happen on a given calendar day (including repeats), sorted by time. */
export function onDay(es: AgendaEvent[], day: Date): AgendaEvent[] {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  return es.map((e) => ({ e, n: nextOccurrence(e, start) })).filter((x) => x.n != null && sameDay(new Date(x.n!), day)).sort((a, b) => a.n! - b.n!).map((x) => ({ ...x.e, at: x.n! }));
}
export function upcoming(es: AgendaEvent[], from: number, limit = 20): Array<AgendaEvent & { next: number }> {
  return es.map((e) => ({ ...e, next: nextOccurrence(e, from) })).filter((x): x is AgendaEvent & { next: number } => x.next != null).sort((a, b) => a.next - b.next).slice(0, limit);
}
export const past = (es: AgendaEvent[], from: number) => es.filter((e) => e.repeat === 'none' && e.at < from).sort((a, b) => b.at - a.at);
export const toLocalInput = (ms: number) => { const d = new Date(ms); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

/** First day of the week for a locale (0 = Sunday, 1 = Monday); Intl.Locale.weekInfo where available, otherwise Sunday. */
export function firstDay(locale: string): number {
  try { const wi = (new Intl.Locale(locale) as any).weekInfo ?? (new Intl.Locale(locale) as any).getWeekInfo?.(); const f = wi?.firstDay; return f === 7 ? 0 : typeof f === 'number' ? f : 0; } catch { return 0; }
}
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const sameDate = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
/** The six weeks (42 days) shown for a month, starting on `first` (0 = Sunday). */
export function monthGrid(year: number, month: number, first = 0): Date[] {
  const start = new Date(year, month, 1); const back = (start.getDay() - first + 7) % 7; const from = new Date(year, month, 1 - back);
  return Array.from({ length: 42 }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i));
}
/** The seven days of the week that contains `d`. */
export function weekDays(d: Date, first = 0): Date[] {
  const back = (d.getDay() - first + 7) % 7; return Array.from({ length: 7 }, (_, i) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - back + i));
}
/** Position of an event inside a day column, in minutes from 00:00, clipped to the day. */
export function eventBox(e: { at: number; dur?: number }, day: Date): { top: number; height: number } | null {
  const start = startOfDay(day).getTime(); const end = start + 86400000; const a = Math.max(start, e.at); const b = Math.min(end, e.at + (e.dur ?? 60) * 60000);
  if (b <= start || a >= end) return null; return { top: Math.round((a - start) / 60000), height: Math.max(20, Math.round((b - a) / 60000)) };
}
