import type { Guide } from '../content/types';
/** Review dashboard numbers for developer mode. */
export function reviewStats(gs: Pick<Guide, 'status' | 'needsReview' | 'review' | 'kind' | 'vital'>[]) {
  const by = <K extends string>(f: (g: (typeof gs)[number]) => K) => gs.reduce((m, g) => { const k = f(g); m[k] = (m[k] ?? 0) + 1; return m; }, {} as Record<K, number>);
  return { total: gs.length, byStatus: by((g) => g.status), byLevel: by((g) => g.review.level), byKind: by((g) => g.kind), needsReview: gs.filter((g) => g.needsReview).length, vitalNotReviewed: gs.filter((g) => g.vital && g.review.level === 'draft').length };
}
