import { t } from '../../i18n';
import { ZONES } from '../../data/climateZones';

export function ClimateZones() {
  return (
    <main class="stack">
      <h1>{t('zones.title')}</h1>
      <p class="danger-box">{t('zones.review')}</p>
      {ZONES.map((z) => (
        <details class="card" key={z}><summary>{t(`zone.${z}`)}</summary>
          <p>{t(`zone.${z}.d`)}</p><p class="muted">{t('zones.examples')}: {t(`zone.${z}.e`)}</p></details>
      ))}
    </main>
  );
}
