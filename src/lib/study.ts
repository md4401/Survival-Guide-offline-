// Gentle study goals: a weekly target, never pushed during emergencies. Stored on the device.
export const weekKey = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7); return `${y}-W${String(w).padStart(2, '0')}`; };
export interface Study { goal: number; weeks: Record<string, number> }
export const EMPTY_STUDY: Study = { goal: 2, weeks: {} };
export const record = (s: Study, d = new Date()): Study => ({ ...s, weeks: { ...s.weeks, [weekKey(d)]: (s.weeks[weekKey(d)] ?? 0) + 1 } });
export const thisWeek = (s: Study, d = new Date()) => s.weeks[weekKey(d)] ?? 0;
/** Consecutive weeks (ending this week, or last week if this one has no activity yet) that met the goal. */
export function streak(s: Study, d = new Date()): number {
  let n = 0; const dt = new Date(d); const met = (x: Date) => (s.weeks[weekKey(x)] ?? 0) >= s.goal;
  if (!met(dt)) dt.setDate(dt.getDate() - 7);
  while (met(dt)) { n++; dt.setDate(dt.getDate() - 7); }
  return n;
}
export function knowledgeMap<T extends { id: string; category: string }>(guides: T[], read: Set<string>) {
  const by = new Map<string, { total: number; read: number }>();
  for (const g of guides) { const e = by.get(g.category) ?? { total: 0, read: 0 }; e.total++; if (read.has(g.id)) e.read++; by.set(g.category, e); }
  return [...by.entries()].map(([category, v]) => ({ category, ...v, pct: Math.round((v.read / v.total) * 100) })).sort((a, b) => a.category.localeCompare(b.category));
}
