import { useSettings } from './db/settings';
import { usePath } from './router';
import { Layout } from './components/Layout';
import { Home } from './features/home/Home';
import { Triage, TriageResult } from './features/triage/Triage';
import { Emergency } from './features/emergency/Emergency';
import { Numbers } from './features/emergency/Numbers';
import { Torch } from './features/emergency/Torch';
import { Whistle } from './features/emergency/Whistle';
import { Gps } from './features/emergency/Gps';
import { GuideView } from './features/guides/GuideView';
import { ListPage } from './features/guides/ListPage';
import { Search } from './features/guides/Search';
import { Settings } from './features/settings/Settings';
import { World } from './features/almanac/World';
import { Clock } from './features/almanac/Clock';
import { Counter } from './features/almanac/Counter';
import { SunMoon } from './features/almanac/SunMoon';
import { CalendarPage } from './features/almanac/CalendarPage';
import { Countries } from './features/almanac/Countries';
import { Climate } from './features/almanac/Climate';
import { Tables } from './features/almanac/Tables';
import { Prepare } from './features/prepare/Prepare';
import { Kit } from './features/prepare/Kit';
import { Family } from './features/prepare/Family';
import { Timer } from './features/tools/Timer';
import { Converter } from './features/tools/Converter';
import { Notes } from './features/tools/Notes';
import { Onboarding } from './features/settings/Onboarding';
import { Crisis } from './features/crisis/Crisis';
import { Water } from './features/prepare/Water';
import { t } from './i18n';

export function App() {
  useSettings();
  const [r, arg, arg2] = usePath();
  let view;
  switch (r) {
    case undefined: view = <Home />; break;
    case 'triage': view = arg ? <TriageResult id={arg} /> : <Triage />; break;
    case 'emergency': view = <Emergency />; break;
    case 'numbers': view = <Numbers />; break;
    case 'torch': view = <Torch />; break;
    case 'whistle': view = <Whistle />; break;
    case 'gps': view = <Gps />; break;
    case 'search': view = <Search />; break;
    case 'settings': view = <Settings />; break;
    case 'guide': view = <GuideView id={arg ?? ''} />; break;
    case 'scenarios': view = <ListPage kind="scenario" titleKey="list.scenarios" />; break;
    case 'guides': view = <ListPage kind="guide" titleKey="list.guides" />; break;
    case 'prepare': view = arg === 'kit' ? <Kit kit={arg2 ?? '72h'} /> : arg === 'family' ? <Family /> : arg === 'water' ? <Water /> : <Prepare />; break;
    case 'tools': view = arg === 'converter' ? <Converter /> : arg === 'notes' ? <Notes /> : <Timer />; break;
    case 'crisis': view = <Crisis />; break;
    case 'onboarding': view = <Onboarding />; break;
    case 'world': {
      const W: Record<string, any> = { clock: Clock, counter: Counter, sun: SunMoon, calendar: CalendarPage, countries: Countries, climate: Climate, tables: Tables };
      const V = arg ? W[arg] : World;
      view = V ? <V /> : <World />; break;
    }
    default: view = <main><p>{t('guide.notFound')}</p></main>;
  }
  return <Layout route={r ?? ''}>{view}</Layout>;
}
