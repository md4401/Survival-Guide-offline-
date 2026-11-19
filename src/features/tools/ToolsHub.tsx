import { t } from '../../i18n';
import { href } from '../../router';

const ITEMS: Array<[string, string, string[], string]> = [
  ['🧮', 'calc.title', ['tools', 'calculator'], 'calc'], ['🧭', 'compass.title', ['compass'], 'compass'], ['🕒', 'world.clock', ['world', 'clock'], 'clock'],
  ['🎙', 'rec.title', ['tools', 'recorder'], 'recorder'], ['📷', 'qrscan.title', ['tools', 'qrscan'], 'qrscan'], ['📝', 'notes.title', ['tools', 'notes'], 'notes'],
  ['📅', 'world.calendar', ['world', 'calendar'], 'calendar'], ['🗓', 'agenda.title', ['tools', 'agenda'], 'agenda'], ['🔊', 'spl.title', ['tools', 'decibel'], 'decibel'],
  ['📐', 'level.title', ['tools', 'level'], 'level'], ['🧲', 'metal.title', ['tools', 'metal'], 'metal'], ['⏱', 'timer.title', ['tools', 'timer'], 'timer'],
  ['🔄', 'converter.title', ['tools', 'converter'], 'converter'], ['👣', 'dist.title', ['tools', 'distance'], 'distance'], ['📡', 'morse.title', ['tools', 'morse'], 'morse'],
];
export function ToolsHub() {
  return (
    <main class="stack"><h1>{t('tools.title')}</h1><p class="muted">{t('tools.intro')}</p>
      <div class="grid2">{ITEMS.map(([i, k, r, id]) => <a class="btn tool" data-tool={id} href={href(r[0], r[1])}>{i} {t(k)}</a>)}</div></main>
  );
}
