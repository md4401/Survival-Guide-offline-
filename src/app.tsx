import { useSettings } from './db/settings';
import { t } from './i18n';

export function App() {
  useSettings();
  return <main><h1>{t('app.name')}</h1></main>;
}
