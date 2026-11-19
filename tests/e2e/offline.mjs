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
  // Almanac pages offline
  const go = async (h, sel) => { await page.goto(`http://localhost:${PORT}/#/${h}`); await page.waitForSelector(sel, { timeout: 5000 }); };
  await go('world/countries', 'details.card');
  const n = await page.$$eval('details.card', (e) => e.length);
  check('250 countries offline', n === 250, `(${n})`);
  await go('world/clock', '.big-num'); check('clock renders', /\d/.test(await page.textContent('.big-num')));
  await go('world/sun', 'h2'); check('sun/moon renders', (await page.textContent('main')).length > 100);
  await go('world/calendar', 'table.cal'); check('calendar renders', true);
  await go('world/climate', 'table.cal'); check('climate renders', true);
  await go('world/tables', 'table.cal'); check('tables render', true);
  await go('world/counter', 'h1'); check('counter renders', true);
  await go('prepare/kit/72h', 'input[type=checkbox]');
  await page.click('input[type=checkbox]'); await wait(400);
  await page.reload(); await page.waitForSelector('input[type=checkbox]');
  await wait(300);
  check('checklist persists offline (IndexedDB)', await page.$eval('input[type=checkbox]', (e) => e.checked));
  await go('tools/converter', 'input'); check('converter renders', true);
  await go('tools/timer', '.big-num'); check('timer renders', true);
  await go('prepare/family', 'h1'); check('family plan renders', true);
  await go('onboarding', 'h1'); check('onboarding renders', true);
  await go('search', 'input[type=search]'); await page.fill('input[type=search]', 'watr'); await page.waitForSelector('ul.list a');
  check('search tolerates typos offline', (await page.textContent('ul.list')).toLowerCase().includes('water'));
  check('no uncaught errors', errors.length === 0, errors.join('|'));
  await browser.close();
} catch (e) { console.error(e); ok = false; }
srv.kill();
process.exit(ok ? 0 : 1);
