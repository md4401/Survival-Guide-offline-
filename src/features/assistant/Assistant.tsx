import { useEffect, useMemo, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { getSettings, useSettings } from '../../db/settings';
import { getKV } from '../../db/dexie';
import { loadGuides, getGuide } from '../../content/loader';
import { buildIndex } from '../../search';
import { ask, type Result } from '../../ai/rag';
import { generate, loadAi, saveAi, type AiState } from '../../ai/manager';
import { MODELS, customModel } from '../../ai/models';
import type { Guide } from '../../content/types';

export function Assistant() {
  const s = useSettings();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [st, setSt] = useState<AiState | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [vital, setVital] = useState<Guide | null | undefined>();
  useEffect(() => { loadGuides().then((r) => setGuides(r.guides)); loadAi().then(setSt); getKV('crisis', null).then((c) => setCrisis(!!c)); }, [s.locale, s.dev]);
  const index = useMemo(() => buildIndex(guides.filter((g) => g.status === 'published')), [guides]);

  const model = st?.active ? (MODELS.find((m) => m.id === st.active) ?? (st.installed[st.active] ? customModel(st.installed[st.active].repo) : null)) : null;
  const aiOff = crisis && !st?.enabledInCrisis; // spec: AI off by default in Crisis Mode
  const send = async () => {
    if (!q.trim() || busy) return;
    setBusy(true); setRes(null); setStream(''); setVital(undefined);
    const r = await ask(q, {
      index, guides, locale: getSettings().locale,
      generate: model && !aiOff ? (m, tok) => generate(model, m, (x) => { setStream((a) => a + x); tok(x); }) : null,
      noThink: !!(model as any)?.qwen3,
    });
    setRes(r); setStream('');
    if (r.kind === 'vital') setVital((await getGuide(r.guideId)) ?? null);
    setBusy(false);
  };
  const cards = (ids: Array<{ id: string; title: string }>) => <ul class="list">{ids.map((e) => <li><a class="btn" href={href('guide', e.id)}>{e.title}</a></li>)}</ul>;
  const reason = (r: 'no-model' | 'rejected' | 'error') => t(r === 'no-model' ? 'ai.noModel' : r === 'rejected' ? 'ai.rejected' : 'ai.error');

  return (
    <main class="stack">
      <h1>{t('ai.title')}</h1>
      <p class="muted">{model ? t('ai.using', { name: model.label }) : t('ai.noModel')}</p>
      {aiOff && st && <div class="card row"><span style="flex:1">{t('ai.crisisOff')}</span><button onClick={async () => { const n = { ...st, enabledInCrisis: true }; await saveAi(n); setSt(n); }}>{t('ai.crisisOn')}</button></div>}
      <div class="row"><input style="flex:1" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t('ai.ask.ph')} aria-label={t('ai.ask.ph')} />
        <button class="btn-danger" disabled={busy} onClick={send}>{busy ? t('app.loading') : t('ai.ask')}</button></div>
      {stream && <p class="card" style="white-space:pre-wrap">{stream}</p>}
      {res?.kind === 'vital' && (
        <section class="card stack">
          {vital ? <><h2>{vital.title}</h2><p class="muted">{t('ai.vital')}</p><ol class="steps">{vital.now.map((x) => <li>{x}</li>)}</ol><a class="btn" href={href('guide', vital.id)}>{t('ai.openguide')}</a></> :
            vital === null ? <p class="danger-box">{t('triage.underReview')} {t('triage.underReviewHelp')}</p> : <p>{t('app.loading')}</p>}
          <a class="btn btn-danger" href={href('emergency')}>{t('nav.emergency')}</a>
        </section>
      )}
      {res?.kind === 'blocked' && <section class="card stack"><p class="danger-box">{t(`ai.blocked.${res.topic}`)}</p><a class="btn" href={href('guides')}>{t('list.guides')}</a><a class="btn" href={href('emergency')}>{t('nav.emergency')}</a></section>}
      {res?.kind === 'noresult' && <section class="card stack"><p>{t('ai.noresult')}</p><a class="btn" href={href('search')}>{t('common.search')}</a></section>}
      {res?.kind === 'guides' && <section class="card stack"><p class="muted">{reason(res.reason)}</p>{cards(res.excerpts)}</section>}
      {res?.kind === 'answer' && <section class="card stack"><p style="white-space:pre-wrap">{res.text}</p><h2>{t('guide.related')}</h2>{cards(res.excerpts)}<p class="danger-box">{t('ai.notice')}</p></section>}
      <a class="btn btn-block" href={href('assistant', 'models')}>{t('ai.models.title')}</a>
    </main>
  );
}
