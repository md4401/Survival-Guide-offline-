import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';

export function Whistle() {
  const [on, setOn] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const timer = useRef<number>(0);
  const gain = useRef<GainNode | null>(null);

  const stop = () => { clearTimeout(timer.current); gain.current?.gain.setValueAtTime(0, ctx.current?.currentTime ?? 0); ctx.current?.close().catch(() => {}); ctx.current = null; };
  useEffect(() => stop, []);

  const start = () => {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    const c: AudioContext = new AC(); ctx.current = c;
    const osc = c.createOscillator(); osc.type = 'square'; osc.frequency.value = 3000;
    const g = c.createGain(); g.gain.value = 0; osc.connect(g).connect(c.destination); osc.start(); gain.current = g;
    // Three blasts (0.6 s, 0.3 s gaps), then 2.5 s pause; repeat.
    let n = 0;
    const tick = () => {
      const blast = n % 6 < 5 && n % 2 === 0;
      g.gain.setValueAtTime(blast ? 1 : 0, c.currentTime);
      const dur = n % 6 === 5 ? 2500 : n % 2 === 0 ? 600 : 300;
      n++; timer.current = window.setTimeout(tick, dur);
    };
    tick(); setOn(true);
  };
  return (
    <main class="stack">
      <h1>{t('whistle.title')}</h1>
      <p>{t('whistle.hint')}</p>
      <button class={`btn-block help-btn ${on ? '' : 'btn-danger'}`} onClick={() => { if (on) { stop(); setOn(false); } else start(); }}>
        {on ? t('whistle.stop') : t('whistle.start')}
      </button>
    </main>
  );
}
