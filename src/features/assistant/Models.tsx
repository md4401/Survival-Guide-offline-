import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { MODELS, customModel, isValidRepo, recommendedTier, type ModelInfo } from '../../ai/models';
import { download, loadAi, precheck, remove, saveAi, Cancelled, type AiState, type Progress } from '../../ai/manager';

const mb = (n: number) => (n >= 1024 * 1048576 ? `${(n / 1073741824).toFixed(1)} GB` : `${Math.round(n / 1048576)} MB`);
const conn = () => (navigator as any).connection as { type?: string; saveData?: boolean } | undefined;

export function Models() {
  const [st, setSt] = useState<AiState | null>(null);
  const [busy, setBusy] = useState<{ id: string; p: Progress | null } | null>(null);
  const [confirm, setConfirm] = useState<{ m: ModelInfo; bytes: number; gated: boolean } | null>(null);
  const [err, setErr] = useState('');
  const [mobileOk, setMobileOk] = useState(false);
  const [repo, setRepo] = useState('');
  let cancel = false;
  useEffect(() => { loadAi().then(setSt); }, []);
  const ram = (navigator as any).deviceMemory as number | undefined;
  const rec = recommendedTier(ram);
  const metered = conn()?.type === 'cellular' || !!conn()?.saveData;

  const start = async (m: ModelInfo) => {
    setErr('');
    if (metered && !mobileOk) { setErr(t('ai.err.mobile')); return; }
    const pre = await precheck(m);
    if (!pre.ok) { setErr(t(`ai.err.${pre.reason}`)); return; }
    setConfirm({ m, bytes: pre.bytes ?? m.approxMB * 1048576, gated: !!pre.gated });
  };
  const go = async (m: ModelInfo) => {
    setConfirm(null); setBusy({ id: m.id, p: null });
    try {
      await download(m, (p) => setBusy({ id: m.id, p }), () => cancel);
      setSt(await loadAi());
    } catch (e: any) { setErr(e instanceof Cancelled ? t('ai.cancelled') : t('ai.err.failed')); }
    setBusy(null);
  };
  const del = async (m: { id: string; repo: string }) => { await remove(m); setSt(await loadAi()); };
  const use = async (id: string) => { if (!st) return; const n = { ...st, active: id }; await saveAi(n); setSt(n); };
  const all = [...MODELS, ...Object.entries(st?.installed ?? {}).filter(([id]) => id.startsWith('custom:')).map(([, v]) => customModel(v.repo))];

  return (
    <main class="stack">
      <h1>{t('ai.models.title')}</h1>
      <p>{t('ai.models.intro')}</p>
      <p class="danger-box">{t('ai.privacy')}</p>
      <p class="muted">{ram ? t('ai.ram', { n: ram }) : t('ai.ram.unknown')} · {t('ai.recommended')}: {t(`tier.${rec}`)}</p>
      {metered && <label class="row"><input type="checkbox" checked={mobileOk} onChange={(e) => setMobileOk((e.target as HTMLInputElement).checked)} /><span>{t('ai.mobile')}</span></label>}
      {err && <p class="danger-box" role="alert">{err}</p>}
      {confirm && (
        <div class="card stack" role="alertdialog">
          <strong>{t('ai.confirm', { name: confirm.m.label, size: mb(confirm.bytes) })}</strong>
          {confirm.gated && <p class="muted">{t('ai.gated')}</p>}
          <div class="row"><button class="btn-danger" onClick={() => go(confirm.m)}>{t('ai.download')}</button><button onClick={() => setConfirm(null)}>{t('common.close')}</button></div>
        </div>
      )}
      {all.map((m) => {
        const inst = st?.installed[m.id]; const active = st?.active === m.id; const b = busy?.id === m.id ? busy : null;
        return (
          <section class="card stack" key={m.id}>
            <div class="row"><strong style="flex:1">{m.label}</strong>
              {m.tier === rec && <span class="badge badge-warn">{t('ai.recommended')}</span>}{active && <span class="badge">{t('ai.active')}</span>}</div>
            <div class="muted">{t(`tier.${m.tier}`)}{m.approxMB ? ` · ≈ ${mb(m.approxMB * 1048576)}` : ''}{m.minRamGB ? ` · ${t('ai.minram', { n: m.minRamGB })}` : ''}</div>
            {b && <div><progress max={b.p?.total || 1} value={b.p?.loaded || 0} style="inline-size:100%" aria-label={t('ai.downloading')} /><div class="muted">{b.p ? `${mb(b.p.loaded)} / ${mb(b.p.total)}` : t('app.loading')}</div>
              <button onClick={() => { cancel = true; }}>{t('ai.cancel')}</button></div>}
            {!b && (inst ? (
              <div class="row">{!active && <button onClick={() => use(m.id)}>{t('ai.use')}</button>}<button onClick={() => del(m)}>{t('ai.delete')}</button></div>
            ) : <button disabled={!!busy} onClick={() => start(m)}>{t('ai.download')}</button>)}
          </section>
        );
      })}
      <section class="card stack">
        <h2>{t('ai.custom')}</h2>
        <p class="muted">{t('ai.custom.hint')}</p>
        <input value={repo} onInput={(e) => setRepo((e.target as HTMLInputElement).value)} placeholder="owner/model-name" aria-label={t('ai.custom')} />
        <button disabled={!isValidRepo(repo) || !!busy} onClick={() => start(customModel(repo.trim()))}>{t('ai.download')}</button>
      </section>
      <a class="btn btn-block" href={href('assistant')}>{t('ai.title')}</a>
      <p class="muted">{t('ai.note')}</p>
    </main>
  );
}
