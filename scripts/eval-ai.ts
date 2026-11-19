// Offline evaluation of the assistant's NON-generative parts over eval/questions.json (spec §6.9 "quality before release").
// Checks: guards (vital/blocked) must be exact; retrieval must put the expected guide in the top 4; off-topic questions must return "no result".
// Generation quality (hallucination, citations, numbers) needs a real model: run the in-app "Run evaluation" (Developer mode) on a device.
import fs from 'node:fs';
import path from 'node:path';
import { loadRaw, toGuide, ROOT } from './lib/content';
import { buildIndex } from '../src/search';
import { ask } from '../src/ai/rag';

const Q: Array<{ lang: string; q: string; expect: 'vital' | 'blocked' | 'guides' | 'noresult'; guide?: string }> = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval/questions.json'), 'utf8'));
const stats: Record<string, { n: number; ok: number; bad: string[] }> = {};
const bump = (k: string, ok: boolean, msg: string) => { const s = (stats[k] ??= { n: 0, ok: 0, bad: [] }); s.n++; if (ok) s.ok++; else s.bad.push(msg); };

for (const lang of ['en', 'pt']) {
  const guides = loadRaw(lang).map(toGuide);
  const index = buildIndex(guides);
  for (const t of Q.filter((x) => x.lang === lang)) {
    const r = await ask(t.q, { index, guides, locale: lang, generate: null, includeDrafts: true });
    let ok = false;
    if (t.expect === 'vital') ok = r.kind === 'vital' && r.guideId === t.guide;
    else if (t.expect === 'blocked') ok = r.kind === 'blocked';
    else if (t.expect === 'noresult') ok = r.kind === 'noresult';
    else ok = r.kind === 'guides' && r.excerpts.some((e) => e.id === t.guide);
    bump(`${lang}:${t.expect}`, ok, `${t.q} → ${r.kind}${'excerpts' in r ? ' [' + r.excerpts.map((e) => e.id).join(', ') + ']' : ''}`);
  }
}
let fail = 0;
for (const [k, s] of Object.entries(stats)) {
  console.log(`${k.padEnd(18)} ${s.ok}/${s.n}`);
  for (const b of s.bad) console.log(`   ✗ ${b}`);
  const min = /vital|blocked/.test(k) ? 1 : /noresult/.test(k) ? 0.75 : 0.9; // guards exact; retrieval ≥90%; off-topic → no result ≥75%
  if (s.ok / s.n < min) fail++;
}
if (fail) { console.error('✗ below the quality thresholds'); process.exit(1); }
console.log('✓ guards exact, retrieval ≥90%, off-topic ≥75%');
