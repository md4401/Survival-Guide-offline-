import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { rms, toDb, Stats, needleAngle, soundLevel, levelColor, Series, SOUND_LEVELS } from '../../lib/audioLevel';
import { getKV, setKV } from '../../db/dexie';
import { mediaMessage } from '../../lib/media';
import { Graph } from '../../components/Graph';

const CY = 40; const pt = (deg: number, r: number): [number, number] => [r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)];
const arc = (a1: number, a2: number, r: number) => { const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r); return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`; };
function Dial({ db, min, max }: { db: number; min: number; max: number }) {
  const ticks: number[] = []; for (let v = 20; v <= 120; v += 2) ticks.push(v);
  return (
    <svg viewBox="-125 -75 250 125" role="img" aria-label={`${db.toFixed(0)} dB`} dir="ltr" style="inline-size:100%">
      <path d={arc(needleAngle(20), needleAngle(90), 100)} fill="none" stroke="currentColor" stroke-width="2" /><path d={arc(needleAngle(90), needleAngle(120), 100)} fill="none" stroke="#e5503f" stroke-width="2" />
      {ticks.map((v) => { const major = v % 10 === 0; const a = needleAngle(v); const [x1, y1] = pt(a, 100), [x2, y2] = pt(a, major ? 86 : 93), [lx, ly] = pt(a, 114); const c = v >= 90 ? '#e5503f' : 'currentColor';
        return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} stroke-width={major ? 2 : 1} />{major && <text x={lx} y={ly + 3} text-anchor="middle" font-size="9" font-weight="700" fill={c} transform={`rotate(${a} ${lx} ${ly})`}>{v}</text>}</g>; })}
      {Number.isFinite(min) && max >= min && <path d={arc(needleAngle(min), needleAngle(max), 66)} fill="none" stroke="#9a9a9a" stroke-width="2" />}
      {Number.isFinite(min) && <text x="-52" y="28" font-size="7" fill="#aaa" text-anchor="middle">MIN {min.toFixed(1)}</text>}
      {max > 0 && <text x="52" y="28" font-size="7" fill="#aaa" text-anchor="middle">{t('spl.peak')} {max.toFixed(1)}</text>}
      <g transform={`rotate(${needleAngle(db)} 0 ${CY})`}><line x1="0" y1={CY} x2="0" y2={CY - 92} stroke="#e5503f" stroke-width="3" stroke-linecap="round" /></g>
      <circle cx="0" cy={CY} r="4" fill="#e5503f" />
    </svg>
  );
}
export function Decibel() {
  const [on, setOn] = useState(false); const [paused, setPaused] = useState(false); const [db, setDb] = useState(0); const [off, setOff] = useState(90); const [msg, setMsg] = useState(''); const [, force] = useState(0); const [secs, setSecs] = useState(0);
  const stats = useRef(new Stats()); const peak = useRef(0); const series = useRef(new Series(30000)); const stop = useRef<() => void>(() => {}); const offRef = useRef(90); const pausedRef = useRef(false); const t0 = useRef(0);
  useEffect(() => { getKV<number>('splOffset', 90).then((v) => { setOff(v); offRef.current = v; }); return () => stop.current(); }, []);
  const start = async () => {
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const Ctx = (window as any).AudioContext ?? (window as any).webkitAudioContext; const ctx = new Ctx(); const src = ctx.createMediaStreamSource(stream); const an = ctx.createAnalyser(); an.fftSize = 2048; src.connect(an);
      const buf = new Float32Array(an.fftSize); stats.current.reset(); peak.current = 0; series.current.reset(); t0.current = Date.now(); pausedRef.current = false; setPaused(false);
      const id = setInterval(() => { if (pausedRef.current) return; an.getFloatTimeDomainData(buf); const v = toDb(rms(buf), offRef.current); stats.current.add(v); peak.current = Math.max(peak.current, v); series.current.add(Date.now(), v); setDb(v); setSecs(Math.floor((Date.now() - t0.current) / 1000)); force((n) => n + 1); }, 100);
      stop.current = () => { clearInterval(id); stream.getTracks().forEach((x) => x.stop()); void ctx.close(); setOn(false); }; setOn(true);
    } catch (e) { setMsg(mediaMessage(e, 'mic')); }
  };
  const s = stats.current; const lvl = soundLevel(db); const mm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  return (
    <main class="stack"><h1>{t('spl.title')}</h1><p class="danger-box">{t('spl.warn')}</p>
      {msg && <p class="danger-box" role="alert">{msg}</p>}
      <Dial db={db} min={s.n ? s.min : NaN} max={peak.current} />
      <div class="row" dir="ltr" style="justify-content:space-between;align-items:flex-end"><div style="text-align:center"><div class="muted">{t('spl.avg')}</div><b>{s.n ? s.avg.toFixed(1) : '–'}</b></div><div style="text-align:center"><span class="big-num" style="font-size:3.6rem;line-height:1">{db.toFixed(1)}</span> <span>dB</span></div><div style="text-align:center"><div class="muted">MAX</div><b>{s.n ? s.max.toFixed(1) : '–'}</b></div></div>
      {on && <p class="card" style="text-align:center"><span aria-hidden="true" style={`color:${levelColor(db)}`}>●</span> {lvl} dB: {t(`spl.ex.${lvl}`)}</p>}
      <div dir="ltr" style="display:flex;block-size:8px;border-radius:4px;overflow:hidden" aria-hidden="true">{SOUND_LEVELS.map((l) => <span style={`flex:1;background:${levelColor(l)};opacity:${on && l === lvl ? 1 : 0.55}`} />)}</div>
      <Graph pts={series.current.pts} now={Date.now()} yMin={10} yMax={110} step={20} color="#e5503f" label={t('spl.title')} unit="dB" />
      <div class="row" style="justify-content:center;gap:1rem">
        <span dir="ltr" class="muted">● {mm(secs)}</span>
        {on ? <><button class="btn" aria-label={paused ? t('spl.resume') : t('spl.pause')} onClick={() => { pausedRef.current = !paused; setPaused(!paused); }}>{paused ? '▶' : '⏸'}</button><button class="btn" aria-label={t('spl.reset')} onClick={() => { stats.current.reset(); peak.current = 0; series.current.reset(); t0.current = Date.now(); force((n) => n + 1); }}>↺</button><button class="btn btn-danger" onClick={() => stop.current()}>⏹ {t('rec.stop')}</button></>
          : <button class="btn-block help-btn" onClick={start}>🔊 {t('spl.start')}</button>}
      </div>
      <details class="card"><summary>{t('spl.adjust')}</summary>
        <label class="row"><span style="flex:1">{t('spl.offset')}</span><input type="number" value={off} style="width:6rem" onInput={(e) => { const v = Number((e.target as HTMLInputElement).value) || 0; setOff(v); offRef.current = v; void setKV('splOffset', v); }} /></label><p class="muted">{t('spl.help')}</p></details></main>
  );
}
