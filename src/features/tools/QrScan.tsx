import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { href } from '../../router';
import { QrScanner } from '../../components/Qr';

export type Kind = 'url' | 'bundle' | 'family' | 'text';
export const classify = (s: string): Kind => (/^https?:\/\//i.test(s) ? 'url' : s.startsWith('SGMB') ? 'bundle' : s.startsWith('SGMC') ? 'family' : 'text');
async function decodeFile(f: File): Promise<string | null> {
  const bmp = await createImageBitmap(f); const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; const ctx = c.getContext('2d')!; ctx.drawImage(bmp, 0, 0);
  const jsQR = (await import('jsqr')).default; const d = ctx.getImageData(0, 0, c.width, c.height); return jsQR(d.data, d.width, d.height)?.data ?? null;
}
export function QrScan() {
  const [text, setText] = useState(''); const [cam, setCam] = useState(false); const [msg, setMsg] = useState('');
  const kind = text ? classify(text) : null;
  return (
    <main class="stack"><h1>{t('qrscan.title')}</h1><p class="muted">{t('qrscan.privacy')}</p>
      {cam ? <><QrScanner onText={(s) => { setText(s); setCam(false); }} onError={() => { setCam(false); setMsg(`${t('media.cam.denied')} ${t('media.settings')}`); }} /><button class="btn" onClick={() => setCam(false)}>{t('common.close')}</button></> : <button class="btn-block help-btn" onClick={() => { setMsg(''); setCam(true); }}>📷 {t('qrscan.start')}</button>}
      <label class="btn">🖼 {t('qrscan.image')}<input type="file" accept="image/*" hidden onChange={async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; try { const r = await decodeFile(f); if (r) { setText(r); setMsg(''); } else setMsg(t('qrscan.none')); } catch { setMsg(t('qrscan.none')); } }} /></label>
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      {text && <section class="card stack"><h2>{t('qrscan.result')}</h2><p dir="auto" style="word-break:break-all;white-space:pre-wrap">{text}</p>
        {kind === 'url' && <><p class="muted">{t('qrscan.url.warn')}</p><a class="btn" href={text} target="_blank" rel="noopener noreferrer">{t('qrscan.open')}</a></>}
        {kind === 'bundle' && <a class="btn primary" href={href('messages', 'sync')}>{t('qrscan.bundle')}</a>}
        {kind === 'family' && <a class="btn primary" href={href('prepare', 'family')}>{t('qrscan.family')}</a>}
        <button class="btn" onClick={() => { void navigator.clipboard?.writeText(text); }}>{t('qrscan.copy')}</button></section>}</main>
  );
}
