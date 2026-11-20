// Time graph of the last N seconds (SVG, no dependency). Values on the left axis, seconds before now along the top, like a measuring instrument.
export interface Pt { t: number; v: number }
export function Graph({ pts, now, windowMs = 30000, yMin, yMax, step, color = 'var(--neon)', label, unit }: { pts: Pt[]; now: number; windowMs?: number; yMin: number; yMax: number; step: number; color?: string; label: string; unit?: string }) {
  const W = 300, H = 170, L = 34, T = 18, B = 6, R = 4; const pw = W - L - R, ph = H - T - B;
  const x = (t: number) => L + ((t - (now - windowMs)) / windowMs) * pw; const y = (v: number) => T + ph - ((Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin)) * ph;
  const ys: number[] = []; for (let v = yMin; v <= yMax + 1e-9; v += step) ys.push(v);
  const secs: number[] = []; for (let s = windowMs / 1000 - 5; s > 0; s -= 5) secs.push(s);
  const path = pts.filter((p) => p.t >= now - windowMs).map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} dir="ltr" style="inline-size:100%;background:#000;border-radius:8px">
      {ys.map((v) => <g><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#444" stroke-dasharray="3 3" stroke-width=".6" /><text x={L - 3} y={y(v) + 3} text-anchor="end" font-size="8" fill="#bbb">{v}</text></g>)}
      {secs.map((s) => <g><line x1={x(now - s * 1000)} x2={x(now - s * 1000)} y1={T} y2={H - B} stroke="#444" stroke-dasharray="3 3" stroke-width=".6" /><text x={x(now - s * 1000) + 2} y={T - 5} font-size="8" fill="#bbb">-{s}s</text></g>)}
      {unit && <text x={L - 3} y={H - 0} text-anchor="end" font-size="7" fill="#bbb">{unit}</text>}
      <path d={path} fill="none" stroke={color} stroke-width="1.4" stroke-linejoin="round" />
    </svg>
  );
}
