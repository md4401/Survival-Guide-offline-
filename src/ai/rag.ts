// Anchored answers (spec §6.9). Pure logic: guards, retrieval prompt, verification. The model only SUMMARISES reviewed guides.
import type MiniSearch from 'minisearch';
import type { Guide } from '../content/types';
import { search } from '../search';

export type Intent = { kind: 'vital'; guideId: string } | { kind: 'blocked'; topic: 'dose' | 'diagnosis' | 'danger' } | { kind: 'normal' };

const VITAL: Array<[RegExp, string]> = [
  [/n[aã]o respira|parou de respirar|sem pulso|parada card|\brcp\b|\bcpr\b|not breathing|no pulse|cardiac arrest|stopped breathing/i, 'firstaid.cpr'],
  [/sangr|hemorrag|bleed/i, 'firstaid.bleeding'],
  [/engasg|chok/i, 'firstaid.choking'],
  [/inc[eê]ndio|fogo em casa|house fire|fire in (my|the) (house|home)/i, 'scenario.house-fire'],
  [/terremoto|earthquake/i, 'scenario.earthquake'],
  [/enchente|inunda|flood/i, 'scenario.flood'],
  [/hipotermia|hypotherm/i, 'firstaid.hypothermia'],
  [/insola[cç]|heat ?stroke/i, 'firstaid.heat'],
  [/queimadura|\bburn/i, 'firstaid.burns'],
];
const BLOCKED: Array<[RegExp, 'dose' | 'diagnosis' | 'danger']> = [
  [/\bdoses?\b|dosagem|quantos? (mg|comprimidos?|gotas)|how (many|much) (mg|pills?|tablets?)|overdose/i, 'dose'],
  [/diagn[oó]stic|que doen[cç]a eu tenho|what (disease|illness) do i have|diagnose/i, 'diagnosis'],
  [/\barmas?\b|weapon|explosiv|\bbomb|fabricar|make (a )?poison|veneno para/i, 'danger'],
];
/** Life-risk words open the reviewed vital guide directly (no generation). Blocked topics are redirected. */
export function classify(q: string): Intent {
  for (const [re, topic] of BLOCKED) if (re.test(q)) return { kind: 'blocked', topic };
  for (const [re, guideId] of VITAL) if (re.test(q)) return { kind: 'vital', guideId };
  return { kind: 'normal' };
}

export interface Excerpt { id: string; title: string; text: string }
export function toExcerpt(g: Guide): Excerpt {
  const text = [g.summary, ...g.now.map((s, i) => `${i + 1}. ${s}`), ...g.understand.slice(0, 3), g.warning ?? ''].filter(Boolean).join(' ').slice(0, 900);
  return { id: g.id, title: g.title, text };
}
/** Top guides (published only) for the question, via the same offline index as search. */
export function retrieve(index: MiniSearch, guides: Guide[], locale: string, q: string, k = 4, includeDrafts = false): Excerpt[] {
  const byId = new Map(guides.filter((g) => includeDrafts || g.status === 'published').map((g) => [g.id, g]));
  // typo-only matches (exact=false) are too weak to ground an answer
  return search(index, locale, q).filter((h) => h.exact && byId.has(h.id)).slice(0, k).map((h) => toExcerpt(byId.get(h.id)!));
}

const LANG_NAME: Record<string, string> = { en: 'English', pt: 'Portuguese', es: 'Spanish', fr: 'French', ar: 'Arabic', hi: 'Hindi', zh: 'Chinese' };
export function buildMessages(locale: string, question: string, ex: Excerpt[], noThink = false) {
  const ctx = ex.map((e) => `[${e.id}] ${e.title}\n${e.text}`).join('\n\n');
  const system = [
    `You are a survival-guide helper. Answer in ${LANG_NAME[locale] ?? 'English'}.`,
    'Use ONLY the guide excerpts below. If they do not answer the question, say you do not know.',
    'Be short (max 200 words). Use numbered steps. Cite the guide id in square brackets, like [water.diy-filter].',
    'Never give medicine doses, diagnoses, or instructions about weapons or explosives. Do not invent numbers, times or quantities.',
    '', 'GUIDE EXCERPTS:', ctx,
  ].join('\n');
  return [{ role: 'system', content: system }, { role: 'user', content: question + (noThink ? ' /no_think' : '') }];
}

export const stripThink = (s: string) => s.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').trim();
export function trimWords(s: string, max = 200): string {
  const w = s.trim().split(/\s+/);
  return w.length <= max ? s.trim() : w.slice(0, max).join(' ') + '…';
}
const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.'));
/** Spec §6.9 step 5: the answer must cite a retrieved guide, and every number must exist in the excerpts. */
export function verify(answer: string, ex: Excerpt[]): { ok: boolean; reason?: 'no-citation' | 'unknown-number' | 'empty' } {
  if (!answer.trim()) return { ok: false, reason: 'empty' };
  const cited = [...answer.matchAll(/\[([\w.-]+)\]/g)].map((m) => m[1]);
  if (!cited.some((c) => ex.some((e) => e.id === c))) return { ok: false, reason: 'no-citation' };
  const body = answer.replace(/\[[\w.-]+\]/g, '').replace(/^\s*\d+[.)]\s+/gm, '');
  const known = new Set(ex.flatMap((e) => nums(e.title + ' ' + e.text)));
  for (const n of nums(body)) if (!known.has(n)) return { ok: false, reason: 'unknown-number' };
  return { ok: true };
}

export type Result =
  | { kind: 'vital'; guideId: string }
  | { kind: 'blocked'; topic: 'dose' | 'diagnosis' | 'danger' }
  | { kind: 'noresult' }
  | { kind: 'guides'; excerpts: Excerpt[]; reason: 'no-model' | 'rejected' | 'error' }
  | { kind: 'answer'; text: string; excerpts: Excerpt[] };

export interface AskDeps {
  index: MiniSearch; guides: Guide[]; locale: string; generate: null | ((messages: Array<{ role: string; content: string }>, onToken: (t: string) => void) => Promise<string>);
  onToken?: (t: string) => void; noThink?: boolean;
  /** evaluation only: let drafts be used as context so the sets can run before guides are published */
  includeDrafts?: boolean;
}
export async function ask(q: string, d: AskDeps): Promise<Result> {
  const intent = classify(q);
  if (intent.kind === 'vital') return { kind: 'vital', guideId: intent.guideId };
  if (intent.kind === 'blocked') return { kind: 'blocked', topic: intent.topic };
  const ex = retrieve(d.index, d.guides, d.locale, q, 4, d.includeDrafts);
  if (!ex.length) return { kind: 'noresult' };
  if (!d.generate) return { kind: 'guides', excerpts: ex, reason: 'no-model' };
  try {
    const raw = await d.generate(buildMessages(d.locale, q, ex, d.noThink), d.onToken ?? (() => {}));
    const text = trimWords(stripThink(raw));
    return verify(text, ex).ok ? { kind: 'answer', text, excerpts: ex } : { kind: 'guides', excerpts: ex, reason: 'rejected' };
  } catch { return { kind: 'guides', excerpts: ex, reason: 'error' }; }
}
