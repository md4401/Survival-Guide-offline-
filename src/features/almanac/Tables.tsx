import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { BEAUFORT, QUAKE, SAFFIR, UV, toRoman } from '../../data/tables';
import { MORSE_TABLE } from '../../lib/morse';

export function Tables() {
  const s = useSettings();
  const [n, setN] = useState('2024');
  const imp = s.units === 'imperial';
  const sp = (kmh: number) => (imp ? Math.round(kmh * 0.621371) : kmh);
  const u = imp ? 'mph' : 'km/h';
  const range = (lo: number, hi: number | null) => (hi === null ? `≥ ${sp(lo)}` : lo === hi ? (lo === 0 ? `< 1` : `${sp(lo)}`) : `${sp(lo)}–${sp(hi)}`);
  return (
    <main class="stack">
      <h1>{t('world.tables')}</h1>
      <p class="danger-box">{t('tables.review')}</p>
      <section class="card"><h2>{t('tables.beaufort')} ({u})</h2>
        <table class="cal"><tbody>{BEAUFORT.map(([lo, hi], i) => <tr><td>{i}</td><td>{t(`beaufort.${i}`)}</td><td>{range(lo, hi)}</td></tr>)}</tbody></table></section>
      <section class="card"><h2>{t('tables.saffir')} ({u})</h2>
        <table class="cal"><tbody>{SAFFIR.map(([lo, hi], i) => <tr><td>{i + 1}</td><td>{range(lo, hi)}</td></tr>)}</tbody></table></section>
      <section class="card"><h2>{t('tables.uv')}</h2>
        <table class="cal"><tbody>{UV.map(([k, lo, hi]) => <tr><td>{t(`uv.cat.${k}`)}</td><td>{hi === null ? `${lo}+` : `${lo}–${hi}`}</td></tr>)}</tbody></table></section>
      <section class="card"><h2>{t('tables.quake')}</h2>
        <table class="cal"><tbody>{QUAKE.map(([k, lo, hi]) => <tr><td>{t(`quake.cat.${k}`)}</td><td>{hi === null ? `${lo}+` : `${lo}–${hi}`}</td></tr>)}</tbody></table></section>
      <section class="card"><h2>{t('tables.boil')}</h2>
        <table class="cal"><tbody><tr><td>≤ 2000 m</td><td>{t('common.minutes', { n: 1 })}</td></tr><tr><td>&gt; 2000 m</td><td>{t('common.minutes', { n: 3 })}</td></tr></tbody></table>
        <p class="muted">{t('tables.boil.src')}</p></section>
      <section class="card"><h2>{t('tables.morse')}</h2>
        <div class="grid2">{Object.entries(MORSE_TABLE).map(([k, v]) => <div><strong>{k}</strong> <code>{v}</code></div>)}</div></section>
      <section class="card"><h2>{t('tables.roman')}</h2>
        <input type="number" min="1" max="3999" value={n} onInput={(e) => setN((e.target as HTMLInputElement).value)} aria-label={t('tables.roman')} />
        <div class="big-num">{toRoman(Number(n)) || '—'}</div></section>
    </main>
  );
}
