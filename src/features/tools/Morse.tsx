import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { morseTimeline, toMorse } from '../../lib/morse';
import { PHONETIC, spell } from '../../data/phonetic';

export function Morse() {
  const [text, setText] = useState('SOS');
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(false);
  const [flash, setFlash] = useState(false);
  const timer = useRef(0); const ctx = useRef<AudioContext | null>(null); const osc = useRef<OscillatorNode | null>(null);
  const morse = toMorse(text);

  const stop = () => {
    clearTimeout(timer.current); setPlaying(false); setLit(false);
    try { osc.current?.stop(); } catch { /* already stopped */ }
    ctx.current?.close().catch(() => {}); ctx.current = null; osc.current = null;
  };
  useEffect(() => stop, []);

  const play = (withFlash: boolean) => {
    stop(); if (!morse) return;
    const tl = morseTimeline(morse); const unit = 90;
    let g: GainNode | null = null;
    try {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext; const c: AudioContext = new AC(); ctx.current = c;
      const o = c.createOscillator(); o.frequency.value = 650; g = c.createGain(); g.gain.value = 0; o.connect(g).connect(c.destination); o.start(); osc.current = o;
    } catch { /* silent mode: flash only */ }
    setFlash(withFlash); setPlaying(true);
    let i = 0;
    const step = () => {
      if (i >= tl.length) { stop(); return; }
      const [on, n] = tl[i++]; setLit(on); g?.gain.setValueAtTime(on ? 0.4 : 0, ctx.current?.currentTime ?? 0);
      timer.current = window.setTimeout(step, n * unit);
    };
    step();
  };
  return (
    <main class="stack">
      <h1>{t('morse.title')}</h1>
      <textarea rows={2} value={text} onInput={(e) => { stop(); setText((e.target as HTMLTextAreaElement).value); }} aria-label={t('morse.input')} placeholder={t('morse.input')} style="inline-size:100%" />
      <div class="card"><div class="big-num" style="word-break:break-word" dir="ltr">{morse || '—'}</div></div>
      <div class="row">
        <button onClick={() => play(false)} disabled={!morse}>🔊 {t('morse.sound')}</button>
        <button onClick={() => play(true)} disabled={!morse}>💡 {t('morse.flash')}</button>
        {playing && <button onClick={stop}>{t('whistle.stop')}</button>}
      </div>
      {flash && playing && <div class="light-overlay" style={{ background: lit ? '#fff' : '#000' }} onClick={stop} role="button" aria-label={t('whistle.stop')}><button>{t('whistle.stop')}</button></div>}
      <section class="card stack">
        <h2>{t('morse.spelled')}</h2>
        <p dir="ltr">{spell(text).join(' ') || '—'}</p>
      </section>
      <section class="card">
        <h2>{t('morse.phonetic')}</h2>
        <div class="grid2" dir="ltr">{Object.entries(PHONETIC).map(([k, v]) => <div><strong>{k}</strong> {v}</div>)}</div>
      </section>
    </main>
  );
}
