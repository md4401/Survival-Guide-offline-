// Run: npm run build && npm run test:e2e   (needs playwright + chromium; preinstalled in the cloud sandbox)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? 'playwright');

const PORT = 4173;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = true;
const check = (name, cond, extra = '') => { console.log(`${cond ? '✓' : '✗'} ${name} ${extra}`); if (!cond) ok = false; };
try {
  await wait(2500);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await wait(1500); // let precache finish
  await ctx.setOffline(true);

  // "Tap 1" = opening the app from the icon (cold load while offline).
  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('.help-btn');
  const tOpen = Date.now() - t0;
  let taps = 1;
  await page.click('.help-btn'); taps++;                         // 2: "I need help now"
  await page.click('a[href="#/triage/water.diy-filter"]'); taps++; // 3: situation
  await page.waitForSelector('ol.steps li');
  const total = Date.now() - t0;
  const first = await page.textContent('ol.steps li');
  check('offline cold start renders home', tOpen < 2000, `(${tOpen} ms)`);
  check('icon → first emergency step in ≤3 taps', taps <= 3, `(${taps} taps, ${total} ms, step: "${first}")`);

  // Offline functionality
  await page.goto(`http://localhost:${PORT}/#/numbers`);
  check('emergency numbers offline', (await page.textContent('main')).includes('190') || (await page.textContent('main')).includes('911'));
  await page.goto(`http://localhost:${PORT}/#/guide/shelter.camp-setup`);
  await page.waitForSelector('ol.steps li');
  check('camp guide offline', true);
  await page.evaluate(() => (document.documentElement.lang = 'pt'));
  check('no uncaught errors', errors.length === 0, errors.join('|'));
  await browser.close();
} catch (e) { console.error(e); ok = false; }
srv.kill();
process.exit(ok ? 0 : 1);
