import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { useSettings } from '../../db/settings';
import { loadGuides } from '../../content/loader';
import type { Guide } from '../../content/types';
import { pick } from '../../lib/l10n';
import { MYTHS, FACTS, CASES, DIY, DIY_OUT_OF_SCOPE, GLOSSARY } from '../../data/library';
import { PHRASES } from '../../data/phrases';
import { factOfDay, findGuides, heatIndexC, windChillC, heatBand, MERCALLI, BEACH_FLAGS, type FindKind } from '../../lib/library';

const Draft = () => <p class="muted">{t('lib.draft')}</p>;

export function Library() {
  const f = factOfDay(); const loc = useSettings().locale;
  return (
    <main class="stack"><h1>{t('lib.title')}</h1>
      <section class="card stack"><h2>{t('lib.today')}</h2><p>{pick(f.text, loc)}</p></section>
      <div class="grid2">
        <a class="btn tool" href={href('library', 'find')}><span class="ico" aria-hidden="true">🔎</span><span>{t('lib.find')}</span></a>
        <a class="btn tool" href={href('library', 'myths')}><span class="ico" aria-hidden="true">🧐</span><span>{t('lib.myths')}</span></a>
        <a class="btn tool" href={href('library', 'facts')}><span class="ico" aria-hidden="true">💡</span><span>{t('lib.facts')}</span></a>
        <a class="btn tool" href={href('library', 'cases')}><span class="ico" aria-hidden="true">📖</span><span>{t('lib.cases')}</span></a>
        <a class="btn tool" href={href('library', 'diy')}><span class="ico" aria-hidden="true">🛠</span><span>{t('lib.diy')}</span></a>
        <a class="btn tool" href={href('library', 'glossary')}><span class="ico" aria-hidden="true">📚</span><span>{t('lib.glossary')}</span></a>
        <a class="btn tool" href={href('library', 'phrases')}><span class="ico" aria-hidden="true">🗣</span><span>{t('lib.phrases')}</span></a>
        <a class="btn tool" href={href('library', 'scales')}><span class="ico" aria-hidden="true">📊</span><span>{t('lib.scales')}</span></a>
      </div></main>
  );
}

export function Myths() {
  const loc = useSettings().locale;
  return (<main class="stack"><h1>{t('lib.myths')}</h1><Draft />
    <ul class="list">{MYTHS.map((m) => <li class="card stack"><b>{pick(m.claim, loc)}</b><span class={m.verdict === 'true' ? 'badge' : 'danger-box'}>{t(`verdict.${m.verdict}`)}</span><span>{pick(m.why, loc)}</span></li>)}</ul></main>);
}
export function Facts() {
  const loc = useSettings().locale;
  return (<main class="stack"><h1>{t('lib.facts')}</h1><Draft /><ul class="list">{FACTS.map((f) => <li class="card"><span class="muted">{t(`topic.${f.topic}`)}</span><p>{pick(f.text, loc)}</p></li>)}</ul></main>);
}
export function Cases() {
  const loc = useSettings().locale;
  return (<main class="stack"><h1>{t('lib.cases')}</h1><Draft /><p class="muted">{t('lib.cases.note')}</p><ul class="list">{CASES.map((c) => <li class="card stack"><b>{pick(c.title, loc)}</b><span>{t('lib.lesson')}: {pick(c.lesson, loc)}</span></li>)}</ul></main>);
}
export function Diy() {
  const loc = useSettings().locale;
  return (<main class="stack"><h1>{t('lib.diy')}</h1><Draft /><p class="danger-box">{pick(DIY_OUT_OF_SCOPE, loc)}</p>
    <ul class="list">{DIY.map((d) => <li class="card stack"><b>{pick(d.title, loc)}</b><span class="muted">{t('guide.level', { n: d.level })} · {t(`risk.${d.risk}`)}</span><span>{pick(d.note, loc)}</span></li>)}</ul></main>);
}
export function Glossary() {
  const loc = useSettings().locale; const [q, setQ] = useState('');
  const n = q.trim().toLowerCase(); const list = GLOSSARY.filter((g) => !n || pick(g.term, loc).toLowerCase().includes(n) || pick(g.def, loc).toLowerCase().includes(n));
  return (<main class="stack"><h1>{t('lib.glossary')}</h1><Draft />
    <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('lib.glossary.search')} aria-label={t('lib.glossary.search')} />
    <ul class="list">{list.map((g) => <li class="card"><b>{pick(g.term, loc)}</b> <span class="muted">· {t(`gloss.${g.group}`)}</span><p>{pick(g.def, loc)}</p></li>)}</ul></main>);
}

export function Phrases() {
  const loc = useSettings().locale; const [lang, setLang] = useState('en'); const [big, setBig] = useState<string | null>(null);
  const LANGS = ['en', 'pt', 'es', 'fr', 'ar', 'hi', 'zh'];
  const shown = PHRASES.find((p) => p.id === big);
  if (shown) return (
    <main class="stack" style="text-align:center"><p class="muted">{pick(shown.text as any, loc)}</p>
      <p lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} style="font-size:2.4rem;font-weight:700;line-height:1.3">{shown.text[lang]}</p>
      {(shown.translit as Record<string, string>)[lang] && <p class="muted" style="font-size:1.4rem">{(shown.translit as Record<string, string>)[lang]}</p>}
      <button class="btn" onClick={() => setBig(null)}>{t('common.back')}</button></main>);
  return (
    <main class="stack"><h1>{t('lib.phrases')}</h1><p class="muted">{t('phr.intro')}</p><Draft />
      <label class="row"><span style="flex:1">{t('phr.show')}</span><select value={lang} onChange={(e) => setLang((e.target as HTMLSelectElement).value)}>{LANGS.map((l) => <option value={l}>{l.toUpperCase()}</option>)}</select></label>
      <ul class="list">{PHRASES.map((p) => <li><button class="btn" style="inline-size:100%;text-align:start" onClick={() => setBig(p.id)}><span style="flex:1">{pick(p.text as any, loc)}</span><span lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{p.text[lang]}</span></button></li>)}</ul></main>);
}

export function Find() {
  const [kind, setKind] = useState<FindKind>('situation'); const [q, setQ] = useState(''); const [gs, setGs] = useState<Guide[]>([]);
  useEffect(() => { loadGuides().then((r) => setGs(r.guides)).catch(() => {}); }, []);
  const res = findGuides(gs, q, kind);
  return (<main class="stack"><h1>{t('lib.find')}</h1>
    <div class="row">{(['situation', 'material', 'symptom'] as FindKind[]).map((k) => <button class={`btn${kind === k ? ' primary' : ''}`} onClick={() => setKind(k)}>{t(`find.${k}`)}</button>)}</div>
    <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t(`find.${kind}.ph`)} aria-label={t(`find.${kind}.ph`)} />
    {q.trim() && (res.length ? <ul class="list">{res.map((g) => <li><a class="btn" href={href('guide', g.id)}>{g.title}</a></li>)}</ul> : <p class="muted">{t('find.none')}</p>)}</main>);
}

export function Scales() {
  const [tc, setTc] = useState(32), [rh, setRh] = useState(70), [wt, setWt] = useState(-5), [wv, setWv] = useState(30);
  const hi = heatIndexC(tc, rh); const band = heatBand(hi * 1.8 + 32); const wc = windChillC(wt, wv);
  const num = (v: number, set: (n: number) => void, label: string) => <label class="row"><span style="flex:1">{label}</span><input type="number" value={v} style="width:6rem" onInput={(e) => set(Number((e.target as HTMLInputElement).value))} /></label>;
  return (<main class="stack"><h1>{t('lib.scales')}</h1><Draft />
    <section class="card stack"><h2>{t('scales.heat')}</h2>{num(tc, setTc, t('scales.temp'))}{num(rh, setRh, t('scales.rh'))}
      <p><b>{hi.toFixed(1)} °C</b> · {t(`heat.${band}`)}</p><p class="muted">{t('scales.heat.note')}</p></section>
    <section class="card stack"><h2>{t('scales.chill')}</h2>{num(wt, setWt, t('scales.temp'))}{num(wv, setWv, t('scales.wind'))}
      <p><b>{wc.toFixed(1)} °C</b></p><p class="muted">{t('scales.chill.note')}</p></section>
    <section class="card stack"><h2>{t('scales.mercalli')}</h2><ol class="list">{MERCALLI.map((n) => <li><b>{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1]}</b> {t(`mercalli.${n}`)}</li>)}</ol></section>
    <section class="card stack"><h2>{t('scales.beach')}</h2><p class="muted">{t('scales.beach.note')}</p><ul class="list">{BEACH_FLAGS.map(([id, c]) => <li class="row"><span aria-hidden="true" style={`inline-size:1.5rem;block-size:1.5rem;border-radius:4px;background:${c};border:1px solid #888`} /><span>{t(`beach.${id}`)}</span></li>)}</ul></section>
    <a class="btn" href={href('signal')}>{t('scales.ground')}</a></main>);
}
