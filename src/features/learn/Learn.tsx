import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { db, getKV, setKV } from '../../db/dexie';
import { useSettings } from '../../db/settings';
import { loadGuides } from '../../content/loader';
import type { Guide } from '../../content/types';
import { PremiumGate } from '../../components/PremiumGate';
import { pick } from '../../lib/l10n';
import { QUIZ } from '../../data/quiz';
import { TREES } from '../../data/trees';
import { pickQuestions, score } from '../../lib/quiz';
import { walk } from '../../lib/tree';
import { EMPTY_STUDY, knowledgeMap, record, streak, thisWeek, type Study } from '../../lib/study';
import { SCENARIO_GUIDE, type ScenarioKey } from '../../lib/crisis';

function useStudy() {
  const [s, setS] = useState<Study>(EMPTY_STUDY);
  useEffect(() => { getKV<Study>('study', EMPTY_STUDY).then((x) => setS({ ...EMPTY_STUDY, ...x })); }, []);
  const save = (n: Study) => { setS(n); void setKV('study', n); };
  return [s, save] as const;
}

export function Learn() {
  const [s, save] = useStudy();
  return (
    <main class="stack"><h1>{t('learn.title')}</h1><p class="muted">{t('learn.intro')}</p>
      <section class="card stack"><h2>{t('learn.week')}</h2>
        <p>{t('learn.week.line', { n: thisWeek(s), g: s.goal, s: streak(s) })}</p>
        <label class="row"><span style="flex:1">{t('learn.goal')}</span><input type="number" min="1" max="14" value={s.goal} style="width:5rem" onInput={(e) => save({ ...s, goal: Math.max(1, Math.min(14, Number((e.target as HTMLInputElement).value) || 1)) })} /></label>
        <p class="muted">{t('learn.calm')}</p></section>
      <div class="grid2">
        <a class="btn tool" href={href('learn', 'quiz')}><span class="ico" aria-hidden="true">❓</span><span>{t('learn.quiz')}</span></a>
        <a class="btn tool" href={href('learn', 'trees')}><span class="ico" aria-hidden="true">🌳</span><span>{t('learn.trees')}</span></a>
        <a class="btn tool" href={href('learn', 'map')}><span class="ico" aria-hidden="true">🗺</span><span>{t('learn.map')}</span></a>
        <a class="btn tool" href={href('learn', 'drill')}><span class="ico" aria-hidden="true">🚨</span><span>{t('learn.drill')}</span></a>
      </div></main>
  );
}

export function Quiz() {
  const [s, save] = useStudy(); const loc = useSettings().locale;
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const qs = useMemo(() => pickQuestions(QUIZ, 8, seed), [seed]);
  const [ans, setAns] = useState<Array<number | undefined>>([]); const [i, setI] = useState(0); const [done, setDone] = useState(false);
  const q = qs[i]; const chosen = ans[i];
  const finish = () => { setDone(true); save(record(s)); };
  if (done) { const r = score(qs, ans); return (
    <main class="stack"><h1>{t('quiz.result')}</h1><p class="big">{r.right}/{r.total} · {r.pct}%</p>
      {r.wrong.length > 0 && <section class="card stack"><h2>{t('quiz.review')}</h2><ul class="list">{qs.filter((x) => r.wrong.includes(x.id)).map((x) => <li class="stack"><b>{pick(x.q, loc)}</b><span>✔ {pick(x.options[x.answer], loc)}</span><span class="muted">{pick(x.explain, loc)}</span>{x.guide && <a href={href('guide', x.guide)}>{t('quiz.read')}</a>}</li>)}</ul></section>}
      <button class="btn" onClick={() => { setSeed(seed + 1); setAns([]); setI(0); setDone(false); }}>{t('quiz.again')}</button></main>); }
  return (
    <main class="stack"><h1>{t('learn.quiz')}</h1><p class="muted">{t('quiz.progress', { i: i + 1, n: qs.length })}</p>
      <section class="card stack"><h2>{pick(q.q, loc)}</h2>
        {q.options.map((o, k) => <button class={`btn${chosen === k ? ' primary' : ''}`} disabled={chosen !== undefined} onClick={() => { const a = [...ans]; a[i] = k; setAns(a); }}>{pick(o, loc)}</button>)}
        {chosen !== undefined && <p class={chosen === q.answer ? '' : 'danger-box'}>{chosen === q.answer ? '✔ ' : '✖ '}{pick(q.explain, loc)}</p>}</section>
      {chosen !== undefined && (i + 1 < qs.length ? <button class="btn primary" onClick={() => setI(i + 1)}>{t('quiz.next')}</button> : <button class="btn primary" onClick={finish}>{t('quiz.finish')}</button>)}</main>
  );
}

export function Trees({ id }: { id?: string }) {
  const loc = useSettings().locale; const tree = TREES.find((x) => x.id === id); const [ch, setCh] = useState<number[]>([]);
  if (!tree) return (<main class="stack"><h1>{t('learn.trees')}</h1><p class="muted">{t('tree.draft')}</p><ul class="list">{TREES.map((x) => <li><a class="btn" href={href('learn', 'trees', x.id)}>{pick(x.title, loc)}</a></li>)}</ul></main>);
  const w = walk(tree, ch);
  return (
    <main class="stack"><h1>{pick(tree.title, loc)}</h1><p class="muted">{t('tree.draft')}</p>
      {w.result ? <section class="card stack"><p class={w.result.urgent ? 'danger-box' : ''}>{pick(w.result.text, loc)}</p>
        {w.result.guide && <a class="btn primary" href={href('guide', w.result.guide)}>{t('tree.open')}</a>}
        <button class="btn" onClick={() => setCh([])}>{t('tree.restart')}</button></section>
        : w.current && <section class="card stack"><h2>{pick(w.current.q, loc)}</h2>{w.current.options.map((o, k) => <button class="btn" onClick={() => setCh([...ch, k])}>{pick(o.label, loc)}</button>)}
          {ch.length > 0 && <button class="btn" onClick={() => setCh(ch.slice(0, -1))}>{t('tree.back')}</button>}</section>}</main>
  );
}

export function KnowledgeMap() {
  const [gs, setGs] = useState<Guide[]>([]); const [read, setRead] = useState<Set<string>>(new Set());
  useEffect(() => { loadGuides().then((r) => setGs(r.guides.filter((g) => g.kind === 'guide'))).catch(() => {}); db.history.toArray().then((h) => setRead(new Set(h.map((x) => x.id)))).catch(() => {}); }, []);
  const m = knowledgeMap(gs, read);
  return (
    <main class="stack"><h1>{t('learn.map')}</h1><p class="muted">{t('map.intro')}</p>
      <ul class="list">{m.map((c) => <li class="card stack"><div class="row"><b style="flex:1">{c.category}</b><span>{c.read}/{c.total}</span></div><progress max="100" value={c.pct} aria-label={c.category} style="width:100%" /></li>)}</ul></main>
  );
}

const DRILLS: ScenarioKey[] = ['storm', 'earthquake', 'flood', 'blackout'].filter((k) => k in SCENARIO_GUIDE) as ScenarioKey[];
function DrillInner() {
  const [s, save] = useStudy(); const [k, setK] = useState<ScenarioKey | ''>(''); const [done, setDone] = useState<Set<number>>(new Set());
  const steps = [1, 2, 3, 4, 5];
  return (
    <main class="stack"><h1>{t('learn.drill')}</h1><p class="muted">{t('drill.intro')}</p>
      <div class="row">{DRILLS.map((x) => <button class={`btn${k === x ? ' primary' : ''}`} onClick={() => { setK(x); setDone(new Set()); }}>{t(`scenario.${x}`)}</button>)}</div>
      {k && <section class="card stack"><ul class="list">{steps.map((n) => <li><label class="row"><input type="checkbox" checked={done.has(n)} onChange={() => { const d = new Set(done); d.has(n) ? d.delete(n) : d.add(n); setDone(d); }} /><span>{t(`drill.step.${n}`)}</span></label></li>)}</ul>
        <a class="btn" href={href('guide', SCENARIO_GUIDE[k])}>{t('drill.read')}</a>
        {done.size === steps.length && <button class="btn primary" onClick={() => save(record(s))}>{t('drill.log')}</button>}</section>}</main>
  );
}
export const Drill = () => <PremiumGate><DrillInner /></PremiumGate>;
