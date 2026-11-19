import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { getKV, setKV } from '../../db/dexie';
import { useSettings } from '../../db/settings';
import { FLAGS } from '../../flags';
import { loadGuides } from '../../content/loader';
import { licenseService, licenseStatus, PUBLIC_KEY_HEX, type License } from '../../interfaces/license';
import { packUpdater, type PackInfo } from '../../interfaces/packUpdate';
import { listReports } from '../../lib/reports';
import { reviewStats } from '../../lib/review';
import { loadForecast, refreshForecast, codeKey, ageHours, type Forecast } from '../../lib/forecast';

function LicenseCard() {
  const [lic, setLic] = useState<License | null>(null); const [tok, setTok] = useState(''); const [msg, setMsg] = useState('');
  useEffect(() => { licenseService.current().then(setLic).catch(() => {}); }, []);
  const st = lic ? licenseStatus(lic, Date.now() / 1000) : null;
  return (
    <section class="card stack"><h2>{t('sys.license')}</h2>
      {lic ? <p>{t(`sys.lic.${st}`)} · {new Date(lic.expires * 1000).toLocaleDateString()}</p> : <p class="muted">{t('sys.lic.none')}</p>}
      {!PUBLIC_KEY_HEX && <p class="muted">{t('sys.lic.notconfigured')}</p>}
      <textarea rows={3} value={tok} onInput={(e) => setTok((e.target as HTMLTextAreaElement).value)} placeholder={t('sys.lic.paste')} aria-label={t('sys.lic.paste')} />
      <button class="btn" onClick={async () => { const l = await licenseService.activate(tok.trim()); setLic(l ?? lic); setMsg(l ? t('sys.lic.ok') : t('sys.lic.bad')); }}>{t('sys.lic.activate')}</button>
      {msg && <p role="status">{msg}</p>}<p class="muted">{t('sys.lic.offline')}</p></section>
  );
}
function PacksCard() {
  const [ps, setPs] = useState<PackInfo[]>([]); const [msg, setMsg] = useState('');
  const load = () => packUpdater.list().then(setPs).catch(() => {});
  useEffect(() => { void load(); }, []);
  return (
    <section class="card stack"><h2>{t('sys.packs')}</h2><p class="muted">{t('sys.packs.core')}</p>
      {ps.length ? <ul class="list">{ps.map((p) => <li class="row"><span style="flex:1">{p.id} · v{p.version} · {(p.bytes / 1048576).toFixed(1)} MB<br /><span class="muted">sha256 {p.sha256.slice(0, 12)}…</span></span><button class="btn" onClick={async () => { await packUpdater.remove(p.id); void load(); }}>{t('common.delete')}</button></li>)}</ul> : <p class="muted">{t('sys.packs.none')}</p>}
      <button class="btn" disabled={!FLAGS.packUpdates} onClick={async () => { const u = await packUpdater.checkForUpdates(); setMsg(u.length ? t('sys.packs.found', { n: u.length }) : t('sys.packs.uptodate')); }}>{t('sys.packs.check')}</button>
      {!FLAGS.packUpdates && <p class="muted">{t('sys.packs.off')}</p>}{msg && <p role="status">{msg}</p>}</section>
  );
}
function ReviewCard() {
  const [s, setS] = useState<ReturnType<typeof reviewStats> | null>(null); const [rep, setRep] = useState(0);
  useEffect(() => { loadGuides().then((r) => setS(reviewStats(r.guides))).catch(() => {}); listReports().then((r) => setRep(r.length)).catch(() => {}); }, []);
  if (!s) return null;
  const row = (o: Record<string, number>) => Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(' · ');
  return (
    <section class="card stack"><h2>{t('sys.review')}</h2>
      <p>{t('sys.review.total', { n: s.total, r: s.needsReview })}</p><p class="muted">{row(s.byStatus)}</p><p class="muted">{row(s.byLevel)}</p><p class="muted">{row(s.byKind)}</p>
      {s.vitalNotReviewed > 0 && <p class="danger-box">{t('sys.review.vital', { n: s.vitalNotReviewed })}</p>}<p>{t('sys.review.reports', { n: rep })}</p></section>
  );
}
function ForecastCard() {
  const s = useSettings(); const [consent, setConsent] = useState(false); const [f, setF] = useState<Forecast | null>(null); const [msg, setMsg] = useState('');
  useEffect(() => { getKV('forecastConsent', false).then((v) => setConsent(!!v)); loadForecast().then(setF).catch(() => {}); }, []);
  const refresh = async () => { if (!s.loc) { setMsg(t('sys.fc.noloc')); return; } const crisis = !!(await getKV('crisis', null)); const r = await refreshForecast({ lat: s.loc.lat, lon: s.loc.lon, consent, online: navigator.onLine, crisis }); if (r) { setF(r); setMsg(''); } else setMsg(t('sys.fc.fail')); };
  return (
    <section class="card stack"><h2>{t('sys.fc')}</h2><p class="muted">{t('sys.fc.privacy')}</p>
      <label class="row"><input type="checkbox" checked={consent} onChange={(e) => { const v = (e.target as HTMLInputElement).checked; setConsent(v); void setKV('forecastConsent', v); }} /><span>{t('sys.fc.consent')}</span></label>
      <button class="btn" disabled={!consent} onClick={refresh}>{t('sys.fc.update')}</button>{msg && <p role="status">{msg}</p>}
      {f ? <><p class="muted">{t('sys.fc.age', { h: ageHours(f) })}</p><ul class="list">{f.days.map((d) => <li class="row"><span style="flex:1">{d.date}</span><span>{Math.round(d.min)}–{Math.round(d.max)} °C · {d.rain} mm · {t(`wmo.${codeKey(d.code)}`)}</span></li>)}</ul></> : <p class="muted">{t('sys.fc.none')}</p>}</section>
  );
}
export function System() {
  const s = useSettings();
  return (<main class="stack"><h1>{t('sys.title')}</h1><LicenseCard /><PacksCard /><ForecastCard />{s.dev && <ReviewCard />}<a class="btn" href={href('plans')}>{t('plans.title')}</a></main>);
}
