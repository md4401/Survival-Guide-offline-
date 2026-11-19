import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { exportBackup, importBackup, BackupError } from '../../lib/backup';
import { listReports, removeReport, reportsText, type Report } from '../../lib/reports';
import { loadSettings, updateSettings } from '../../db/settings';

export function Data() {
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => { listReports().then(setReports); }, []);
  const doExport = async () => {
    if (pass.length < 4) { setMsg(t('backup.short')); return; }
    const blob = new Blob([await exportBackup(pass)], { type: 'application/octet-stream' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `survival-backup-${new Date().toISOString().slice(0, 10)}.enc.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000); setMsg(t('backup.exported'));
  };
  const doImport = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    try { await importBackup(await f.text(), pass); await loadSettings(); updateSettings({}); setReports(await listReports()); setMsg(t('backup.imported')); }
    catch (x) { setMsg(t(x instanceof BackupError && x.code === 'bad-password' ? 'backup.badpass' : 'backup.corrupt')); }
    (e.target as HTMLInputElement).value = '';
  };
  const copy = async () => { try { await navigator.clipboard.writeText(reportsText(reports)); setMsg(t('gps.copied')); } catch { /* ignore */ } };
  return (
    <>
      <section class="card stack">
        <h2>{t('backup.title')}</h2>
        <p class="muted">{t('backup.hint')}</p>
        <input type="password" value={pass} onInput={(e) => setPass((e.target as HTMLInputElement).value)} placeholder={t('backup.pass')} aria-label={t('backup.pass')} autocomplete="off" />
        <div class="row">
          <button onClick={doExport}>{t('backup.export')}</button>
          <label class="btn">{t('backup.import')}<input type="file" accept=".json,application/json" onChange={doImport} class="sr-only" /></label>
        </div>
        {msg && <p role="status">{msg}</p>}
      </section>
      <section class="card stack">
        <h2>{t('report.saved', { n: reports.length })}</h2>
        <p class="muted">{t('report.hint')}</p>
        {reports.map((r) => <div class="row"><span style="flex:1">{r.guideId}: {r.text}</span><button onClick={async () => { await removeReport(r.id); setReports(await listReports()); }} aria-label={t('common.delete')}>🗑</button></div>)}
        {reports.length > 0 && <button onClick={copy}>{t('gps.copy')}</button>}
      </section>
    </>
  );
}
