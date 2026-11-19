import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
// Every text/background pair used by the design must meet WCAG AA (4.5:1; 3:1 for large display text).
const css = fs.readFileSync('src/styles/tokens.css', 'utf8');
function theme(sel: string): Record<string, string> {
  const base = Object.fromEntries([...css.split(':root[')[0].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{3,6})/gi)].map((m) => [m[1], m[2]]));
  if (sel === 'dark') return base;
  const blk = css.split(`:root[data-theme='${sel}']`)[1]?.split('}')[0] ?? '';
  return { ...base, ...Object.fromEntries([...blk.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{3,6})/gi)].map((m) => [m[1], m[2]])) };
}
const lum = (hex: string) => { const h = hex.replace('#', ''); const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS: Array<[string, string, number]> = [['text', 'bg', 4.5], ['text', 'surface', 4.5], ['text', 'surface-2', 4.5], ['muted', 'bg', 4.5], ['muted', 'surface', 4.5], ['accent', 'bg', 4.5], ['accent', 'surface', 4.5], ['on-neon', 'neon', 4.5], ['on-danger', 'danger', 4.5], ['danger', 'bg', 3], ['text', 'danger-bg', 4.5], ['border-strong', 'bg', 3]];
describe('design tokens meet WCAG AA', () => {
  for (const th of ['dark', 'light', 'red']) for (const [fg, bg, min] of PAIRS) {
    if (th === 'red' && fg === 'danger') continue;
    it(`${th}: ${fg} on ${bg} ≥ ${min}`, () => { const t = theme(th); expect(t[fg] && t[bg], `${fg}/${bg}`).toBeTruthy(); expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(min); });
  }
  it('uses the moodboard neon', () => { expect(theme('dark').neon).toBe('#edff00'); expect(ratio('#0a0a0a', '#edff00')).toBeGreaterThan(15); });
});
