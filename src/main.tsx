import { render } from 'preact';
import '@fontsource/anton/latin-400.css';
import './styles/base.css';
import { loadSettings } from './db/settings';
import { App } from './app';
import { initPwa } from './pwa';
import { initLiveUpdate } from './lib/liveNative';

initPwa();

loadSettings().finally(() => { render(<App />, document.getElementById('app')!); initLiveUpdate(); });
