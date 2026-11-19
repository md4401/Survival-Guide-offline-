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
import { t } from './i18n';

export function App() {
  useSettings();
  const [r, arg] = usePath();
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
    case 'prepare': view = <ListPage kind="kit" titleKey="list.prepare" />; break;
    case 'world': view = <main><h1>{t('world.title')}</h1></main>; break;
    default: view = <main><p>{t('guide.notFound')}</p></main>;
  }
  return <Layout route={r ?? ''}>{view}</Layout>;
}
