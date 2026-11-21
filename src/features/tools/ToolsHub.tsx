import { t } from '../../i18n';
import { href } from '../../router';

type Item = [icon: string, key: string, route: string[], id?: string];
const SECTIONS: Array<[string, Item[]]> = [
  ['tools.sec.emergency', [['🔦', 'home.torch', ['torch']], ['📣', 'home.whistle', ['whistle']], ['🆘', 'home.sos', ['signal']], ['📞', 'home.numbers', ['numbers']], ['📍', 'home.gps', ['gps']], ['🧭', 'compass.title', ['compass'], 'compass'], ['🥾', 'trail.title', ['trail']], ['🪪', 'medcard.title', ['medcard']], ['🤫', 'silent.title', ['silent']]]],
  ['tools.sec.measure', [['📐', 'level.title', ['tools', 'level'], 'level'], ['🔊', 'spl.title', ['tools', 'decibel'], 'decibel'], ['🧲', 'metal.title', ['tools', 'metal'], 'metal'], ['👣', 'dist.title', ['tools', 'distance'], 'distance'], ['⏱', 'timer.title', ['tools', 'timer'], 'timer'], ['🕒', 'world.clock', ['world', 'clock'], 'clock']]],
  ['tools.sec.write', [['🧮', 'calc.title', ['tools', 'calculator'], 'calc'], ['🔄', 'converter.title', ['tools', 'converter'], 'converter'], ['📝', 'notes.title', ['tools', 'notes'], 'notes'], ['🗓', 'agenda.title', ['tools', 'agenda'], 'agenda'], ['📅', 'world.calendar', ['world', 'calendar'], 'calendar'], ['🎙', 'rec.title', ['tools', 'recorder'], 'recorder'], ['📷', 'qrscan.title', ['tools', 'qrscan'], 'qrscan'], ['📡', 'morse.title', ['tools', 'morse'], 'morse']]],
];
export function ToolsHub() {
  return (
    <main class="stack"><h1>{t('tools.title')}</h1><p class="muted">{t('tools.intro')}</p>
      {SECTIONS.map(([title, items]) => (
        <section class="stack"><h2>{t(title)}</h2>
          <div class="grid2">{items.map(([i, k, r, id]) => <a class="btn tool" data-tool={id} href={href(...r)}><span class="ico" aria-hidden="true">{i}</span><span>{t(k)}</span></a>)}</div>
        </section>
      ))}
    </main>
  );
}
