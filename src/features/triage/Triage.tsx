import { useEffect, useState } from 'preact/hooks';
import { href, go } from '../../router';
import { t } from '../../i18n';
import { getGuide } from '../../content/loader';
import { NumbersList } from '../emergency/Numbers';

const LIFE: Array<[string, string]> = [['cpr', 'firstaid.cpr'], ['choking', 'firstaid.choking'], ['bleeding', 'firstaid.bleeding']];
const OTHER: Array<[string, string]> = [
  ['fire', 'scenario.house-fire'], ['quake', 'scenario.earthquake'], ['flood', 'scenario.flood'], ['storm', 'scenario.storm'],
  ['blackout', 'scenario.blackout'], ['heat', 'scenario.heatwave'], ['cold', 'scenario.coldwave'], ['lost', 'scenario.lost'], ['water', 'water.diy-filter'],
];
/** One answer = one tap: icon (1) → "I need help now" (2) → situation (3) → first step. Question 2 ("where") is not asked: see DECISIONS.md. */
export function Triage() {
  return (
    <main class="stack">
      <h1>{t('triage.title')}</h1>
      <p class="danger-box">{t('triage.callFirst')}</p>
      <h2>{t('triage.group.life')}</h2>
      <ul class="list">{LIFE.map(([k, id]) => <li><a class="btn btn-danger" href={href('triage', id)}>{t(`triage.opt.${k}`)}</a></li>)}</ul>
      <h2>{t('triage.group.other')}</h2>
      <ul class="list">{OTHER.map(([k, id]) => <li><a class="btn" href={href('triage', id)}>{t(`triage.opt.${k}`)}</a></li>)}</ul>
    </main>
  );
}

/** Goes straight to the guide if published; otherwise shows emergency numbers and an honest notice. */
export function TriageResult({ id }: { id: string }) {
  const [state, setState] = useState<'wait' | 'missing'>('wait');
  useEffect(() => {
    getGuide(id).then((g) => { if (g) go('guide', id); else setState('missing'); });
  }, [id]);
  if (state === 'wait') return <main><p>{t('app.loading')}</p></main>;
  return (
    <main class="stack">
      <p class="danger-box" role="alert">{t('triage.underReview')} {t('triage.underReviewHelp')}</p>
      <NumbersList />
    </main>
  );
}
