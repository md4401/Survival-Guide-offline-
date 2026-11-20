// Small safe expression calculator (no eval). + - × ÷ ^ % ! ( ) √ π e, sin cos tan asin acos atan ln lg exp abs, decimal comma or point.
export class CalcError extends Error {}
type Tok = { k: 'n'; v: number } | { k: 'o'; v: string } | { k: 'i'; v: string };
export interface CalcOptions { deg?: boolean }
function lex(src: string): Tok[] {
  const s = src.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
  const out: Tok[] = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const str = s.slice(i, j); if ((str.match(/\./g) ?? []).length > 1 || str === '.') throw new CalcError('number'); out.push({ k: 'n', v: Number(str) }); i = j; }
    else if (c === 'π') { out.push({ k: 'n', v: Math.PI }); i++; }
    else if (/[a-z]/i.test(c)) { let j = i; while (j < s.length && /[a-z]/i.test(s[j])) j++; out.push({ k: 'i', v: s.slice(i, j).toLowerCase() }); i = j; }
    else if ('+-*/^%!()√'.includes(c)) { out.push({ k: 'o', v: c }); i++; }
    else throw new CalcError('char');
  }
  return out;
}
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('fact'); if (n > 170) throw new CalcError('range');
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
}
const FUNCS: Record<string, (x: number, deg: boolean) => number> = {
  sin: (x, d) => Math.sin(d ? (x * Math.PI) / 180 : x), cos: (x, d) => Math.cos(d ? (x * Math.PI) / 180 : x), tan: (x, d) => Math.tan(d ? (x * Math.PI) / 180 : x),
  asin: (x, d) => { if (x < -1 || x > 1) throw new CalcError('domain'); const r = Math.asin(x); return d ? (r * 180) / Math.PI : r; },
  acos: (x, d) => { if (x < -1 || x > 1) throw new CalcError('domain'); const r = Math.acos(x); return d ? (r * 180) / Math.PI : r; },
  atan: (x, d) => { const r = Math.atan(x); return d ? (r * 180) / Math.PI : r; },
  ln: (x) => { if (x <= 0) throw new CalcError('domain'); return Math.log(x); }, lg: (x) => { if (x <= 0) throw new CalcError('domain'); return Math.log10(x); }, log: (x) => { if (x <= 0) throw new CalcError('domain'); return Math.log10(x); },
  exp: (x) => Math.exp(x), abs: (x) => Math.abs(x), sqrt: (x) => { if (x < 0) throw new CalcError('sqrt'); return Math.sqrt(x); },
};
/** Rounds results of trig functions that should be exact (sin 180° = 0, cos 90° = 0). */
const clean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);
export function evaluate(src: string, opt: CalcOptions = {}): number {
  const toks = lex(src); let p = 0; const deg = !!opt.deg;
  const peek = () => toks[p]; const isOp = (v: string) => { const t = toks[p]; return t?.k === 'o' && t.v === v; };
  const primary = (): number => {
    const t = toks[p++]; if (!t) throw new CalcError('end');
    if (t.k === 'n') return t.v;
    if (t.k === 'i') {
      if (t.v === 'pi') return Math.PI; if (t.v === 'e') return Math.E;
      const f = FUNCS[t.v]; if (!f) throw new CalcError('char');
      if (!isOp('(')) throw new CalcError('syntax'); p++; const a = expr(); if (!isOp(')')) throw new CalcError('paren'); p++; return clean(f(a, deg));
    }
    if (t.v === '(') { const v = expr(); if (!isOp(')')) throw new CalcError('paren'); p++; return v; }
    if (t.v === '√') { const v = unary(); if (v < 0) throw new CalcError('sqrt'); return Math.sqrt(v); }
    throw new CalcError('syntax');
  };
  const postfix = (): number => { let v = primary(); for (;;) { if (isOp('%')) { p++; v /= 100; } else if (isOp('!')) { p++; v = factorial(v); } else return v; } };
  const unary = (): number => { if (isOp('-')) { p++; return -unary(); } if (isOp('+')) { p++; return unary(); } return power(); };
  const power = (): number => { const b = postfix(); if (isOp('^')) { p++; return Math.pow(b, unary()); } return b; };
  const term = (): number => { let v = unary(); for (;;) { if (isOp('*')) { p++; v *= unary(); } else if (isOp('/')) { p++; const d = unary(); if (d === 0) throw new CalcError('div0'); v /= d; } else return v; } };
  const expr = (): number => { let v = term(); for (;;) { if (isOp('+')) { p++; v += term(); } else if (isOp('-')) { p++; v -= term(); } else return v; } };
  if (!toks.length) throw new CalcError('empty');
  const v = expr(); if (p < toks.length) throw new CalcError('syntax'); void peek;
  if (!Number.isFinite(v)) throw new CalcError('range'); return v;
}
/** Rounds away floating-point noise (0.1+0.2 → 0.3) and trims zeros. */
export const fmt = (v: number, locale = 'en') => { const r = Number(v.toPrecision(12)); return Math.abs(r) >= 1e15 || (r !== 0 && Math.abs(r) < 1e-9) ? r.toExponential(6) : r.toLocaleString(locale, { maximumFractionDigits: 10, useGrouping: false }); };
