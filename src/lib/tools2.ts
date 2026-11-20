// Pure helpers behind the converter screens (finance, dates, discount, number bases, BMI, manual-rate currency).
export type BmiClass = 'under' | 'normal' | 'over' | 'obese';
/** Body mass index with the WHO adult classes (18.5 / 25 / 30). Not a diagnosis. */
export function bmi(kg: number, cm: number): { value: number; cls: BmiClass } | null {
  if (!(kg > 0) || !(cm > 0) || cm > 300 || kg > 700) return null;
  const m = cm / 100; const value = kg / (m * m);
  return { value, cls: value < 18.5 ? 'under' : value < 25 ? 'normal' : value < 30 ? 'over' : 'obese' };
}
export function discount(price: number, pct: number): { final: number; saved: number } | null {
  if (!(price >= 0) || !(pct >= 0) || pct > 100) return null;
  const saved = (price * pct) / 100; return { final: price - saved, saved };
}
/** Fixed monthly payment of a loan (annuity formula). */
export function loanPayment(principal: number, annualPct: number, months: number): { monthly: number; total: number; interest: number } | null {
  if (!(principal > 0) || !(annualPct >= 0) || !Number.isInteger(months) || months < 1 || months > 1200) return null;
  const r = annualPct / 100 / 12; const monthly = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
  return { monthly, total: monthly * months, interest: monthly * months - principal };
}
export function compound(principal: number, annualPct: number, years: number, perYear = 12): { final: number; gain: number } | null {
  if (!(principal >= 0) || !(annualPct >= 0) || !(years >= 0) || years > 200 || !(perYear >= 1)) return null;
  const final = principal * Math.pow(1 + annualPct / 100 / perYear, perYear * years); return { final, gain: final - principal };
}
const DAY = 86400000;
const utc = (d: string) => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
export const validDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(utc(d)).toISOString().slice(0, 10) === d;
/** Days between two ISO dates (b - a) and the same span in years, months and days. */
export function dateDiff(a: string, b: string): { days: number; years: number; months: number; rest: number } | null {
  if (!validDate(a) || !validDate(b)) return null;
  const days = Math.round((utc(b) - utc(a)) / DAY); let [from, to] = utc(a) <= utc(b) ? [a, b] : [b, a];
  const f = from.split('-').map(Number), t = to.split('-').map(Number);
  let years = t[0] - f[0], months = t[1] - f[1], rest = t[2] - f[2];
  if (rest < 0) { months--; rest += new Date(Date.UTC(t[0], t[1] - 1, 0)).getUTCDate(); }
  if (months < 0) { years--; months += 12; }
  return { days, years, months, rest };
}
export function addDays(date: string, n: number): string | null { return validDate(date) && Number.isFinite(n) ? new Date(utc(date) + Math.round(n) * DAY).toISOString().slice(0, 10) : null; }
/** Number in one base shown in all the common ones; null if the digits do not belong to the base. */
export function radix(text: string, base: 2 | 8 | 10 | 16): { bin: string; oct: string; dec: string; hex: string } | null {
  const t = text.trim().toLowerCase(); const digits = '0123456789abcdef'.slice(0, base);
  if (!t || [...t].some((c) => !digits.includes(c)) || t.length > 60) return null;
  let n = 0n; for (const c of t) n = n * BigInt(base) + BigInt(digits.indexOf(c));
  return { bin: n.toString(2), oct: n.toString(8), dec: n.toString(10), hex: n.toString(16).toUpperCase() };
}
/** Currency with a rate the user types (the app works offline, so there is no live rate). */
export const convertWithRate = (amount: number, rate: number) => (Number.isFinite(amount) && rate > 0 ? amount * rate : null);
