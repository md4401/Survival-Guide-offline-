import type { L } from './l10n';
export interface Question { id: string; guide?: string; q: L; options: L[]; answer: number; explain: L }
/** Deterministic shuffle (mulberry32) so a quiz can be repeated from a seed. */
export function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs]; let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pickQuestions = (all: Question[], n: number, seed: number, guide?: string) => shuffle(guide ? all.filter((q) => q.guide === guide) : all, seed).slice(0, n);
export function score(qs: Question[], answers: Array<number | undefined>) {
  const right = qs.filter((q, i) => answers[i] === q.answer).length;
  return { right, total: qs.length, pct: qs.length ? Math.round((right / qs.length) * 100) : 0, wrong: qs.filter((q, i) => answers[i] !== q.answer).map((q) => q.id) };
}
/** Structural check used by tests: every question has ≥2 options, a valid answer, and an explanation. */
export const validQuestion = (q: Question) => q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length && !!q.explain.en && !!q.q.en && q.options.every((o) => !!o.en);
