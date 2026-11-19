import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { morseTimeline, SOS } from '../../lib/morse';

type Mode = 'off' | 'steady' | 'strobe' | 'sos';
let track: MediaStreamTrack | null = null;

async function acquireTorch(): Promise<boolean> {
  if (track) return true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const tr = stream.getVideoTracks()[0];
    const caps = (tr.getCapabilities?.() ?? {}) as Record<string, unknown>;
    if (caps.torch) { track = tr; return true; }
    tr.stop();
  } catch { /* no camera / denied */ }
  return false;
}
function releaseTorch() { track?.stop(); track = null; }

export function Torch() {
  const [mode, setMode] = useState<Mode>('off');
  const [lit, setLit] = useState(false);
  const [hasTorch, setHasTorch] = useState(true);
  const [brightness, setBrightness] = useState(1);
  const [battery, setBattery] = useState<number | null>(null);
  const timer = useRef<number>(0);

  const light = (on: boolean) => {
    setLit(on);
    if (track) track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] }).catch(() => {});
  };

  useEffect(() => {
    (navigator as any).getBattery?.().then((b: any) => setBattery(Math.round(b.level * 100))).catch(() => {});
    return () => { clearTimeout(timer.current); releaseTorch(); };
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    let wake: any;
    if (mode === 'off') { light(false); releaseTorch(); return; }
    (async () => {
      setHasTorch(await acquireTorch());
      try { wake = await (navigator as any).wakeLock?.request('screen'); } catch { /* optional */ }
      if (mode === 'steady') light(true);
      if (mode === 'strobe') { let on = false; const tick = () => { on = !on; light(on); timer.current = window.setTimeout(tick, 200); }; tick(); }
      if (mode === 'sos') {
        const unit = 220; const tl = morseTimeline(SOS);
        let i = 0;
        const step = () => {
          if (i >= tl.length) { light(false); i = 0; timer.current = window.setTimeout(step, 7 * unit); return; }
          const [on, n] = tl[i++]; light(on); timer.current = window.setTimeout(step, n * unit);
        };
        step();
      }
    })();
    return () => { clearTimeout(timer.current); wake?.release?.().catch?.(() => {}); };
  }, [mode]);

  const btn = (m: Mode, key: string) => (
    <button class={`tool ${mode === m ? 'pill-on' : ''}`} aria-pressed={mode === m} onClick={() => setMode(m)}>{t(key)}</button>
  );
  return (
    <main class="stack">
      <h1>{t('torch.title')}</h1>
      <div class="grid2">{btn('steady', 'torch.steady')}{btn('strobe', 'torch.strobe')}{btn('sos', 'torch.sos')}</div>
      <button class="btn-block" onClick={() => setMode('off')}>{t('torch.off')}</button>
      {!hasTorch && mode !== 'off' && <p class="muted">{t('torch.screenMode')}</p>}
      {!hasTorch && (
        <label class="row"><span>{t('torch.brightness')}</span>
          <input type="range" min="0.2" max="1" step="0.1" value={brightness} onInput={(e) => setBrightness(Number((e.target as HTMLInputElement).value))} />
        </label>
      )}
      {battery !== null && <p class="muted">{t('torch.battery', { pct: battery })} {battery <= 15 ? t('torch.low') : ''}</p>}
      {mode !== 'off' && !hasTorch && (
        <div class="light-overlay" style={{ background: lit ? `rgba(255,255,255,${brightness})` : '#000' }} onClick={() => setMode('off')} role="button" aria-label={t('torch.off')}>
          <button>{t('torch.off')}</button>
        </div>
      )}
    </main>
  );
}
