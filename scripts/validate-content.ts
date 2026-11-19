import { loadRaw, LANGS, MACHINE_LANGS, ROOT } from './lib/content';

export interface Issue { file: string; msg: string }
const REQUIRED = ['id', 'category', 'plan', 'vital', 'title', 'review', 'materials', 'related'];
const LEVELS = ['professional', 'official', 'common', 'draft'];
export const MAX_WORDS = 12;
/** Word count; Chinese has no spaces, so ~2 characters per word. */
export const wordCount = (s: string, lang: string) => (lang === 'zh' ? Math.ceil([...s.replace(/\s/g, '')].length / 2) : s.trim().split(/\s+/).length);
export const MAX_STEPS = 10; // spec §4 says 5, but both spec example guides have 8-10 (see DECISIONS.md)

export function validateAll(langs: readonly string[] = LANGS): Issue[] {
  const issues: Issue[] = [];
  const idsByLang: Record<string, Set<string>> = {};
  for (const lang of langs) {
    const items = loadRaw(lang);
    idsByLang[lang] = new Set(items.map((i) => i.raw.id));
    const seen = new Set<string>();
    for (const { file, raw, body } of items) {
      const bad = (msg: string) => issues.push({ file, msg });
      for (const k of REQUIRED) if (raw[k] === undefined || raw[k] === null || raw[k] === '') bad(`missing field: ${k}`);
      if (raw.id) {
        if (seen.has(raw.id)) bad(`duplicate id: ${raw.id}`);
        seen.add(raw.id);
      }
      if (raw.plan && !['free', 'premium'].includes(raw.plan)) bad(`invalid plan: ${raw.plan}`);
      if (raw.vital && raw.plan === 'premium') bad('vital content cannot be premium');
      const r = raw.review ?? {};
      if (!r.date) bad('missing review.date');
      if (!LEVELS.includes(r.level)) bad(`invalid review.level: ${r.level}`);
      if (!r.source || !String(r.source).trim()) bad('missing review.source');
      const published = (raw.status ?? 'published') === 'published';
      const steps: string[] = raw.now ?? [];
      if (published && steps.length === 0) bad('published guide needs at least one step in "now"');
      if (steps.length > MAX_STEPS) bad(`"now" has ${steps.length} steps (max ${MAX_STEPS})`);
      steps.forEach((s, i) => {
        const n = wordCount(String(s), lang);
        if (n > MAX_WORDS) bad(`step ${i + 1} has ${n} words (max ${MAX_WORDS}): "${s}"`);
      });
      for (const [stage, list] of Object.entries<string[]>(raw.timeline ?? {})) {
        if (!['10min', '1h', '24h', '72h', '7d', '30d'].includes(stage)) bad(`invalid timeline stage: ${stage}`);
        (list ?? []).forEach((s, i) => {
          const n = wordCount(String(s), lang);
          if (n > MAX_WORDS) bad(`timeline ${stage} step ${i + 1} has ${n} words (max ${MAX_WORDS}): "${s}"`);
        });
      }
      if ((MACHINE_LANGS as readonly string[]).includes(lang) && (published || !raw.needsReview)) bad('machine-translated guides must stay draft + needsReview until a native speaker reviews them');
      if (!published && !raw.needsReview) bad('draft must set needsReview: true');
      void body;
    }
  }
  // broken links (related ids must exist in the same language) + id parity across languages
  for (const lang of langs) {
    for (const { file, raw } of loadRaw(lang)) {
      for (const rel of raw.related ?? []) {
        if (!idsByLang[lang].has(rel)) issues.push({ file, msg: `broken related link: ${rel}` });
      }
    }
  }
  const [first, ...rest] = langs;
  for (const l of rest) {
    for (const id of idsByLang[first]) if (!idsByLang[l].has(id)) issues.push({ file: `content/${l}`, msg: `id "${id}" missing in ${l}` });
    for (const id of idsByLang[l]) if (!idsByLang[first].has(id)) issues.push({ file: `content/${first}`, msg: `id "${id}" missing in ${first}` });
  }
  return issues;
}

if (process.argv[1]?.endsWith('validate-content.ts')) {
  const issues = validateAll();
  for (const i of issues) console.error(`✗ ${i.file}: ${i.msg}`);
  if (issues.length) { console.error(`\n${issues.length} issue(s) in ${ROOT}`); process.exit(1); }
  console.log('✓ content valid');
}
