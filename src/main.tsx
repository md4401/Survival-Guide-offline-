import { render } from 'preact';
import './styles/base.css';
import { loadSettings } from './db/settings';
import { App } from './app';

loadSettings().finally(() => render(<App />, document.getElementById('app')!));
