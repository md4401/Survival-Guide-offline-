import { useEffect, useState } from 'preact/hooks';
import type { Guide } from '../../content/types';
import { getGuide, loadGuides } from '../../content/loader';
import { t } from '../../i18n';
import { href } from '../../router';
import { db } from '../../db/dexie';
import { getSettings, useSettings } from '../../db/settings';
import { FLAGS } from '../../flags';
import { voiceReader } from '../../interfaces/tts';
import { addReport } from '../../lib/reports';
import { findTerms } from '../../lib/library';
import { pick } from '../../lib/l10n';
import { usePremium } from '../../components/PremiumGate';

const getSettingsDev = () => getSettings().dev;
const getLocale = () => getSettings().locale;

/** Review dates come from YAML as Date objects or ISO strings; show a short local date. */
const fmtDate = (d: unknown) => { const x = new Date(d as string); return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString(getLocale(), { timeZone: 'UTC' }); };

export function ReviewSeal({ g }: { g: Guide }) {
  return (
    <p class="muted">
      <span class="badge">{t(`review.${g.review.level}`)}</span>{' '}
      {g.needsReview && <span class="badge badge-warn">{t('review.needs')}</span>}{' '}
      <span>{t('review.date', { date: fmtDate(g.review.date) })}</span> · <span>{t('review.source', { source: g.review.source })}</span>
    </p>
  );
}

export function FavButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { db.favorites.get(id).then((f) => setOn(!!f)).catch(() => {}); }, [id]);
  const toggle = async () => {
    try { if (on) await db.favorites.delete(id); else await db.favorites.put({ id, at: Date.now() }); setOn(!on); } catch { /* storage unavailable */ }
  };
  return <button onClick={toggle} aria-pressed={on} aria-label={t('fav.toggle')}>{on ? '★' : '☆'}</button>;
}

function ReportBox({ g }: { g: Guide }) {
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [done, setDone] = useState(false);
  if (done) return <p class="muted" role="status">{t('report.done')}</p>;
  if (!open) return <button onClick={() => setOpen(true)}>{t('report.button')}</button>;
  return (
    <div class="card stack">
      <textarea rows={3} value={text} onInput={(e) => setText((e.target as HTMLTextAreaElement).value)} placeholder={t('report.placeholder')} aria-label={t('report.placeholder')} style="inline-size:100%" />
      <div class="row"><button class="btn-danger" onClick={async () => { if (text.trim()) { await addReport({ guideId: g.id, lang: getSettings().locale, text }); setDone(true); } }}>{t('common.save')}</button><button onClick={() => setOpen(false)}>{t('common.close')}</button></div>
    </div>
  );
}

function Terms({ g }: { g: Guide }) {
  const loc = getLocale(); const text = [g.summary, ...g.now, ...g.understand, ...g.mistakes].join(' . ');
  const terms = findTerms(text, loc); if (!terms.length) return null;
  return <section><h2>{t('guide.terms')}</h2><ul class="list">{terms.map((x) => <li><details><summary><b>{pick(x.term, loc)}</b></summary><p>{pick(x.def, loc)}</p></details></li>)}</ul></section>;
}
function Notes({ g }: { g: Guide }) {
  const ok = usePremium(); const [rows, setRows] = useState<Array<{ id?: number; text: string; note: string }>>([]); const [note, setNote] = useState('');
  const load = () => db.highlights.where('guide').equals(g.id).toArray().then(setRows).catch(() => {});
  useEffect(() => { if (ok) void load(); }, [g.id, ok]);
  if (!ok) return null;
  const add = async () => { const sel = String(window.getSelection?.() ?? '').trim(); if (!sel && !note.trim()) return; await db.highlights.add({ guide: g.id, text: sel, note: note.trim(), at: Date.now() }); setNote(''); void load(); };
  return (
    <section class="card stack"><h2>{t('hl.title')}</h2><p class="muted">{t('hl.help')}</p>
      <textarea rows={2} value={note} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} placeholder={t('hl.note')} aria-label={t('hl.note')} />
      <button class="btn" onClick={add}>{t('hl.add')}</button>
      <ul class="list">{rows.map((r) => <li class="row"><span style="flex:1">{r.text && <mark>{r.text}</mark>} {r.note}</span><button class="btn" aria-label={t('common.delete')} onClick={async () => { await db.highlights.delete(r.id!); void load(); }}>✕</button></li>)}</ul></section>
  );
}

export function GuideView({ id }: { id: string }) {
  useSettings();
  const [g, setG] = useState<Guide | null | undefined>(undefined);
  const [fallback, setFallback] = useState(false);
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    setG(undefined);
    getGuide(id).then((x) => {
      setG(x ?? null);
      if (x) db.history.put({ id, at: Date.now() }).catch(() => {});
    });
    loadGuides().then(({ guides, fallback: fb }) => { setFallback(fb); setTitles(Object.fromEntries(guides.map((a) => [a.id, a.title]))); });
  }, [id]);
  if (g === undefined) return <main><p>{t('app.loading')}</p></main>;
  if (g === null) return <main><p>{t('guide.notFound')}</p></main>;
  return (
    <main class="stack">
      <div class="row">
        <h1 style="flex:1">{g.title}</h1>
        <FavButton id={g.id} />
      </div>
      {fallback && <p class="danger-box">{t('lang.fallback')}</p>}
      <p>{g.summary}</p>
      <p class="muted">
        {g.vital && <span class="badge">{t('guide.vital')}</span>}{' '}
        {g.minutes > 0 && <span>{t('common.minutes', { n: g.minutes })}</span>}{' '}
        {g.difficulty && <span>· {t('guide.level', { n: g.difficulty })}</span>}
      </p>
      <ReviewSeal g={g} />
      {g.status === 'draft' && <p class="danger-box">{t('guide.draft')}</p>}
      {g.warning && <div class="danger-box" role="alert"><strong>{t('guide.warning')}: </strong>{g.warning}</div>}
      <section class="card">
        <h2>{t('guide.now')}</h2>
        {(FLAGS.voice || getSettingsDev()) && g.now.length > 0 && <div class="row"><button onClick={() => voiceReader.readSteps(g.now, getLocale())}>🔊 {t('voice.read')}</button><button onClick={() => voiceReader.stop()}>{t('whistle.stop')}</button></div>}
        {g.now.length ? <ol class="steps">{g.now.map((s) => <li>{s}</li>)}</ol> : <p class="muted">{t('guide.empty')}</p>}
      </section>
      {g.timeline && Object.keys(g.timeline).length > 0 && (
        <section><h2>{t('crisis.timeline')}</h2>
          {(['10min', '1h', '24h', '72h', '7d', '30d'] as const).filter((k) => g.timeline![k]?.length).map((k) => (
            <div class="card"><strong>{t(`stage.${k}`)}</strong><ul>{g.timeline![k]!.map((x) => <li>{x}</li>)}</ul></div>
          ))}
        </section>
      )}
      {g.understand.length > 0 && <section><h2>{t('guide.understand')}</h2><ul>{g.understand.map((s) => <li>{s}</li>)}</ul></section>}
      {g.mistakes.length > 0 && <section><h2>{t('guide.mistakes')}</h2><ul>{g.mistakes.map((s) => <li>{s}</li>)}</ul></section>}
      {g.materials.length > 0 && <section><h2>{t('guide.needs')}</h2><p>{g.materials.join(', ')}</p></section>}
      {g.related.length > 0 && (
        <section><h2>{t('guide.related')}</h2>
          <ul class="list">{g.related.map((r) => <li><a class="btn" href={href('guide', r)}>{titles[r] ?? r}</a></li>)}</ul>
        </section>
      )}
      <Terms g={g} />
      <Notes g={g} />
      <ReportBox g={g} />
      <p class="muted">{t('review.disclaimer')}</p>
    </main>
  );
}
