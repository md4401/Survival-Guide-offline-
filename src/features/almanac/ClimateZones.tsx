import { t } from '../../i18n';
import { ALL_CLASSES, decode, GROUP_COLOR, type Group } from '../../lib/koppen';
import { koppenText } from './Climate';

export function ClimateZones() {
  const groups: Group[] = ['A', 'B', 'C', 'D', 'E'];
  return (
    <main class="stack">
      <h1>{t('zones.title')}</h1>
      <p class="muted">{t('zones.review')}</p>
      {groups.map((g) => (
        <section class="card" key={g}>
          <h2 style={`color:${GROUP_COLOR[g]}`}>{t(`kg.${g}`)}</h2>
          <ul class="list">{ALL_CLASSES.filter((c) => decode(c)?.group === g).map((c) => <li><strong>{c}</strong> · {koppenText(c)}</li>)}</ul>
        </section>
      ))}
    </main>
  );
}
