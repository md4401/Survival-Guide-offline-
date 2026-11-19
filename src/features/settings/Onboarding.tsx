import { useState } from 'preact/hooks';
import { t, MVP_LANGS } from '../../i18n';
import { updateSettings, useSettings } from '../../db/settings';
import { go } from '../../router';
import type { Lang } from '../../content/types';

const TOTAL = 5;
export function Onboarding() {
  const s = useSettings();
  const [step, setStep] = useState(1);
  const [pr, setPr] = useState(s.profile);
  const finish = () => { updateSettings({ profile: pr, onboarded: true }); go(); };
  const skip = () => { updateSettings({ onboarded: true }); go(); };
  const stepper = (k: 'people' | 'kids' | 'elderly' | 'pets', min = 0) => (
    <label class="row"><span style="flex:1">{t(`profile.${k}`)}</span>
      <button onClick={() => setPr({ ...pr, [k]: Math.max(min, pr[k] - 1) })} aria-label="-">−</button><strong>{pr[k]}</strong>
      <button onClick={() => setPr({ ...pr, [k]: Math.min(20, pr[k] + 1) })} aria-label="+">+</button></label>
  );
  return (
    <main class="stack">
      <p class="muted">{t('onb.step', { n: step, total: TOTAL })}</p>
      {step === 1 && <><h1>{t('settings.language')}</h1>{MVP_LANGS.map((l) => <button class={`btn-block ${s.locale === l ? 'pill-on' : ''}`} onClick={() => updateSettings({ locale: l as Lang })}>{t(`lang.${l}`)}</button>)}</>}
      {step === 2 && <><h1>{t('num.country')}</h1>
        <select value={s.country} onChange={(e) => updateSettings({ country: (e.target as HTMLSelectElement).value })}>
          <option value="">—</option>{['BR', 'US', 'CA', 'GB', 'AU'].map((c) => <option value={c}>{new Intl.DisplayNames([s.locale], { type: 'region' }).of(c)}</option>)}</select></>}
      {step === 3 && <><h1>{t('onb.who')}</h1>{stepper('people', 1)}</>}
      {step === 4 && <><h1>{t('onb.extras')}</h1>{stepper('kids')}{stepper('elderly')}{stepper('pets')}</>}
      {step === 5 && <><h1>{t('profile.home')}</h1>
        {(['house', 'apartment'] as const).map((h) => <button class={`btn-block ${pr.home === h ? 'pill-on' : ''}`} onClick={() => setPr({ ...pr, home: h })}>{t(`home.${h}`)}</button>)}</>}
      <div class="row">
        <button onClick={skip}>{t('common.skip')}</button>
        {step < TOTAL ? <button class="btn-danger" onClick={() => setStep(step + 1)}>{t('common.next')}</button> : <button class="btn-danger" onClick={finish}>{t('common.save')}</button>}
      </div>
      <p class="muted">{t('settings.privacy')}</p>
    </main>
  );
}
