import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { mediaMessage } from '../../lib/media';
import { db, type Recording } from '../../db/dexie';

function Player({ r, onChange }: { r: Recording; onChange: () => void }) {
  const url = useMemo(() => URL.createObjectURL(r.blob), [r.id]); useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const ext = r.mime.includes('ogg') ? 'ogg' : r.mime.includes('mp4') ? 'm4a' : 'webm';
  return (
    <li class="card stack"><input value={r.name} aria-label={t('rec.name')} onChange={async (e) => { await db.recordings.update(r.id!, { name: (e.target as HTMLInputElement).value }); onChange(); }} />
      <span class="muted">{new Date(r.at).toLocaleString()} · {Math.round(r.ms / 1000)} s · {(r.blob.size / 1024).toFixed(0)} KB</span>
      <audio controls src={url} style="inline-size:100%" />
      <div class="row"><a class="btn" href={url} download={`${r.name || 'recording'}.${ext}`}>{t('rec.download')}</a><button class="btn" onClick={async () => { await db.recordings.delete(r.id!); onChange(); }}>{t('common.delete')}</button></div></li>
  );
}
export function Recorder() {
  const [rows, setRows] = useState<Recording[]>([]); const [on, setOn] = useState(false); const [sec, setSec] = useState(0); const [msg, setMsg] = useState('');
  const mr = useRef<MediaRecorder | null>(null); const timer = useRef<any>(null);
  const load = () => db.recordings.orderBy('at').reverse().toArray().then(setRows).catch(() => {});
  useEffect(() => { void load(); return () => { clearInterval(timer.current); if (mr.current?.state === 'recording') mr.current.stop(); }; }, []);
  const start = async () => {
    setMsg('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setMsg(t('rec.unsupported')); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const rec = new MediaRecorder(stream); const chunks: Blob[] = []; const t0 = Date.now();
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => { stream.getTracks().forEach((x) => x.stop()); clearInterval(timer.current); setOn(false); const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' }); if (blob.size) { await db.recordings.add({ name: new Date().toLocaleString(), at: t0, ms: Date.now() - t0, mime: blob.type, blob }); await load(); } };
      rec.start(); mr.current = rec; setOn(true); setSec(0); timer.current = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 500);
    } catch (e) { setMsg(mediaMessage(e, 'mic')); }
  };
  return (
    <main class="stack"><h1>{t('rec.title')}</h1><p class="muted">{t('rec.privacy')}</p>
      {on ? <button class="btn-block btn-danger help-btn" onClick={() => mr.current?.stop()}>⏹ {t('rec.stop')} · {sec} s</button> : <button class="btn-block help-btn" onClick={start}>🎙 {t('rec.start')}</button>}
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      {rows.length === 0 ? <p class="muted">{t('rec.none')}</p> : <ul class="list">{rows.map((r) => <Player r={r} onChange={load} />)}</ul>}</main>
  );
}
