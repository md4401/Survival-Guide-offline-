export type Repeat = 'none' | 'daily' | 'weekly' | 'yearly';
export interface AgendaEvent { id?: number; title: string; at: number; note: string; repeat: Repeat }
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
