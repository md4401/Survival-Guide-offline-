import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { getSettings } from '../../db/settings';

function beep() {
  if (getSettings().silent) return;
  try {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext; const c = new AC();
    const o = c.createOscillator(); o.frequency.value = 880; o.connect(c.destination); o.start(); setTimeout(() => { o.stop(); c.close(); }, 800);
  } catch { /* no audio */ }
  navigator.vibrate?.([300, 100, 300]);
}
const fmtMs = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export function Timer() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const [sw, setSw] = useState<{ start: number | null; acc: number }>({ start: null, acc: 0 });
  const [, tick] = useState(0);
  const fired = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      tick((n) => n + 1);
      if (endAt) { const l = endAt - Date.now(); setLeft(l); if (l <= 0 && !fired.current) { fired.current = true; setDone(true); setEndAt(null); beep(); } }
    }, 250);
    return () => clearInterval(id);
  }, [endAt]);
  const start = (min: number) => { fired.current = false; setDone(false); setEndAt(Date.now() + min * 60000); setLeft(min * 60000); };
  const swMs = sw.acc + (sw.start ? Date.now() - sw.start : 0);
  return (
    <main class="stack">
      <h1>{t('timer.title')}</h1>
      <div class="card"><div class="big-num" aria-live="off">{fmtMs(endAt ? left : 0)}</div>{done && <p role="alert" class="danger-box">{t('timer.done')}</p>}</div>
      <div class="row">{[1, 3, 5, 10, 30].map((m) => <button onClick={() => start(m)}>{t('common.minutes', { n: m })}</button>)}
        <button onClick={() => { setEndAt(null); setDone(false); }}>{t('timer.stop')}</button></div>
      <h2>{t('timer.stopwatch')}</h2>
      <div class="card"><div class="big-num">{fmtMs(swMs)}</div></div>
      <div class="row">
        <button onClick={() => setSw(sw.start ? { start: null, acc: swMs } : { start: Date.now(), acc: sw.acc })}>{sw.start ? t('timer.stop') : t('timer.start')}</button>
        <button onClick={() => setSw({ start: null, acc: 0 })}>{t('clock.reset')}</button>
      </div>
    </main>
  );
}
