// Small safe expression calculator (no eval). + - × ÷ ^ % ( ) √ π, decimal comma or point.
export class CalcError extends Error {}
type Tok = { k: 'n'; v: number } | { k: 'o'; v: string };
function lex(src: string): Tok[] {
  const s = src.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
  const out: Tok[] = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const str = s.slice(i, j); if ((str.match(/\./g) ?? []).length > 1 || str === '.') throw new CalcError('number'); out.push({ k: 'n', v: Number(str) }); i = j; }
    else if (c === 'π') { out.push({ k: 'n', v: Math.PI }); i++; }
    else if ('+-*/^%()√'.includes(c)) { out.push({ k: 'o', v: c }); i++; }
    else throw new CalcError('char');
  }
  return out;
}
export function evaluate(src: string): number {
  const toks = lex(src); let p = 0;
  const peek = () => toks[p]; const isOp = (v: string) => { const t = toks[p]; return t?.k === 'o' && t.v === v; };
  const primary = (): number => {
    const t = toks[p++]; if (!t) throw new CalcError('end');
    if (t.k === 'n') return t.v;
    if (t.v === '(') { const v = expr(); if (!isOp(')')) throw new CalcError('paren'); p++; return v; }
    if (t.v === '√') { const v = unary(); if (v < 0) throw new CalcError('sqrt'); return Math.sqrt(v); }
    throw new CalcError('syntax');
  };
  const postfix = (): number => { let v = primary(); while (isOp('%')) { p++; v /= 100; } return v; };
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
