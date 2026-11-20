import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from '../i18n';

type Stroke = { c: string; w: number; a: number; erase: boolean; pts: Array<[number, number]> };
const COLORS = ['#111111', '#e5503f', '#2f7be0', '#2fa84f', '#e8a13a', '#edff00'];
const TOOLS = [{ id: 'pen', w: 3, a: 1, erase: false }, { id: 'marker', w: 14, a: 0.4, erase: false }, { id: 'brush', w: 7, a: 0.85, erase: false }, { id: 'eraser', w: 22, a: 1, erase: true }] as const;
/** Finger or stylus drawing board with undo/redo. Returns a PNG data URL through onDone. */
export function SketchPad({ onDone, onCancel }: { onDone: (png: string) => void; onCancel: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null); const strokes = useRef<Stroke[]>([]); const redo = useRef<Stroke[]>([]); const cur = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<(typeof TOOLS)[number]['id']>('pen'); const [color, setColor] = useState(COLORS[0]); const [, force] = useState(0);
  const redraw = () => {
    const c = cv.current!; const g = c.getContext('2d')!; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    for (const s of [...strokes.current, ...(cur.current ? [cur.current] : [])]) {
      g.globalAlpha = s.a; g.strokeStyle = s.erase ? '#fff' : s.c; g.lineWidth = s.w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      s.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (s.pts.length === 1) g.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]); g.stroke();
    } g.globalAlpha = 1;
  };
  useEffect(() => { const c = cv.current!; c.width = 900; c.height = 1200; redraw(); }, []);
  const at = (e: PointerEvent): [number, number] => { const r = cv.current!.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 900, ((e.clientY - r.top) / r.height) * 1200]; };
  const down = (e: PointerEvent) => { e.preventDefault(); (e.target as Element).setPointerCapture(e.pointerId); const tl = TOOLS.find((x) => x.id === tool)!; cur.current = { c: color, w: tl.w, a: tl.a, erase: tl.erase, pts: [at(e)] }; redo.current = []; redraw(); };
  const move = (e: PointerEvent) => { if (!cur.current) return; cur.current.pts.push(at(e)); redraw(); };
  const up = () => { if (cur.current) { strokes.current.push(cur.current); cur.current = null; redraw(); force((n) => n + 1); } };
  return (
    <div class="stack" role="dialog" aria-label={t('sketch.title')}>
      <div class="row" style="justify-content:space-between"><button class="btn" aria-label={t('common.close')} onClick={onCancel}>✕</button>
        <div class="row"><button class="btn" aria-label={t('notes.undo')} disabled={!strokes.current.length} onClick={() => { const s = strokes.current.pop(); if (s) redo.current.push(s); redraw(); force((n) => n + 1); }}>↶</button><button class="btn" aria-label={t('notes.redo')} disabled={!redo.current.length} onClick={() => { const s = redo.current.pop(); if (s) strokes.current.push(s); redraw(); force((n) => n + 1); }}>↷</button></div>
        <button class="btn primary" aria-label={t('common.save')} onClick={() => onDone(cv.current!.toDataURL('image/png'))}>✓</button></div>
      <canvas ref={cv} style="inline-size:100%;aspect-ratio:3/4;background:#fff;border-radius:12px;touch-action:none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label={t('sketch.title')} />
      <div class="row" role="toolbar" style="justify-content:center">{COLORS.map((c) => <button class="btn" aria-label={c} aria-pressed={color === c} style={`background:${c};min-inline-size:44px;border:${color === c ? '4px solid var(--neon)' : '2px solid var(--border-strong)'}`} onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }} />)}</div>
      <div class="row" style="justify-content:center">{TOOLS.map((x) => <button class={`btn${tool === x.id ? ' primary' : ''}`} onClick={() => setTool(x.id)}>{t(`sketch.${x.id}`)}</button>)}</div>
    </div>
  );
}
/** Scales a picked image down so notes stay small. */
export async function shrinkImage(file: File, max = 1280): Promise<string> {
  const bmp = await createImageBitmap(file); const k = Math.min(1, max / Math.max(bmp.width, bmp.height)); const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.8);
}
