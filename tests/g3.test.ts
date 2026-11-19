import { describe, it, expect } from 'vitest';
import { QUIZ } from '../src/data/quiz';
import { TREES } from '../src/data/trees';
import { shuffle, pickQuestions, score, validQuestion } from '../src/lib/quiz';
import { weekKey, record, thisWeek, streak, knowledgeMap, EMPTY_STUDY } from '../src/lib/study';
import { walk, validateTree, type Tree } from '../src/lib/tree';
import { pick } from '../src/lib/l10n';
import { loadRaw } from '../scripts/lib/content';

const guideIds = new Set(loadRaw('en').map((g) => g.raw.id));
describe('quiz', () => {
  it('all questions are well formed, bilingual and point to real guides', () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(20);
    for (const q of QUIZ) { expect(validQuestion(q), q.id).toBe(true); expect(q.q.pt && q.explain.pt && q.options.every((o) => o.pt), q.id).toBeTruthy(); if (q.guide) expect(guideIds.has(q.guide), q.guide).toBe(true); }
    expect(new Set(QUIZ.map((q) => q.id)).size).toBe(QUIZ.length);
  });
  it('shuffle is deterministic and a permutation; pickQuestions filters by guide', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], 7); expect(a).toEqual(shuffle([1, 2, 3, 4, 5, 6, 7, 8], 7)); expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]); expect(a).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(pickQuestions(QUIZ, 5, 1).length).toBe(5); expect(pickQuestions(QUIZ, 10, 1, 'water.disinfect').every((q) => q.guide === 'water.disinfect')).toBe(true);
  });
  it('scoring', () => { const qs = QUIZ.slice(0, 4); const r = score(qs, [qs[0].answer, qs[1].answer, undefined, (qs[3].answer + 1) % qs[3].options.length]); expect(r).toMatchObject({ right: 2, total: 4, pct: 50 }); expect(r.wrong.length).toBe(2); expect(score([], []).pct).toBe(0); });
  it('pick falls back to English', () => { expect(pick({ en: 'a', pt: 'b' }, 'pt')).toBe('b'); expect(pick({ en: 'a' }, 'ar')).toBe('a'); });
});
describe('decision trees', () => {
  it('shipped trees are valid, bilingual and only route to real guides', () => {
    for (const t of TREES) { expect(validateTree(t), t.id).toEqual([]); for (const n of t.nodes) { expect(n.q.pt).toBeTruthy(); for (const o of n.options) { expect(o.label.pt).toBeTruthy(); if (o.result?.guide) expect(guideIds.has(o.result.guide), o.result.guide).toBe(true); } } }
  });
  it('walks to the right result', () => {
    const t = TREES.find((x) => x.id === 'collapse')!;
    const r = walk(t, [0, 0, 1]); expect(r.result?.guide).toBe('firstaid.cpr'); expect(r.result?.urgent).toBe(true);
    expect(walk(t, [0]).current?.id).toBe('n1'); expect(walk(t, [1]).result?.guide).toBe('firstaid.choking'); expect(walk(t, [0, 1]).result?.urgent).toBe(true);
  });
  it('validator catches broken, unreachable and cyclic trees', () => {
    const L = (en: string) => ({ en });
    const bad: Tree = { id: 'x', title: L('x'), start: 'a', nodes: [{ id: 'a', q: L('a'), options: [{ label: L('1'), next: 'b' }, { label: L('2'), next: 'zzz' }, { label: L('3') }] }, { id: 'b', q: L('b'), options: [{ label: L('back'), next: 'a' }] }, { id: 'c', q: L('c'), options: [{ label: L('r'), result: { text: L('ok') } }] }] };
    const e = validateTree(bad).join('|'); expect(e).toContain('broken link zzz'); expect(e).toContain('without next/result'); expect(e).toContain('cycle'); expect(e).toContain('unreachable c');
  });
});
describe('study goals and knowledge map', () => {
  it('ISO week keys and counting', () => {
    expect(weekKey(new Date(2026, 0, 1))).toBe('2026-W01'); expect(weekKey(new Date(2024, 11, 30))).toBe('2025-W01'); expect(weekKey(new Date(2021, 0, 3))).toBe('2020-W53');
    let s = EMPTY_STUDY; const d = new Date(2026, 10, 19); s = record(record(s, d), d); expect(thisWeek(s, d)).toBe(2);
  });
  it('streak counts consecutive weeks that met the goal', () => {
    const d = new Date(2026, 10, 19); let s = { goal: 2, weeks: {} as Record<string, number> };
    s.weeks[weekKey(new Date(2026, 10, 19))] = 2; s.weeks[weekKey(new Date(2026, 10, 12))] = 3; s.weeks[weekKey(new Date(2026, 10, 5))] = 1;
    expect(streak(s, d)).toBe(2); s = { goal: 2, weeks: { [weekKey(new Date(2026, 10, 12))]: 2 } }; expect(streak(s, d)).toBe(1); expect(streak(EMPTY_STUDY, d)).toBe(0);
  });
  it('knowledge map groups by category with percentages', () => {
    const g = [{ id: 'a', category: 'water' }, { id: 'b', category: 'water' }, { id: 'c', category: 'firstaid' }];
    expect(knowledgeMap(g, new Set(['a', 'c']))).toEqual([{ category: 'firstaid', total: 1, read: 1, pct: 100 }, { category: 'water', total: 2, read: 1, pct: 50 }]);
  });
});
