import { t } from '../../i18n';
import { href } from '../../router';

const ITEMS: Array<[string, string, string]> = [
  ['clock', '🕒', 'world.clock'], ['counter', '📅', 'world.counter'], ['sun', '🌅', 'world.sun'], ['calendar', '🗓️', 'world.calendar'],
  ['countries', '🌐', 'world.countries'], ['climate', '🌡️', 'world.climate'], ['tables', '📊', 'world.tables'],
];
export function World() {
  return (
    <main class="stack">
      <h1>{t('world.title')}</h1>
      <div class="grid2">{ITEMS.map(([r, i, k]) => <a class="btn tool" href={href('world', r)}>{i} {t(k)}</a>)}</div>
    </main>
  );
}
