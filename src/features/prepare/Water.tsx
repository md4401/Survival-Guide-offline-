import { useState } from 'preact/hooks';
import { t } from '../../i18n';
import { useSettings } from '../../db/settings';
import { chlorineDose, waterNeed, WATER_REVIEW, CHLORINE_DEFAULT_TARGET_MGL } from '../../lib/water';

export function Water() {
  const s = useSettings();
  const [people, setPeople] = useState(s.profile.people); const [kids, setKids] = useState(s.profile.kids);
  const [pets, setPets] = useState(s.profile.pets); const [days, setDays] = useState(3);
  const [hot, setHot] = useState(false); const [hard, setHard] = useState(false);
  const [vol, setVol] = useState('10'); const [pct, setPct] = useState('5'); const [target, setTarget] = useState(String(CHLORINE_DEFAULT_TARGET_MGL));
  const need = waterNeed({ people, kids: Math.min(kids, people), pets, days, hot, hardWork: hard });
  const dose = chlorineDose(Number(vol), Number(pct), Number(target));
  const num = (label: string, v: number, set: (n: number) => void, min = 0, max = 30) => (
    <label class="row"><span style="flex:1">{label}</span>
      <button onClick={() => set(Math.max(min, v - 1))} aria-label="-">−</button><strong>{v}</strong><button onClick={() => set(Math.min(max, v + 1))} aria-label="+">+</button></label>
  );
  const field = (label: string, v: string, set: (x: string) => void) => (
    <label class="row"><span style="flex:1">{label}</span><input type="number" inputMode="decimal" min="0" step="any" value={v} onInput={(e) => set((e.target as HTMLInputElement).value)} style="inline-size:7rem" /></label>
  );
  return (
    <main class="stack">
      <h1>{t('water.title')}</h1>
      {WATER_REVIEW && <p class="danger-box">{t('water.review')}</p>}
      <section class="card stack">
        <h2>{t('water.need')}</h2>
        {num(t('kit.people'), people, setPeople, 1)}{num(t('profile.kids'), kids, setKids)}{num(t('profile.pets'), pets, setPets)}{num(t('kit.days'), days, setDays, 1)}
        <label class="row"><input type="checkbox" checked={hot} onChange={(e) => setHot((e.target as HTMLInputElement).checked)} /><span>{t('water.hot')}</span></label>
        <label class="row"><input type="checkbox" checked={hard} onChange={(e) => setHard((e.target as HTMLInputElement).checked)} /><span>{t('water.hard')}</span></label>
        <div class="big-num">{need} L</div>
      </section>
      <section class="card stack">
        <h2>{t('water.chlorine')}</h2>
        <p>{t('water.chlorine.hint')}</p>
        {field(t('water.volume'), vol, setVol)}{field(t('water.conc'), pct, setPct)}{field(t('water.target'), target, setTarget)}
        {dose ? <div><div class="big-num">{dose.mL < 1 ? dose.mL.toFixed(2) : dose.mL.toFixed(1)} mL ≈ {dose.drops} {t('water.drops')}</div>
          <p role="alert" class="danger-box">{t('water.wait', { n: dose.waitMin })}</p></div> : <p class="muted">{t('water.invalid')}</p>}
      </section>
    </main>
  );
}
